const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const TeamSub = require('../subroutines/team-subs');
const System = require('../models/system-models').system;
const passport = require("passport");
const mmrMethods = require('../methods/mmrMethods');
const Stats = require('../models/stats-model');
const Avatar = require('../methods/avatarUpload');
const PendingAvatarQueue = require('../models/admin-models').PendingAvatarQueue;
const archiveUser = require('../methods/archivalMethods').archiveUser;

/*
/get
/delete
/save
*/

router.get('/get', (req, res) => {
    const path = '/user/get';
    var user = req.query.user;
    user = decodeURIComponent(user);
    User.findOne({ displayName: user }).lean().then(
        (foundUser) => {
            if (foundUser) {
                var temp = removeUneeded(foundUser);
                res.status(200).send(util.returnMessaging(path, 'User Found', false, temp));
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
}), util.appendResHeader, (req, res) => {
    const path = '/user/delete';

    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' delete user (self) profile ';
    logObj.target = req.user.displayName;
    logObj.logLevel = 'STD';


    archiveUser({
            displayName: req.user.displayName
        },
        req.user.displayName).then(
        response => {
            res.status(200).send(util.returnMessaging(path, 'User deleted!', null, response, null, logObj));
        },
        err => {
            res.stauts(500).send(util.returnMessaging(path, 'Error deleting user!', err, null, null, logObj));
        }
    );

});

router.post('/save', passport.authenticate('jwt', {
        session: false
    }), util.appendResHeader,
    function(req, res) {
        const path = 'user/save';

        var sentUser = req.body;

        //construct log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'user profile save ';
        logObj.target = sentUser.displayName;
        logObj.logLevel = 'STD';

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
                        if (found.teamName) {
                            TeamSub.updateTeamMmr(found.teamName);
                        }
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
                    if (util.returnBoolByPath(sentUser, 'toonId')) {
                        found.toonId = sentUser.toonId
                    }
                    if (util.returnBoolByPath(sentUser, 'discordTag')) {
                        found.discordTag = sentUser.discordTag
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
                    if (util.returnBoolByPath(sentUser, 'twitch')) {
                        found.twitch = sentUser.twitch;
                    }
                    if (util.returnBoolByPath(sentUser, 'twitter')) {
                        found.twitter = sentUser.twitter;
                    }
                    if (util.returnBoolByPath(sentUser, 'youtube')) {
                        found.youtube = sentUser.youtube;
                    }

                    sendRes = false;

                    found.save(function(err, updatedUser) {
                        if (err) {
                            logObj.logLevel = "ERROR"
                            res.status(500).send(util.returnMessaging(path, 'Error saving user', err, null, null, logObj));
                        }

                        if (updatedUser) {
                            res.status(200).send(util.returnMessaging(path, 'User update successful', false, updatedUser, null, logObj));
                        }
                    });


                } else {
                    logObj.error = 'User ID not found.';
                    res.status(400).send(util.returnMessaging(path, 'User ID not found.', false, null, null, logObj));
                }
            })
        } else {
            logObj.error = 'Unauthorized to mofify this profile.';
            res.status(403).send(util.returnMessaging(path, 'Unauthorized to mofify this profile.', false, null, null, logObj))
        }

    });


router.get('/update/mmr', passport.authenticate('jwt', {
        session: false
    }), util.appendResHeader,
    function(req, res) {
        const path = 'user/update/mmr';
        if (req.user.displayName) {
            mmrMethods.comboMmr(req.user.displayName).then(
                mmrResponse => {
                    User.findOne({ displayName: req.user.displayName }).then(found => {
                        if (found) {
                            found.hotsLogsPlayerID = mmrResponse.hotsLogs.playerId;
                            found.averageMmr = mmrResponse.hotsLogs.mmr;
                            found.heroesProfileMmr = mmrResponse.heroesProfile;
                            found.ngsMmr = mmrResponse.ngsMmr;
                            if (mmrResponse.heroesProfile < 0) {
                                found.lowReplays = true;
                            } else {
                                if (found.lowReplays) {
                                    found.lowReplays = false;
                                }
                            }
                            found.save().then(
                                saved => {
                                    res.status(200).send(util.returnMessaging(path, 'User Updated', null, null, saved));
                                },
                                err => {
                                    res.status(500).send(util.returnMessaging(path, 'Error saving user', err, null, null));
                                }
                            )
                        } else {
                            res.status(500).send(util.returnMessaging(path, 'User not found', null, null, found));
                        }
                    }, err => {
                        res.status(500).send(util.returnMessaging(path, 'Error finding user', err, null, null))
                    })
                }
            );
        }
    });

router.get('/frontPageStats', (req, res) => {

    const path = '/user/frontPageStats';
    var stat = req.query.stat;

    if (stat) {
        let query = {
            '$and': [{
                    'dataName': 'TopStatList'
                },
                {
                    'stat': stat
                }
            ]
        }

        System.findOne(query).then(
            found => {
                res.status(200).send(util.returnMessaging(path, 'Found stat', false, found));
            },
            err => {
                res.status(400).send(util.returnMessaging(path, 'Error getting stat.', err, null, null));
            }
        );
    } else {
        //stat not recieved
    }


});

router.get('/leagueOverallStats', (req, res) => {

    const path = '/user/leagueOverallStats';


    let query = {
        $and: [{
                dataName: "leagueRunningFunStats"
            },
            {
                span: "overall"
            }
        ]
    }

    System.findOne(query).then(
        found => {
            res.status(200).send(util.returnMessaging(path, 'Found stat', false, found));
        },
        err => {
            res.status(400).send(util.returnMessaging(path, 'Error getting stat.', err, null, null));
        }
    );



});

router.get('/statistics', (req, res) => {

    const path = '/user/statistics';
    var id = decodeURIComponent(req.query.id);

    User.findOne({ displayName: id }).then(
        found => {
            if (found) {
                let id = found._id.toString();
                Stats.find({ associateId: id }).then(
                    foundStats => {
                        res.status(200).send(util.returnMessaging(path, 'Found stat', false, foundStats));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error finding stats.', err, null, null));
                    }
                )
            } else {
                res.status(400).send(util.returnMessaging(path, 'User ID not found.', false, null, null, logObj));
            }
        },
        err => {
            res.status(400).send(util.returnMessaging(path, 'Error finding user.', err, null, null));
        }
    )


});

//post
// path: /user/upload/avatar
// requires base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/upload/avatar', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = '/user/upload/avatar';
    let uploadedFileName = "";


    let userId = req.user._id;
    console.log(userId);
    let dataURI = req.body.logo;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'upload user avatar';
    logObj.target = req.user.displayName;
    logObj.logLevel = 'STD';
    PendingAvatarQueue.find({
        userId: userId
    }).then(
        found => {
            // console.log('deleting other pending avatar queues ');
            for (var i = 0; i < found.length; i++) {
                // console.log(found[i]);
                Avatar.deleteFile(found[i].fileName);
                PendingAvatarQueue.findByIdAndDelete(found[i]._id).then(
                    deleted => {
                        // console.log(deleted);
                    },
                    err => {
                        console.log(err);
                    }
                );
            }
        },
        err => {
            console.log('err ', err);
        }
    );
    Avatar.uploadAvatar(path, dataURI, req.user.displayName).then(rep => {
            new PendingAvatarQueue({
                userId: userId,
                fileName: rep.fileName,
                timestamp: Date.now()
            }).save().then(
                saved => {
                    res.status(200).send(util.returnMessaging(path, "Image Sent to Pending Queue.", false, rep.eo, saved, logObj));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, "Error Image not Sent to Pending Queue.", err, false, false, logObj))
                }
            )

        },
        err => {
            res.status(500).send(util.returnMessaging(path, err.message, err, null, null, logObj))
        });


});


function removeUneeded(user) {
    if (user.hasOwnProperty('bNetId')) {
        delete user.bNetId;
    }
    return user;
}

module.exports = router;