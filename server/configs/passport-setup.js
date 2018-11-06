const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const BnetStrategy = require('passport-bnet');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/admin-models');
const jwt = require('jsonwebtoken');
const keys = require('./keys');
const User = require('../models/user-models');



// passport.serializeUser((user, done) => {
//     console.log('serializeUser user: ', user);
//     done(null, user._id);
// });

// passport.deserializeUser((user, done) => {
//     console.log('deserializeUser user ', user);
//     User.findById(user).then((found) => {
//         console.log('found ', found);
//         done(null, found);
//     });
// });
var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.session.jwtToken
}

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('inside the jwt strat');
    User.findOne({ _id: jwt_payload.id }).then((reply) => {
        if (!reply) {
            next(null, false);
        } else {
            Admin.findOne({
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
    clientID: keys.bNet.clientID,
    clientSecret: keys.bNet.clientSecret,
    callbackURL: "https://localhost:3443/auth/bnet/redirect",
    region: "us"
}, function(accessToken, refreshToken, profile, done) {

    var id = profile.id.toString()
    User.findOne({ bNetId: id }).then((prof) => {
        if (prof) {
            var token = jwt.sign({ id: prof._id }, keys.session.jwtToken);
            var reply = {
                displayName: prof.displayName,
                token: token
            }

            let teamInfo = prof.teamInfo;
            if (teamInfo) {
                reply.teamInfo = {};
                if (teamInfo.teamName) {

                    if (teamInfo.hasOwnProperty('isCaptain')) {

                        reply.teamInfo.isCaptain = prof.teamInfo.isCaptain;
                    }

                    reply.teamInfo.teamName = prof.teamInfo.teamName;
                }
            }

            done(null, reply);
        } else {
            var id = profile.id.toString();
            new User({
                displayName: profile.battletag,
                bNetId: id
            }).save().then((newUser) => {
                console.log('created new user: ' + newUser);
                var token = jwt.sign({ id: newUser._id }, keys.session.jwtToken)
                var reply = { displayName: newUser.displayName, token: token }
                done(null, reply);
            });
        }
    })
}));

// passport.use(new GoogleStrategy({
//     callbackURL: '/auth/google/redirect',
//     clientID: keys.google.clientID,
//     clientSecret: keys.google.clientSecret
// }, (accessToken, refreshToken, profile, done) => {
//     //check if profile exists all ready
//     User.findOne({ googleId: profile.id }).then((prof) => {
//         if (prof) {
//             console.log('user is:' + prof)
//             done(null, prof);
//         } else {
//             //this user did not exist yet;
//             new User({
//                 username: profile.displayName,
//                 googleId: profile.id
//             }).save().then((newUser) => {
//                 console.log('created new user: ' + newUser);
//                 done(null, newUser);
//             });
//         }
//     });

// }));