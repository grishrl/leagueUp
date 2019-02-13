const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const Teamjobs = require('../cron-routines/update-team');
const StatsJobs = require('../cron-routines/stats-routines');
const logger = require('../subroutines/sys-logging-subs');
const jwt = require('jsonwebtoken');
const System = require('../models/system-models');



router.post('/update/teams', (req, res) => {
    const path = '/update/teams';

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
    const path = '/associate-replays';

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
    const path = '/tabulate-stats/user';

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
    const path = '/tabulate-stats/team';

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

module.exports = router;

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