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


        //TODO: IMPLEMENT A CHECK TO MAKE SURE THE USERS DISPLAY NAME HAS NOT CHANGED!!
        //IF IT HAS, UPDATE IT!!!
        if (prof) {
            if (prof.displayName != profile.battletag) {
                UserSub.updateUserName(prof._id, profile.battletag).then(
                    (updatedUser) => {
                        returnUserToClient(updatedUser, done);
                    }, (err) => {
                        returnUserToClient(null, done);
                    })
            } else {
                //battletag matches what was in the database
                returnUserToClient(prof, done);
            }


        } else {
            var id = profile.id.toString();
            new User({
                displayName: profile.battletag,
                bNetId: id
            }).save().then((newUser) => {
                // console.log('created new user: ' + newUser); -- TODO: replace this with a logger
                returnUserToClient(newUser, done);
            });
        }
    })
}));

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