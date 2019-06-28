const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const System = require("../models/system-models");
const levelRestrict = require("../configs/admin-leveling");

router.post('/upsertSeasonInfo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, (req, res) => {

    const path = '/admin/upserSeasonInfo';

    let logObj = {};
    logObj.actor = '/upsertSeasonInfo';
    logObj.action = 'upserting season info';
    logObj.target = 'System table: season info :' + req.body.season;
    logObj.logLevel = 'STD';
    logObj.timeStamp = Date.now();

    let season = req.body.season;
    let scheduleQuery = {

        'dataName': 'seasonInfo',
        'value': season
    }
    let postedInfo = {
        'dataName': 'seasonInfo',
        'value': season,
        'data': {
            'registrationOpen': req.body.seasonStart,
            'seasonStartDate': req.body.seasonStart,
            'seasonEndDate': req.body.seasonEnd
        }
    };

    System.findOneAndUpdate(
        scheduleQuery, postedInfo, {
            new: true,
            upsert: true
        }
    ).then(
        saved => {
            // console.log('season info upserted');
            res.status(200).send(util.returnMessaging(path, "Upserted the season schedule.", false, saved, null, logObj));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Upsert season schedule failed.", err, null, null, logObj));
        }
    );
});

router.get('/getSeasonInfo', (req, res) => {

    System.find({
        'dataName': 'seasonInfo',
    }).lean().then(
        found => {
            found = found.sort((a, b) => {
                if (a.value > b.value) {
                    return 1;
                } else {
                    return -1;
                }
            });
            res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, found[0], null, logObj));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Error finding season schedule.", err, null, null, logObj));
        }
    );


})

module.exports = router;