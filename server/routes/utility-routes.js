const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const Teamjobs = require('../cron-routines/update-team');
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

    if (!daysOld) {
        daysOld = 5;
    }
    checkApiKey(apiKey).then(
        validate => {
            if (validate) {
                Teamjobs.updateTeamsNotTouched(daysOld).then(reply => {
                    logObj.action += reply.length + ' teams';

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