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
const request = require('request');



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
            let btag = routeFriendlyUsername(profile.battletag);
            let reqURL = 'https://api.hotslogs.com/Public/Players/1/';
            request(reqURL + btag, { json: true }, (err, res, body) => {
                if (err) { console.log(err) };
                if (body.hasOwnProperty('LeaderboardRankings')) {

                    var inc = 0
                    var totalMMR = 0;
                    var avgMMR = 0;
                    body['LeaderboardRankings'].forEach(element => {
                        if (element['GameMode'] != 'QuickMatch') {
                            if (element['CurrentMMR'] > 0) {
                                inc += 1;
                                totalMMR += element.CurrentMMR;
                            }
                        }
                    });
                    avgMMR = Math.round(totalMMR / inc);
                } else {
                    if (body.hasOwnProperty('Message')) {
                        if (res['Message'].indexOf('invalid') > -1) {
                            return 'error';
                        }
                    }
                }

                var id = profile.id.toString();
                let userObj = {
                    displayName: profile.battletag,
                    bNetId: id
                }
                if (body.hasOwnProperty('PlayerID')) {
                    userObj.hotsLogsPlayerID = body['PlayerID'];
                }
                if (avgMMR > 0) {
                    userObj.averageMmr = avgMMR;
                }
                new User(userObj).save().then((newUser) => {
                    logObj.action = ' new user was created ';
                    logObj.target = newUser.displayName;
                    logger(logObj);
                    returnUserToClient(newUser, done);
                });
            });

        }
    })
}));

function routeFriendlyUsername(username) {
    if (username != null && username != undefined) {
        return username.replace('#', '_');
    } else {
        return '';
    }
}

function generateNewToken(prof, admin) {
    let tokenObject = {};
    tokenObject.teamInfo = {};
    tokenObject.teamInfo.teamName = prof.teamName;
    tokenObject.teamInfo.isCaptain = prof.isCaptain;
    tokenObject.id = prof._id;
    tokenObject.displayName = prof.displayName;
    if (admin) {
        tokenObject.adminLevel = [];
        let keys = Object.keys(admin);
        keys.forEach(key => {
            if (key == 'adminId' || key == '__v' || key == '_id' || key == 'info') {} else if (admin[key] == true) {
                let obj = {};
                obj[key] = admin[key];
                tokenObject.adminLevel.push(obj);
            }
        });
    }

    var token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '2h'
    });
    return token;
}

function returnUserToClient(prof, done) {
    let tokenObject = {};
    tokenObject.teamInfo = {};
    tokenObject.teamInfo.teamName = prof.teamName;
    tokenObject.teamInfo.isCaptain = prof.isCaptain;
    tokenObject.id = prof._id;
    tokenObject.displayName = prof.displayName;
    Admin.AdminLevel.findOne({
        adminId: prof._id
    }).then((admin) => {
        if (admin) {
            tokenObject.adminLevel = [];
            let keys = Object.keys(admin.toObject());
            keys.forEach(key => {
                if (key == 'adminId' || key == '__v' || key == '_id' || key == 'info') {} else if (admin[key] == true) {
                    let obj = {};
                    obj[key] = admin[key];
                    tokenObject.adminLevel.push(obj);
                }
            });
        }
        var token = jwt.sign(tokenObject, process.env.jwtToken, { expiresIn: '2h' });
        var reply = {
            token: token
        };
        done(null, reply);
    });
}