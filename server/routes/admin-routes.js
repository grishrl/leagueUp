const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const System = require("../models/system-models");
const levelRestrict = require("../configs/admin-leveling");
const seasonInfoCommon = require("../methods/seasonInfoMethods");

router.post('/upsertSeasonInfo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, (req, res) => {

    const path = '/admin/upsertSeasonInfo';

    let season = parseInt(req.body.value);

    let logObj = {};
    logObj.actor = '/upsertSeasonInfo';
    logObj.action = 'upserting season info';
    logObj.target = 'System table: season info :' + season;
    logObj.logLevel = 'STD';
    logObj.timeStamp = Date.now();

    let scheduleQuery = {

        'dataName': 'seasonInfo',
        'value': season
    }
    let postedInfo = {
        'dataName': 'seasonInfo',
        'value': season,
        'data': {
            'registrationOpen': req.body.data.registrationOpen,
            'seasonStartDate': req.body.data.seasonStartDate,
            'seasonEndDate': req.body.data.seasonEndDate
        }
    };

    System.system.findOneAndUpdate(
        scheduleQuery, postedInfo, {
            new: true,
            upsert: true
        }
    ).then(
        saved => {
            res.status(200).send(util.returnMessaging(path, "Upserted the season schedule.", false, saved, null, logObj));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Upsert season schedule failed.", err, null, null, logObj));
        }
    );
});

router.get('/getSeasonInfo', (req, res) => {

    const path = '/admin/getSeasonInfo';

    let specificSeason = parseInt(req.query.season);

    if (specificSeason) {
        try {
            seasonInfoCommon.getSeasonInfo(specificSeason).then(
                process => {
                    res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, process, null));
                }
            )
        } catch (e) {
            res.status(500).send(util.returnMessaging(path, "Error in node", err, null, null));
        }
    } else {
        try {
            seasonInfoCommon.getSeasonInfo().then(
                process => {
                    if (process) {
                        res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, process, null));
                    } else {
                        res.status(500).send(util.returnMessaging(path, "Error finding season schedule.", err, null, null));
                    }
                }
            )
        } catch (e) {
            //log?
        }
    }

})

module.exports = router;