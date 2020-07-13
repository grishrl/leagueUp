const passport = require('passport');
const BnetStrategy = require('passport-bnet');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/admin-models');
const jwt = require('jsonwebtoken');
const UserSub = require('../subroutines/user-subs');
const User = require('../models/user-models');
const logger = require('../subroutines/sys-logging-subs');
const mmrMethods = require('../methods/mmrMethods');
const util = require('../utils');
const archive = require('../methods/archivalMethods');
const _ = require('lodash');

var tokenExtractor = function(req) {
        let token = null;
        let header = req.headers.authorization;
        if (header) {
            const bearerStr = "Bearer ";
            header = header.replace(bearerStr, '');
            token = header;

        } else if (req.body.apiKey) {
            const apiKey = req.body.apiKey;
            delete req.body.apiKey;
            token = apiKey;

        } else if (req.query.apiKey) {
            const apiKey = req.query.apiKey;
            token = apiKey;

        }
        return token;
    }
    //options for our JWT
var jwtOptions = {
    jwtFromRequest: tokenExtractor,
    secretOrKey: process.env.jwtToken
}

//when we get requests we will handle the tokens received
passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    //we will find the user associated with this token and get their info from db
    //NOTE this will happen on all requests using the jwt strat
    User.findOne({ _id: jwt_payload.id }).then((reply) => {
        //we didnt find this user in the db
        if (!reply) {
            next(null, false);
        } else {
            //check if the user has any admin access
            Admin.AdminLevel.findOne({
                adminId: jwt_payload.id
            }).then((adminLevel) => {
                //if no admin access fast forward to next
                if (!adminLevel) {
                    next(null, reply);
                } else {
                    //this user has some admin access
                    adminLevel = adminLevel.toObject();
                    //convert the reply to object so we can work with it..
                    reply = reply.toObject();
                    //add admin level info into the reply
                    reply.adminLevel = adminLevel;
                    //generate a new token from this new compounded reply
                    let token = generateNewToken(reply, adminLevel);
                    //add the token to the reply object
                    reply.token = token;
                    //go to next method in chain
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
    //get the id returned blizz
    var id = profile.id.toString();
    //find user in db using that id
    User.findOne({ bNetId: id }).then((prof) => {

        logObj = {};
        logObj.logLevel = 'SYSTEM';
        logObj.timeStamp = new Date().getTime();
        logObj.location = ' authentication '

        //check if an existing users battle tag has changed
        //IF IT HAS, UPDATE IT!!!
        if (prof) {
            if (prof.displayName != profile.battletag) { //the profile matching the blizz id battletag does not match what we have in the db
                logObj.target = prof.displayName;
                //run the update username sub; attempt to rename their display and send this request back to client
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

        } else { //no profile was found -- must be a new user.

            var id = profile.id.toString();
            let userObj = {
                    displayName: profile.battletag,
                    bNetId: id
                }
                //check to see if this user is in the archive (IE this user deleted their NGS account and tried to recreate it)
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
                    //pass this partial object on to the create user object
                    createNewProfile(userObj, logObj, done);
                } else {
                    //no archive go ahead and create new
                    createNewProfile(userObj, logObj, done);
                }
            }, err => {
                //if something went wrong along the way create a new profile anyway
                createNewProfile(userObj, logObj, done)
            });


        }
    })
}));

//helper method to create a new profile
function createNewProfile(userObj, logObj, done) {
    //get the players MMRs!
    mmrMethods.comboMmr(userObj.displayName).then(
        processed => {
            //leaving this here in case it catches errors?? 
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

//helper method to generate new JWT token
function generateNewToken(prof, admin) {
    let tokenObject = {};
    tokenObject.teamInfo = {};
    tokenObject.teamInfo.teamName = prof.teamName;
    tokenObject.teamInfo.isCaptain = prof.isCaptain;
    tokenObject.teamInfo.teamId = prof.teamId;
    tokenObject.id = prof._id;
    tokenObject.displayName = prof.displayName;
    admin = util.objectify(admin);

    if (admin) {
        tokenObject.adminLevel = compressAdmin(admin);
    }

    var token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '78h'
    });
    return token;
}

//middleware helper function for log-in
function returnUserToClient(prof, done) {
    Admin.AdminLevel.findOne({
        adminId: prof._id
    }).then((admin) => {

        var token = generateNewToken(prof, admin);
        var reply = {
            token: token
        };
        done(null, reply);
    });
}

//helper method to remove unwanteds from the admin object
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