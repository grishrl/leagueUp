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
const Replay = require('../models/replay-parsed-models');
const getTopStats = require('../cron-routines/getTopStats');
const readInVods = require('../methods/sheets/sheets');
const groupMaker = require('../cron-routines/groupMaker');
const hpUploadHandler = require('../cron-routines/uploadToHeroesProfile');


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

router.get('/replay/map/name', (req, res) => {
    const path = '/utility/replay/map/name';
    var id = decodeURIComponent(req.query.id);


    Replay.findOne({ systemId: id }).then(
        found => {
            let map = { name: null };
            if (found) {
                map.name = found.match.map;
            }
            res.status(200).send(util.returnMessaging(path, 'Found replay:', null, map, null, null));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error qeury replays', err, null, null, null));
        }
    )


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
                    logObj.action += 'Update teams completed normally';
                    logger(logObj);
                }, err => {
                    logObj.logLevel = "ERROR";
                    logObj.action = 'Update teams Failed';
                    logObj.error = err;
                    logger(logObj);
                });
                res.status(200).send(util.returnMessaging(path, 'Update teams started check logs for details', null, null, null))
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', null, null, null, logObj));
            }
        }
    );

});

router.post('/read-in-vods', (req, res) => {
    const path = '/utility/read-in-vods';

    let logObj = {};
    logObj.actor = 'Utility';
    logObj.action = ' read in vods ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'nightly import of vod links..';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                logger(logObj);
                readInVods.readInVods();
                // Teamjobs.updateTeamsNotTouched(daysOld, limit).then(reply => {
                //     logObj.action += 'Update teams completed normally';
                //     logger(logObj);
                // }, err => {
                //     logObj.logLevel = "ERROR";
                //     logObj.action = 'Update teams Failed';
                //     logObj.error = err;
                //     logger(logObj);
                // });
                res.status(200).send(util.returnMessaging(path, 'Read in vods started', null, null, null))
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
                        logObj.action = 'Associate Replays Completed Normally'
                        logger(logObj);
                    },
                    err => {
                        logObj.logLevel = 'ERROR';
                        logObj.action = 'Associate Replays Failed'
                        logObj.error = err;
                        logger(logObj);
                        // res.status(500).send(util.returnMessaging(path, 'Associate Replays Failed', err, null, null));
                    }
                );
                res.status(200).send(util.returnMessaging(path, 'Associate Replays Started check logs for more info', null, null, null))
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
                        logObj.action = 'Tabulate User Stats completed normally'
                        logger(logObj);
                    },
                    err => {
                        logObj.logLevel = 'ERROR';
                        logObj.action = 'Tabulate User Stats failed'
                        logObj.error = err;
                        logger(logObj);
                        // res.status(500).send(util.returnMessaging(path, 'Tabulate User Stats Failed', err, null, null, logObj));
                    }
                )
                res.status(200).send(util.returnMessaging(path, 'Tabulate User Stats started check logs for more info', null, null, null))
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
                        logObj.action = 'Tabulate Team Stats completed normally'
                        logger(logObj);
                    },
                    err => {
                        logObj.logLevel = 'ERROR';
                        logObj.action = 'Tabulate Team Stats failed'
                        logObj.error = err;
                        logger(logObj);
                        // res.status(500).send(util.returnMessaging(path, 'Tabulate Team Stats Failed', err, null, null, logObj));
                    }
                )
                res.status(200).send(util.returnMessaging(path, 'Tabulate Team Stats started check logs for more info', null, null, null, logObj))
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
            ContentEncoding: 'base64'
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

    const path = '/utility/tabulate-stats/hots-profile';

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
                hpUploadHandler.postToHotsProfileHandler(limit).then(
                    (response) => {
                        logObj.action = 'Submitting replays to Hots Profile completed normally ';
                        logger(logObj);
                    },
                    err => {
                        logObj.logLevel = "ERROR";
                        logObj.action = 'Submitting replays to Hots Profile failed';
                        logObj.error = err;
                        logger(logObj)
                            // res.status(500).send(util.returnMessaging(path, 'Submitting replays to Hots Profile Failed', err, null, null, logObj));
                    }
                )
                res.status(200).send(util.returnMessaging(path, 'Submitting replays to Hots Profile Routine Check Logs for details', false, null, {}));
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', false, null, null, logObj));
            }

        }

    );

});

router.post('/grabTopStats', (req, res) => {
    const path = '/utility/grabTopStats';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                //grab top stats from HERO-PROFILE
                getTopStats().then(
                    sucuess => {
                        res.status(200).send(util.returnMessaging(path, 'Get top stats started check logs for more info', false, null, null));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Get top stats failed!', false, null, null));
                    }
                )
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', false, null, null));
            }
        });
});

router.post('/leagueStatRun', (req, res) => {
    const path = '/utility/leagueStatRun';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                //grab top stats from HERO-PROFILE
                StatsJobs.leagueStatRunner().then(
                    sucuess => {
                        res.status(200).send(util.returnMessaging(path, 'League stats runner started check logs for more info', false, null, null));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'League stats runner failed!', false, null, null));
                    }
                )
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', false, null, null));
            }
        });
});

router.post('/discord/post/matches', (req, res) => {
    const path = '/utility/discord/post/matches';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                //grab top stats from HERO-PROFILE
                StatsJobs.leagueStatRunner().then(
                    sucuess => {
                        res.status(200).send(util.returnMessaging(path, 'League stats runner started check logs for more info', false, null, null));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'League stats runner failed!', false, null, null));
                    }
                )
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', false, null, null));
            }
        });
});

router.post('/groupmaker', (req, res) => {
    const path = '/utility/groupmaker';

    var apiKey = req.body.apiKey || req.query.apiKey;

    checkApiKey(apiKey).then(
        validate => {
            if (validate) {

                res.status(200).send(util.returnMessaging(path, 'Group Maker Started Successfully', false, null, null));

                groupMaker.suggestUserToUser().then(
                    res => {

                    },
                    err => {
                        util.errLogger(path, err, 'caught an error');
                    }
                );

                groupMaker.suggestUserToTeam().then(
                    res => {

                    },
                    err => {
                        util.errLogger(path, err, 'caught an error');
                    }
                );


            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized', false, null, null));
            }
        });
});

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