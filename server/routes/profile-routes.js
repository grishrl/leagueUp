const utils = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const TeamSub = require('../subroutines/team-subs');
const System = require('../models/system-models').system;
const passport = require("passport");
const mmrMethods = require('../methods/mmrMethods');
const Avatar = require('../methods/avatarUpload');
const PendingAvatarQueue = require('../models/admin-models').PendingAvatarQueue;
const archiveUser = require('../methods/archivalMethods').archiveUser;
const hpAPI = require('../methods/heroesProfileAPI');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const {
    commonResponseHandler,
    requireOneInput,
    returnInvalidInputsMessage
} = require('./../commonResponseHandler');
const { DataExchange } = require('aws-sdk');

/*
/get
/delete
/save
*/

router.get('/get', (req, res) => {
    const path = '/user/get';

    const optionalParameters = [{
        name: 'user',
        type: 'string'
    }, {
        name: 'userId',
        type: 'string'
    }, {
        name: 'userIds',
        type: 'string'
    }, {
        name: 'users',
        type: 'string'
    }]

    commonResponseHandler(req, res, [], optionalParameters, async(req, res, requiredParams, optionalParameters) => {
        const response = {};
        if (requireOneInput(optionalParameters)) {

            let query = {};
            let single = true;
            if (optionalParameters.user.valid) {
                // var user = req.query.user;
                // user = decodeURIComponent(user);
                query['displayName'] = optionalParameters.user.value;
            } else if (optionalParameters.userId.valid) {
                // var id = optionalParameters.userId;
                // id = decodeURIComponent(id);
                query['_id'] = optionalParameters.userId.value;
            } else if (optionalParameters.userIds.valid) {
                single = false;
                // var idarr = decodeURIComponent(optionalParameters.userIds).split(',');
                var idarr = optionalParameters.userIds.value.split(',');
                query['_id'] = {
                    $in: idarr
                };
            } else if (optionalParameters.users.valid) {
                single = false;
                // var idarr = decodeURIComponent(optionalParameters.users).split(',');
                var idarr = optionalParameters.users.value.split(',');
                query['displayName'] = {
                    $in: idarr
                };
            }

            return User.find(query).lean().then(
                (foundUser) => {
                    if (foundUser) {
                        var temp = removeUneeded(foundUser);
                        response.status = 200;
                        if (single) {
                            temp = temp[0];
                        }
                        response.message = utils.returnMessaging(req.originalUrl, 'User Found', false, temp)
                        return response;
                    } else {
                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, 'User not found', false, {});
                        return response;
                    }
                }, (err) => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error querying users', err);
                    return response;
                }
            )


        } else {
            return returnInvalidInputsMessage(req, optionalParameters);
        }

    })

});

router.get('/delete', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = '/user/delete';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};

        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' delete user (self) profile ';
        logObj.target = req.user.displayName;
        logObj.logLevel = 'STD';


        return archiveUser({ displayName: req.user.displayName }, req.user.displayName).then(
            response => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'User deleted!', null, response, null, logObj);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error deleting user!', err, null, null, logObj);
                return response
            }
        );

    })

});

router.post('/save', passport.authenticate('jwt', {
        session: false
    }), utils.appendResHeader,
    function(req, res) {
        const path = 'user/save';


        commonResponseHandler(req, res, [], [], async(req, res) => {
            const response = {};

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
                return User.findOne({
                    _id: req.user._id
                }).then(function(found) {
                    if (found) {
                        //validate all the data before saving --

                        if (utils.returnBoolByPath(sentUser, 'lookingForGroup')) {
                            found.lookingForGroup = sentUser.lookingForGroup
                        }
                        if (utils.returnBoolByPath(sentUser, 'availability')) {
                            found.availability = {};
                            found.availability = sentUser.availability;
                        }

                        if (utils.returnBoolByPath(sentUser, 'averageMmr')) {
                            found.averageMmr = sentUser.averageMmr;
                            if (found.teamName) {
                                TeamSub.updateTeamMmrAsynch(found.teamName);
                            }
                        }

                        if (utils.returnBoolByPath(sentUser, 'competitiveLevel')) {
                            found.competitiveLevel = sentUser.competitiveLevel;
                        }
                        if (utils.returnBoolByPath(sentUser, 'descriptionOfPlay')) {
                            found.descriptionOfPlay = sentUser.descriptionOfPlay;
                        }
                        if (utils.returnBoolByPath(sentUser, 'role')) {
                            found.role = {};
                            found.role = sentUser.role;
                        }

                        if (utils.returnBoolByPath(sentUser, 'timeZone')) {
                            found.timeZone = sentUser.timeZone
                        }
                        if (utils.returnBoolByPath(sentUser, 'toonId')) {
                            found.toonId = sentUser.toonId
                        }
                        if (utils.returnBoolByPath(sentUser, 'discordTag')) {
                            found.discordTag = sentUser.discordTag
                        }
                        if (utils.returnBoolByPath(sentUser, 'hlRankMetal')) {
                            found.hlRankMetal = sentUser.hlRankMetal
                        }
                        if (utils.returnBoolByPath(sentUser, 'hlRankDivision')) {
                            found.hlRankDivision = sentUser.hlRankDivision
                        }
                        //leaving this here, just in case it catches and prevents any errors
                        if (utils.returnBoolByPath(sentUser, 'hotsLogsURL')) {
                            found.hotsLogsURL = sentUser.hotsLogsURL;
                        }
                        if (utils.returnBoolByPath(sentUser, 'twitch')) {
                            found.twitch = sentUser.twitch;
                        }
                        if (utils.returnBoolByPath(sentUser, 'twitter')) {
                            found.twitter = sentUser.twitter;
                        }
                        if (utils.returnBoolByPath(sentUser, 'youtube')) {
                            found.youtube = sentUser.youtube;
                        }
                        if (utils.returnBoolByPath(sentUser, 'casterName')) {
                            found.casterName = sentUser.casterName;
                        }
                        if (utils.returnBoolByPath(sentUser, 'groupMaker')) {
                            found.groupMaker = sentUser.groupMaker;
                        }

                        sendRes = false;

                        return found.save().then(
                            updatedUser => {
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'User update successful', false, updatedUser, null, logObj);
                                return response;
                            },
                            err => {
                                logObj.logLevel = "ERROR"
                                response.status = 500;
                                response.message = utils.returnMessaging(req.originalUrl, 'Error saving user', err, null, null, logObj);
                                return response;
                            }
                        )

                    } else {
                        logObj.error = 'User ID not found.';
                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, 'User ID not found.', false, null, null, logObj)
                        return response;
                    }
                })
            } else {
                logObj.error = 'Unauthorized to modify this profile.';
                response.status = 403;
                response.message = utils.returnMessaging(req.originalUrl, 'Unauthorized to modify this profile.', false, null, null, logObj);
                return response;
            }

        });

    });


router.get('/update/mmr', passport.authenticate('jwt', {
        session: false
    }), utils.appendResHeader,
    function(req, res) {
        const path = 'user/update/mmr';

        if (req.user.displayName) {
            commonResponseHandler(req, res, [], [], async(req, res) => {
                const response = {};
                return mmrMethods.comboMmr(req.user.displayName).then(
                    mmrResponse => {
                        return User.findOne({
                            displayName: req.user.displayName
                        }).then(found => {
                            if (found) {
                                //leaving these here in case by being here they might catch any errors.
                                if (mmrResponse.hotsLogs && mmrResponse.hotsLogs.playerId) {
                                    found.hotsLogsPlayerID = mmrResponse.hotsLogs.playerId;
                                }
                                if (mmrResponse.hotsLogs && mmrResponse.hotsLogs.mmr) {
                                    found.averageMmr = mmrResponse.hotsLogs.mmr;
                                }
                                if (mmrResponse.heroesProfile) {
                                    found.heroesProfileMmr = mmrResponse.heroesProfile;
                                }
                                if (mmrResponse.ngsMmr) {
                                    found.ngsMmr = mmrResponse.ngsMmr;
                                }

                                if (mmrResponse.heroesProfile < 0) {
                                    found.lowReplays = true;
                                } else {
                                    if (found.lowReplays) {
                                        found.lowReplays = false;
                                    }
                                }
                                return found.save().then(
                                    saved => {
                                        response.status = 200;
                                        response.message = utils.returnMessaging(req.originalUrl, 'User Updated', null, null, saved);
                                        return response;
                                    },
                                    err => {
                                        response.status = 500;
                                        response.message = utils.returnMessaging(req.originalUrl, 'Error saving user', err, null, null);
                                        return response;
                                    }
                                )
                            } else {
                                response.status = 500;
                                response.message = utils.returnMessaging(req.originalUrl, 'User not found', null, null, found)
                                return response;
                            }
                        }, err => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error finding user', err, null, null);
                            return response;
                        })
                    }
                );
            })
        } else {
            res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error updatng', err, null, null))
        }
    });

//needs to be moved to own API
router.get('/frontPageStats', async(req, res) => {

    const path = '/user/frontPageStats';

    const requiredParameters = [{
        name: 'stat',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let query = {
            '$and': [{
                    'dataName': 'TopStatList'
                },
                {
                    'span': currentSeasonInfo.value
                },
                {
                    'stat': requiredParameters.stat.value
                }
            ]
        }

        return System.findOne(query).then(
            found => {
                response.status = 200
                response.message = utils.returnMessaging(req.originalUrl, 'Found stat', false, found)
                return response;
            },
            err => {
                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting stat.', err, null, null);
                return response;
            }
        );
    })

});

//needs to be moved to own API
router.get('/leagueOverallStats', (req, res) => {

    const path = '/user/leagueOverallStats';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let query = {
            $and: [{
                    dataName: "leagueRunningFunStats"
                },
                {
                    span: "overall"
                }
            ]
        }

        return System.findOne(query).then(
            found => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found stat', false, found);
                return response;
            },
            err => {
                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting stat.', err, null, null);
                return response;
            }
        );

    })


});

const queue = {};
var pathBusy = false;

router.get('/hero-profile/path', (req, res) => {

    const path = 'user/hero-profile/path';



    const requiredParameters = [{
        name: 'displayName',
        type: 'string'
    }]

    if (pathBusy) {

    } else {
        const start = Date.now();
        commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
            const response = {};
            return hpAPI.playerProfile(requiredParameters.displayName.value).then(
                (resp) => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found.', null, resp);
                    return response;
                },
                (err) => {
                    console.log(`${path} error... ${start-Date.now()} ms, returning..`);
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Not Found.', err);
                    return response;
                }
            )
        })
    }



});

//post
// path: /user/upload/avatar
// requires base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/upload/avatar', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    //TODO: replace with new client to s3 methods, maybe

    const path = '/user/upload/avatar';


    const requiredParameters = [{
        name: 'logo',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        //construct log object
        let userId = req.user._id;
        let dataURI = requiredParameters.logo.value;
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'upload user avatar';
        logObj.target = req.user.displayName;
        logObj.logLevel = 'STD';
        //create or otherwise handle and current pending avatar queue items; 
        PendingAvatarQueue.find({
            userId: userId
        }).then(
            found => {
                for (var i = 0; i < found.length; i++) {
                    Avatar.deleteAvatar(found[i].fileName);
                    PendingAvatarQueue.findByIdAndDelete(found[i]._id).then(
                        deleted => {
                            //empty return from promise
                        },
                        err => {
                            utils.errLogger(req.originalUrl, err, 'PendingAvatarQueue.findByIdAndDelete');
                        }
                    );
                }
            },
            err => {
                utils.errLogger(req.originalUrl, err);
            }
        );

        return Avatar.uploadAvatar(dataURI, req.user.displayName).then(rep => {
                return new PendingAvatarQueue({
                    userId: userId,
                    displayName: req.user.displayName,
                    fileName: rep.fileName,
                    timestamp: Date.now()
                }).save().then(
                    saved => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, "Image Sent to Pending Queue.", false, rep.eo, saved, logObj);
                        return response;
                    },
                    err => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, "Error Image not Sent to Pending Queue.", err, false, false, logObj);
                        return response;
                    }
                )

            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, err.message, err, null, null, logObj)
                return response;
            });

    });

});


function removeUneeded(user) {
    if (Array.isArray(user)) {
        user.forEach(u => {
            if (u.hasOwnProperty('bNetId')) {
                delete u.bNetId;
            }
        })
    } else {
        if (user.hasOwnProperty('bNetId')) {
            delete user.bNetId;
        }
    }

    return user;
}

module.exports = router;