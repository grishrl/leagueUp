const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const TeamSub = require('../subroutines/team-subs');
const passport = require("passport");

const authCheck = (req, res, next) => {
    console.log(req.user);
    if (!req.user) {
        console.log('unauthenticated!');
        //if user is not logged in:
        res.redirect('/');
    } else {
        next();
    }
}

router.get('/get', (req, res) => {
    var user = req.query.user;
    user = decodeURIComponent(user);
    User.findOne({ displayName: user }).lean().then(
        (foundUser) => {
            if (foundUser) {
                var temp = removeUneeded(foundUser);
                res.status(200).send(temp);
            } else {
                res.status(400).send({ "message": "User not found" });
            }
        }, (err) => {
            res.status(500).send({ "message": "Error querying users.", "error": err });
        }
    )
});

router.get('/delete', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/user/delete';
    let user = req.user;

    if (req.user.teamInfo.isCaptain) {
        res.status(400).send(util.returnMessaging(path, 'Cannot delete team captain'));
    } else {
        User.findOneAndDelete({ displayName: user.displayName }).then((deleted) => {
            res.status(200).send(util.returnMessaging(path, 'User deleted', false, deleted));
            if (deleted.hasOwnProperty('teamInfo')) {
                if (deleted.teamInfo.hasOwnProperty('teamName')) {
                    let lower = deleted.teamInfo.teamName.toLowerCase();
                    TeamSub.removeUser(lower, deleted.displayName);
                }
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error querying user', err));
        })
    }
});

router.post('/save', passport.authenticate('jwt', {
        session: false
    }),
    function(req, res) {
        var status = 200;
        var message = "";

        var sentUser = req.body;
        var id = req.user._id.toString();

        console.log(id, " === ", sentUser._id)
        if (req.user._id.toString() === sentUser._id) {
            User.findOne({ _id: req.user._id }).then(function(found) {
                if (found) {
                    //validate all the data before saving --

                    if (!util.isNullOrEmpty(sentUser.lookingForGroup)) {
                        found.lookingForGroup = sentUser.lookingForGroup
                    }

                    if (sentUser.lfgDetails.hasOwnProperty('availability')) {
                        console.log('you are here!');
                        var days = Object.keys(sentUser.lfgDetails.availability)
                        days.forEach(function(day) {
                            console.log('day ', day);
                            var dayObj = sentUser.lfgDetails.availability[day];
                            console.log('dayObj ', dayObj)
                            console.log('!util.isNullOrEmpty(dayObj) ', !util.isNullOrEmpty(dayObj));
                            console.log('dayObj.availability ', dayObj.availability)

                            if (!util.isNullOrEmpty(dayObj) && dayObj.available) {
                                if (!found.lfgDetails) {
                                    found.lfgDetails = {};
                                }
                                if (!found.lfgDetails.availability) {
                                    found.lfgDetails.availability = {};
                                }
                                if (!found.lfgDetails.availability[day]) {
                                    found.lfgDetails.availability[day] = {};
                                }
                                found.lfgDetails.availability[day].available = dayObj.available;
                                found.lfgDetails.availability[day].startTime = dayObj.startTime;
                                found.lfgDetails.availability[day].endTime = dayObj.endTime;
                            }
                        });
                    }

                    console.log('sentUser.lfgDetails.averageMmr ', sentUser.lfgDetails.averageMmr);
                    if (!util.isNullOrEmpty(sentUser.lfgDetails.averageMmr)) {
                        found.lfgDetails.averageMmr = sentUser.lfgDetails.averageMmr;
                    }

                    if (!util.isNullOrEmpty(sentUser.lfgDetails.competitiveLevel)) {
                        if (!found.lfgDetails) {
                            found.lfgDetails = {};
                        }
                        found.lfgDetails.competitiveLevel = sentUser.lfgDetails.competitiveLevel;
                    }
                    if (!util.isNullOrEmpty(sentUser.lfgDetails.descriptionOfPlay)) {
                        if (!found.lfgDetails) {
                            found.lfgDetails = {};
                        }
                        found.lfgDetails.descriptionOfPlay = sentUser.lfgDetails.descriptionOfPlay;
                    }
                    if (!util.isNullOrEmpty(sentUser.lfgDetails.role)) {
                        if (!found.lfgDetails) {
                            found.lfgDetails = {};
                        }
                        if (!found.lfgDetails.role) {
                            found.lfgDetails.role = {
                                "tank": false,
                                "assassin": false,
                                "support": false,
                                "offlane": false,
                                "specialist": false
                            };
                        }
                        var roles = Object.keys(sentUser.lfgDetails.role);
                        roles.forEach(function(role) {
                            found.lfgDetails.role[role] = sentUser.lfgDetails.role[role];
                        });
                    }

                    if (!util.isNullOrEmpty(sentUser.lfgDetails.timeZone)) {
                        if (!found.lfgDetails) {
                            found.lfgDetails = {};
                        }
                        found.lfgDetails.timeZone = sentUser.lfgDetails.timeZone
                    }
                    if (!util.isNullOrEmpty(sentUser.lfgDetails.heroLeague)) {
                        if (!found.lfgDetails) {
                            found.lfgDetails = {};
                        }
                        if (!found.lfgDetails.heroLeague) {
                            found.lfgDetails.heroLeague = {};
                        }
                        var keys = Object.keys(sentUser.lfgDetails.heroLeague);
                        keys.forEach(function(key) {
                            console.log(key);
                            found.lfgDetails.heroLeague[key] = sentUser.lfgDetails.heroLeague[key];
                        });
                    }
                    if (!util.isNullOrEmpty(sentUser.lfgDetails.hotsLogsURL)) {
                        if (!found.lfgDetails) {
                            found.lfgDetails = {};
                        }
                        found.lfgDetails.hotsLogsURL = sentUser.lfgDetails.hotsLogsURL;
                    }
                    if (!util.isNullOrEmpty(sentUser.teamInfo)) {
                        if (!foundUser.teamInfo) {
                            foundUser.teamInfo = {};
                        }
                        var keys = Object.keys(sentUser.teamInfo);
                        keys.forEach(function(key) {
                            found.teamInfo[key] = sentUser.teamInfo[key];
                        });
                    }
                    console.log('? ? ?');
                    sendRes = false;

                    found.save(function(err, updatedUser) {
                        if (err) {
                            console.log('error saving: ', err);
                            res.status(500).send('Nope');
                        }

                        if (updatedUser) {
                            res.status(200).send({ "udpated": true })
                        }
                    });


                } else {
                    status = 500;
                    message = "User ID not found.";
                }
            })
        } else {
            status = 401;
            message = "Unauthorized to mofify this profile.";
        }

    }
);


function removeUneeded(user) {
    if (user.hasOwnProperty('bNetId')) {
        delete user.bNetId;
    }
    return user;
}

module.exports = router;