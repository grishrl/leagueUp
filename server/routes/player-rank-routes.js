const router = require('express').Router();
const util = require('../utils');
const passport = require("passport");
const prMethods = require('../methods/player-ranks/playerRankMethods');
const PlayerRankImageUpload = require('../methods/player-rank-upload');
const System = require('../models/system-models').system;
const levelRestrict = require("../configs/admin-leveling");
const User = require('../models/user-models');


//get playerrank required
router.get('/get/required', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = 'playerrank/get/required';

    System.findOne({
        dataName: "requiredRankInfo"
    }).then(
        found => {
            res.status(200).send(util.returnMessaging(path, 'Found data', null, found, null));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Failed to find data', err, null, null));
        }
    )


});

//get playerrank required
router.post('/upsert', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {

    const path = 'playerrank/upsert';

    let dataForUpsert = req.body.requiredRanks;

    if (!util.isNullOrEmpty(dataForUpsert)) {
        System.findOneAndUpdate({
            dataName: "requiredRankInfo"
        }, dataForUpsert, {
            new: true,
            upsert: true
        }).then(
            saved => {
                res.status(200).send(util.returnMessaging(path, "Upserted the required rank info.", false, saved, null, null));
            },
            err => {
                res.status(500).send(util.returnMessaging(path, "Upsert required rank info failed.", err, null, null, null));
            }
        );
    } else {
        res.status(500).send(util.returnMessaging(path, "Upsert required rank info failed.", null, null, null, null));
    }



});


//post
// path: /user/upload/avatar
// requires base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/upload', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = '/playerrank/upload';

    let userId = req.user._id;
    let dataURI = req.body.logo;
    let seasonInf = req.body.seasonInf;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'upload user avatar';
    logObj.target = req.user.displayName;
    logObj.logLevel = 'STD';


    /**
     * post object will have user id, season inf, img inf
     * this will need to be submitted to the pending queue and the image uploaded to s3
     */

    PlayerRankImageUpload.uploadRankImage(dataURI, userId, seasonInf).then(
        success => {
            res.status(200).send(util.returnMessaging(path, 'Uploaded to pending', null, success, null));
        },
        failure => {
            res.status(500).send(util.returnMessaging(path, 'Failed upload to pending', failure, null, null));
        }
    )


});

//post
// path: /user/upload/avatar
// requires base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/capt/upload', passport.authenticate('jwt', {
    session: false
}), confirmCanUpload, (req, res) => {

    const path = '/playerrank/capt/upload';


    let dataURI = req.body.logo;
    let seasonInf = req.body.seasonInf;
    let userId = req.body.userId;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'upload user avatar';
    logObj.target = req.user.displayName;
    logObj.logLevel = 'STD';


    /**
     * post object will have user id, season inf, img inf
     * this will need to be submitted to the pending queue and the image uploaded to s3
     */

    PlayerRankImageUpload.uploadRankImage(dataURI, userId, seasonInf).then(
        success => {
            res.status(200).send(util.returnMessaging(path, 'Uploaded to pending', null, success, null));
        },
        failure => {
            res.status(500).send(util.returnMessaging(path, 'Failed upload to pending', failure, null, null));
        }
    )


});


function confirmCanUpload(req, res, next) {
    const path = 'canUpload';

    var callingUser = req.user;
    var payloadUser = req.body.userId;


    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' validate caller ';
    logObj.logLevel = 'STD';
    logObj.target = payloadUser + ' : ';

    if (req.body.remove) {
        Team.findOne({
            teamName_lower: callingUser.teamName.toLowerCase()
        }).then((foundTeam) => {
            if (foundTeam) {
                User.findById(payloadUser).then(
                    found => {
                        if (found) {

                            let ind = _.findIndex(foundTeam.teamMembers, (teamMember) => {
                                if (teamMember.displayName == found.displayName) {
                                    return true;
                                }
                            })

                            if (callingUser.displayName == found.displayName || ind > -1) {
                                next();
                            } else {
                                logObj.logLevel = 'ERROR';
                                logObj.error = 'user was not authorized for action';
                                res.status(403).send(
                                    util.returnMessaging(path, "User not authorized remove.", false, null, null, logObj));
                            }
                        }
                    },
                    err => {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'there was a problem finding the user';
                        res.status(400).send(util.returnMessaging(path, "User not found.", false, null, null, logObj));
                    }
                )

            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'there was a problem finding the team';
                res.status(400).send(util.returnMessaging(path, "Team not found.", false, null, null, logObj));
            }
        }, (err) => {
            res.status(500).send(
                util.returnMessaging(path, "Error finding team", err, null, null, logObj)
            );
        });
    } else {
        next();
    }

}

module.exports = router;