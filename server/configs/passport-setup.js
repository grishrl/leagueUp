const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const BnetStrategy = require('passport-bnet');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/admin-models');
const jwt = require('jsonwebtoken');
// const keys = require('./keys');
const User = require('../models/user-models');



var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.jwtToken
}

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('inside the jwt strat');
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

    console.log('returned from bnet ', profile);

    var id = profile.id.toString()
    User.findOne({ bNetId: id }).then((prof) => {
        //TODO: IMPLEMENT A CHECK TO MAKE SURE THE USERS DISPLAY NAME HAS NOT CHANGED!!
        //IF IT HAS, UPDATE IT!!!
        if (prof) {
            var token = jwt.sign({ id: prof._id }, process.env.jwtToken);
            var reply = {
                displayName: prof.displayName,
                token: token
            }
            reply.teamInfo = {};
            reply.teamInfo.teamName = prof.teamName;
            reply.teamInfo.isCaptain = prof.isCaptain;

            done(null, reply);
        } else {
            var id = profile.id.toString();
            new User({
                displayName: profile.battletag,
                bNetId: id
            }).save().then((newUser) => {
                console.log('created new user: ' + newUser);
                var token = jwt.sign({ id: newUser._id }, process.env.jwtToken)
                var reply = { displayName: newUser.displayName, token: token }
                done(null, reply);
            });
        }
    })
}));