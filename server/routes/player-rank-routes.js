const router = require('express').Router();
const utils = require('../utils');
const passport = require("passport");
const prMethods = require('../methods/player-ranks/playerRankMethods');
const Team = require('../models/team-models');
const PlayerRankImageUpload = require('../methods/player-rank-upload');
const System = require('../models/system-models').system;
const levelRestrict = require("../configs/admin-leveling");
const User = require('../models/user-models');
const {
    commonResponseHandler
} = require('./../commonResponseHandler');
const playerRankMethods = require('../methods/player-ranks/playerRankMethods');
const _ = require('lodash');


//get playerrank required
router.get('/get/required', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = 'playerrank/get/required';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return System.findOne({
            dataName: "requiredRankInfo"
        }).then(
            found => {
                response.status = 200;
                response.message = utils.returnMessaging(path, 'Found data', null, found, null);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(path, 'Failed to find data', err, null, null);
                return response;
            }
        );
    });
});

//get playerrank required
router.post('/upsert', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {

    const path = 'playerrank/upsert';

    const requiredParameters = [{
        name: 'requiredRanks',
        type: 'object'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let dataForUpsert = requiredParameters.requiredRanks.value;
        return System.findOneAndUpdate({
            dataName: "requiredRankInfo"
        }, dataForUpsert, {
            new: true,
            upsert: true
        }).then(
            saved => {
                response.status = 200;
                response.message = utils.returnMessaging(path, "Upserted the required rank info.", false, saved, null, null);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(path, "Upsert required rank info failed.", err, null, null, null)
                return response;
            }
        );
    });

});


//post
// path: /user/upload/avatar
// requires base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/upload', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    //TODO: replace with client direct to s3 upload, maybe

    const path = '/playerrank/upload';

    const requiredParameters = [{
        name: 'logo',
        type: 'string'
    }, {
        name: 'seasonInf',
        type: 'object'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let userId = req.user._id;
        let dataURI = requiredParameters.logo.value;
        let seasonInf = requiredParameters.seasonInf.value;

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
        return PlayerRankImageUpload.uploadRankImage(dataURI, userId, seasonInf).then(
            success => {
                response.status = 200;
                response.message = utils.returnMessaging(path, 'Uploaded to pending', null, success, null);
                return response;
            },
            failure => {
                response.status = 500;
                response.message = utils.returnMessaging(path, 'Failed upload to pending', failure, null, null);
                return response;
            }
        );
    })


});

//post
// path: /user/upload/avatar
// requires base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/capt/upload', passport.authenticate('jwt', {
    session: false
}), confirmCanUpload, (req, res) => {

    //TODO: replace with client direct to s3 upload

    const path = '/playerrank/capt/upload';

    const requiredParameters = [{
        name: 'logo',
        type: 'string'
    }, {
        name: 'seasonInf',
        type: 'object'
    }, {
        name: 'userId',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let dataURI = requiredParameters.logo.value;
        let seasonInf = requiredParameters.seasonInf.value;
        let userId = requiredParameters.userId.value;

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
        return PlayerRankImageUpload.uploadRankImage(dataURI, userId, seasonInf).then(
            success => {
                response.status = 200;
                response.message = utils.returnMessaging(path, 'Uploaded to pending', null, success, null);
                return response;
            },
            failure => {
                response.status = 500;
                response.message = utils.returnMessaging(path, 'Failed upload to pending', failure, null, null);
                return response;
            }
        );
    });


});

router.post('/usersReporting', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    //TODO: replace with client direct to s3 upload

    const path = 'playerrank/usersReporting';

    const requiredParameters = [{
        name: 'members',
        type: 'array'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let members = requiredParameters.members.value;

        return playerRankMethods.getReportingTeamMembers(members).then(
            success => {
                response.status = 200;
                response.message = utils.returnMessaging(path, 'Reporting Members:', null, { reported: success }, null);
                return response;
            },
            failure => {
                response.status = 500;
                response.message = utils.returnMessaging(path, 'Failed upload to pending:', failure, null, null);
                return response;
            }
        )
    });


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

    // if (req.body.remove) {
    Team.findOne({
        teamName_lower: callingUser.teamName.toLowerCase()
    }).lean().then((foundTeam) => {
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
                            console.log('going there');
                            levelRestrict.userLevel(req, res, next);
                        }
                        // } else if () {

                        // } else {
                        //     logObj.logLevel = 'ERROR';
                        //     logObj.error = 'user was not authorized for action';
                        //     res.status(403).send(
                        //         utils.returnMessaging(path, "User not authorized remove.", false, null, null, logObj));
                        // }
                    }
                },
                err => {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'there was a problem finding the user';
                    res.status(400).send(utils.returnMessaging(path, "User not found.", false, null, null, logObj));
                }
            )

        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'there was a problem finding the team';
            res.status(400).send(utils.returnMessaging(path, "Team not found.", false, null, null, logObj));
        }
    }, (err) => {
        res.status(500).send(
            utils.returnMessaging(path, "Error finding team", err, null, null, logObj)
        );
    });
    // } else {
    //     next();
    // }

}

module.exports = router;