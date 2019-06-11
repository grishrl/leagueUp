const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const BnetStrategy = require('passport-bnet');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/admin-models');
const jwt = require('jsonwebtoken');
const UserSub = require('../subroutines/user-subs');
// const keys = require('./keys');
const User = require('../models/user-models');
const logger = require('../subroutines/sys-logging-subs');
const mmrMethods = require('../methods/mmrMethods');
const util = require('../utils');
const archive = require('../methods/archivalMethods');
const _ = require('lodash');


var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.jwtToken
}

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    User.findOne({ _id: jwt_payload.id }).then((reply) => {
        if (!reply) {
            next(null, false);
        } else {
            Admin.AdminLevel.findOne({
                adminId: jwt_payload.id
            }).then((adminLevel) => {
                if (!adminLevel) {
                    next(null, reply);
                } else {
                    adminLevel = adminLevel.toObject();
                    reply = reply.toObject();
                    reply.adminLevel = adminLevel;
                    let token = generateNewToken(reply, adminLevel);
                    reply.token = token;
                    next(null, reply);
                };
            })
        }
    });
}));

// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
    clientID: process.env.bNetClientID,
    clientSecret: process.env.bNetClientSecret,
    callbackURL: process.env.bNetRedirect,
    region: "us"
}, function(accessToken, refreshToken, profile, done) {

    var id = profile.id.toString()
    User.findOne({ bNetId: id }).then((prof) => {

        logObj = {};
        logObj.logLevel = 'SYSTEM';
        // logObj.target = prof.displayName;
        logObj.timeStamp = new Date().getTime();
        logObj.location = ' authentication '

        //check if an existing users battle tag has changed
        //IF IT HAS, UPDATE IT!!!
        if (prof) {
            if (prof.displayName != profile.battletag) {
                logObj.target = prof.displayName;
                UserSub.updateUserName(prof._id, profile.battletag).then(
                    (updatedUser) => {
                        logObj.action = ' an existing user changed their battletag attempted to clean up '
                        logger(logObj)
                        returnUserToClient(updatedUser, done);
                    }, (err) => {
                        logObj.action = ' an existing user changed their battletag attempted to clean up '
                        logObj.error = ' an error occured in the process '
                        returnUserToClient(null, done);
                    })
            } else {
                //battletag matches what was in the database
                returnUserToClient(prof, done);
            }


        } else {

            var id = profile.id.toString();
            let userObj = {
                    displayName: profile.battletag,
                    bNetId: id
                }
                //check to see if this user is in the archive
            archive.retrieveAndRemoveArchiveUser({
                bNetId: id
            }).then(found => {
                if (found) {
                    //if there was a user in the archive; we'll pick some data we want to restore
                    if (found.smurfAccount) {
                        //dont wanna lose those smurfs!
                        userObj.smurfAccount = found.smurfAccount;
                    }
                    if (found.history) {
                        userObj.history = found.history;
                    }
                    if (found.replays) {
                        userObj.replays = found.replays;
                    }
                    logObj.action += ' restored from archive ';
                    createNewProfile(userObj, logObj);
                } else {
                    //no archive go ahead and create new
                    createNewProfile(userObj, logObj);
                }
            }, err => {
                createNewProfile(userObj, logObj)
            });


        }
    })
}));

function createNewProfile(userObj, logObj) {
    //get the players MMRs!
    mmrMethods.comboMmr(userObj.displayName).then(
        processed => {
            if (util.returnBoolByPath(processed, 'hotsLogs')) {
                userObj.averageMmr = processed.hotsLogs.mmr;
                userObj.hotsLogsPlayerID = processed.hotsLogs.playerId;
            }

            if (util.returnBoolByPath(processed, 'heroesProfile')) {
                if (processed.heroesProfile >= 0) {
                    userObj.heroesProfileMmr = processed.heroesProfile;
                } else {
                    userObj.heroesProfileMmr = -1 * processed.heroesProfile;
                    userObj.lowReplays = true;
                }
            }

            if (util.returnBoolByPath(processed, 'ngsMmr')) {
                userObj.ngsMmr = processed.ngsMmr;
            }
            new User(userObj).save().then((newUser) => {
                logObj.action = ' new user was created ';
                logObj.target = newUser.displayName;
                logger(logObj);
                returnUserToClient(newUser, done);
            });
        }, err => {
            new User(userObj).save().then((newUser) => {
                logObj.action = ' new user was created ';
                logObj.target = newUser.displayName;
                logObj.error = 'mmr gathering errors!';
                logger(logObj);
                returnUserToClient(newUser, done);
            });
        });
}

function generateNewToken(prof, admin) {
    let tokenObject = {};
    tokenObject.teamInfo = {};
    tokenObject.teamInfo.teamName = prof.teamName;
    tokenObject.teamInfo.isCaptain = prof.isCaptain;
    tokenObject.id = prof._id;
    tokenObject.displayName = prof.displayName;
    if (admin) {
        tokenObject.adminLevel = compressAdmin(admin);
    }

    var token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '24h'
    });
    return token;
}

function returnUserToClient(prof, done) {
    let tokenObject = {};
    tokenObject.teamInfo = {};
    tokenObject.teamInfo.teamName = prof.teamName;
    tokenObject.teamInfo.isCaptain = prof.isCaptain;
    tokenObject.teamInfo.teamId = prof.teamId;
    tokenObject.id = prof._id;
    tokenObject.displayName = prof.displayName;
    Admin.AdminLevel.findOne({
        adminId: prof._id
    }).then((admin) => {
        if (admin) {
            tokenObject.adminLevel = compressAdmin(admin.toObject());
        }
        var token = jwt.sign(tokenObject, process.env.jwtToken, { expiresIn: '2h' });
        var reply = {
            token: token
        };
        done(null, reply);
    });
}

function compressAdmin(obj) {
    let retVal = [];
    _.forEach(obj, (value, key) => {
        if (key == 'adminId' || key == '__v' || key == '_id' || key == 'info') {

        } else if (value == true) {
            let tempObj = {};
            tempObj[key] = value;
            retVal.push(tempObj);
        }
    });
    return retVal;
}