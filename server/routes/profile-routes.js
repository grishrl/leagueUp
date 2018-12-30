const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const TeamSub = require('../subroutines/team-subs');
const passport = require("passport");

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
            if (deleted.hasOwnProperty('teamName')) {
                let lower = deleted.teamName.toLowerCase();
                TeamSub.removeUser(lower, deleted.displayName);
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
        const path = 'user/save';
        var sentUser = req.body;
        var id = req.user._id.toString();
        //ensure saving requesting user is the user being saved
        if (req.user._id.toString() === sentUser._id) {
            User.findOne({ _id: req.user._id }).then(function(found) {
                if (found) {
                    //validate all the data before saving --

                    if (util.returnBoolByPath(sentUser, 'lookingForGroup')) {
                        found.lookingForGroup = sentUser.lookingForGroup
                    }
                    if (util.returnBoolByPath(sentUser, 'availability')) {
                        found.availability = {};
                        found.availability = sentUser.availability;
                    }

                    if (util.returnBoolByPath(sentUser, 'averageMmr')) {
                        found.averageMmr = sentUser.averageMmr;
                    }

                    if (util.returnBoolByPath(sentUser, 'competitiveLevel')) {
                        found.competitiveLevel = sentUser.competitiveLevel;
                    }
                    if (util.returnBoolByPath(sentUser, 'descriptionOfPlay')) {
                        found.descriptionOfPlay = sentUser.descriptionOfPlay;
                    }
                    if (util.returnBoolByPath(sentUser, 'role')) {
                        found.role = {};
                        found.role = sentUser.role;
                    }

                    if (util.returnBoolByPath(sentUser, 'timeZone')) {
                        found.timeZone = sentUser.timeZone
                    }
                    if (util.returnBoolByPath(sentUser, 'hlRankMetal')) {
                        found.hlRankMetal = sentUser.hlRankMetal
                    }
                    if (util.returnBoolByPath(sentUser, 'hlRankDivision')) {
                        found.hlRankDivision = sentUser.hlRankDivision
                    }
                    if (util.returnBoolByPath(sentUser, 'hotsLogsURL')) {
                        found.hotsLogsURL = sentUser.hotsLogsURL;
                    }

                    sendRes = false;

                    found.save(function(err, updatedUser) {
                        if (err) {
                            res.status(500).send(util.returnMessaging(path, 'Error saving user', err));
                        }

                        if (updatedUser) {
                            res.status(200).send(util.returnMessaging(path, 'User update successful', false, updatedUser));
                        }
                    });


                } else {
                    res.status(400).send(util.returnMessaging(path, 'User ID not found.', false));
                }
            })
        } else {
            res.status(401).send(util.returnMessaging(path, 'Unauthorized to mofify this profile.', false))
        }

    });


function removeUneeded(user) {
    if (user.hasOwnProperty('bNetId')) {
        delete user.bNetId;
    }
    return user;
}

module.exports = router;