const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const Teamjobs = require('../cron-routines/update-team');
const StatsJobs = require('../cron-routines/stats-routines');
const logger = require('../subroutines/sys-logging-subs');
const Event = require('../models/event-model');
const jwt = require('jsonwebtoken');
const System = require('../models/system-models');
const AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

const s3Bucket = new AWS.S3({
    params: {
        Bucket: process.env.s3bucketGeneralImages
    }
});



router.post('/update/teams', (req, res) => {
    const path = '/utility/update/teams';

    let logObj = {};
    logObj.actor = 'Utility';
    logObj.action = ' update team MMR cron runner; updating';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'teams not update within 5 days';


    var daysOld = req.body.daysOld || req.query.daysOld;
    var apiKey = req.body.apiKey || req.query.apiKey;
    var limit = req.body.limit || req.query.limit;
    if (!daysOld) {
        daysOld = 5;
    }

    if (!limit) {
        limit = 20;
    } else {
        limit = parseInt(limit);
    }
    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                Teamjobs.updateTeamsNotTouched(daysOld, limit).then(reply => {
                    logObj.action += ' ' + reply.length + ' teams';

                    res.status(200).send(util.returnMessaging(path, 'Update Teams Completed', null, null, null, logObj));

                }, err => {
                    logObj.logLevel = "ERROR";
                    logObj.error = err;

                    res.status(500).send(util.returnMessaging(path, 'Update Teams Failed', null, null, null, logObj));

                });
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', null, null, null, logObj));
            }
        }
    );

});

router.post('/associate-replays', (req, res) => {
    const path = '/utility/associate-replays';

    let logObj = {};
    logObj.actor = 'Utility';
    logObj.action = ' associate replay data ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'unassociated replays';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                StatsJobs.asscoatieReplays().then(
                    (response) => {
                        res.status(200).send(util.returnMessaging(path, 'Associate Replays Completed Normally', null, null, null, logObj))
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Associate Replays Failed', err, null, null, logObj));
                    }
                )
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', null, null, null, logObj));
            }
        }
    );

});

router.post('/tabulate-stats/user', (req, res) => {
    const path = '/utility/tabulate-stats/user';

    let logObj = {};
    logObj.actor = 'Utility';
    logObj.action = ' tabulate user stats ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'player stats';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                StatsJobs.tabulateUserStats().then(
                    (response) => {
                        res.status(200).send(util.returnMessaging(path, 'Tabulate User Stats Completed Normally', null, null, null, logObj))
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Tabulate User Stats Failed', err, null, null, logObj));
                    }
                )
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', null, null, null, logObj));
            }
        }
    );

});

router.post('/tabulate-stats/team', (req, res) => {
    const path = '/utility/tabulate-stats/team';

    let logObj = {};
    logObj.actor = 'Utility';
    logObj.action = ' tabulate team stats ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'team stats';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                StatsJobs.tabulateTeamStats().then(
                    (response) => {
                        res.status(200).send(util.returnMessaging(path, 'Tabulate Team Stats Completed Normally', null, null, null, logObj))
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Tabulate Team Stats Failed', err, null, null, logObj));
                    }
                )
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', null, null, null, logObj));
            }
        }
    );

});


//post
// path: /team/uploadLogo
// requires id, type, and base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/image/upload', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/utility/image/upload';
    let uploadedFileName = "";

    //the file name will be the objectID    
    let id = req.body.id;
    let type = req.body.type;

    let dataURI = req.body.image;

    var decoded = Buffer.byteLength(dataURI, 'base64');

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'upload team logo ';
    logObj.target = id;
    logObj.logLevel = 'STD';

    if (decoded.length > 2500000) {
        logObj.logLevel = 'ERROR';
        logObj.error = 'File was too big';
        res.status(500).send(util.returnMessaging(path, "File is too big!", false, null, null, logObj));
    } else {

        var png = dataURI.indexOf('png');
        var jpg = dataURI.indexOf('jpg');
        var jpeg = dataURI.indexOf('jpeg');
        var gif = dataURI.indexOf('gif');

        var stamp = Date.now()
        stamp = stamp.toString();
        stamp = stamp.slice(stamp.length - 4, stamp.length);

        //the file name will be the objectID 
        uploadedFileName += id + ".png";


        var buf = new Buffer.from(dataURI.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        // var buf = new Buffer.from(dataURI, 'base64');

        var data = {
            Key: uploadedFileName,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/png'
        };
        s3Bucket.putObject(data, function(err, data) {
            if (err) {
                //log object
                let sysObj = {};
                sysObj.actor = 'SYSTEM';
                sysObj.action = 'error uploading to AWS ';
                sysObj.logLevel = 'ERROR';
                sysObj.error = err;
                sysObj.location = path;
                sysObj.target = id;
                sysObj.timeStamp = new Date().getTime();
                logger(sysObj);
            } else {
                //log object
                let sysObj = {};
                sysObj.actor = 'SYSTEM';
                sysObj.action = 'uploaded to AWS ';
                sysObj.logLevel = 'STD';
                sysObj.location = path;
                sysObj.target = id;
                sysObj.timeStamp = new Date().getTime();
                logger(sysObj);
            }
        });

        //this will have to be changed to adjust model depending on the type that has been sent
        if (type == 'event') {
            Event.findById(id).then(
                foundEvent => {
                    if (foundEvent) {
                        var imageToDelete;
                        if (foundEvent.eventImage) {
                            imageToDelete = foundEvent.eventImage;
                        }
                        if (imageToDelete) {
                            deleteFile(imageToDelete);
                        }
                        foundEvent.eventImage = uploadedFileName;
                        foundEvent.save().then((savedEvent) => {
                            if (savedEvent) {
                                res.status(200).send(util.returnMessaging(path, "File uploaded", false, savedEvent, null, logObj));
                            }
                        }, (err) => {
                            deleteFile(filePath);
                            res.status(500).send(util.returnMessaging(path, "Error uploading file", err, null, null, logObj));
                        })
                    } else {
                        deleteFile(filePath);
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Event was not found';
                        res.status(500).send(util.returnMessaging(path, "Error uploading file", false, null, null, logObj));
                    }
                },
                err => {
                    deleteFile(filePath);
                    res.status(500).send(util.returnMessaging(path, "Error uploading file", err, null, null, logObj));
                }
            )
        }

    }

});

router.post('/tabulate-stats/hots-profile', (req, res) => {

    const path = '/utility/tabulate-stats/team';

    var apiKey = req.body.apiKey || req.query.apiKey;
    var limit = req.body.limit || req.query.limit;

    //construct log object
    let logObj = {};
    logObj.actor = "SYSTEM";
    logObj.action = 'upload replays to hots-profile ';
    logObj.target = 'replays';
    logObj.logLevel = 'STD';

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {

                StatsJobs.postToHotsProfileHandler(limit).then(
                    (response) => {
                        res.status(200).send(util.returnMessaging(path, 'Submitting replays to Hots Profile Completed Normally', null, null, response, logObj))
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Submitting replays to Hots Profile Failed', err, null, null, logObj));
                    }
                )

            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', null, null, null, logObj));
            }
        }
    );

})

module.exports = router;

function deleteFile(path) {
    let data = {
        Bucket: process.env.s3bucketImages,
        Key: path
    };
    s3Bucket.deleteObject(data, (err, data) => {
        if (err) {
            //log object
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'error deleting from AWS ';
            sysObj.location = 'team-route-deleteFile'
            sysObj.logLevel = 'ERROR';
            sysObj.error = err;
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
        } else {
            //log object
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'deleted from AWS ';
            sysObj.location = 'team-route-deleteFile'
            sysObj.logLevel = 'STD';
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
        }
    })
}

async function checkApiKey(key) {
    return await System.system.findOne({
        'dataName': 'apiKey',
        'value': key
    }).then(
        found => {
            return !!found;
        },
        err => { return false; }
    )
}