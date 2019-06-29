const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const System = require("../models/system-models");
const levelRestrict = require("../configs/admin-leveling");

router.post('/upsertSeasonInfo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, (req, res) => {

    console.log(req.body);

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
            // console.log('season info upserted');
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
        let query = {
            $and: [{
                    'dataName': 'seasonInfo'
                },
                {
                    'value': specificSeason
                }
            ]
        }
        try {
            System.system.find(
                query
            ).lean().then(
                found => {
                    found = found.sort((a, b) => {
                        if (a.value > b.value) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                    res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, found[0], null));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, "Error finding season schedule.", err, null, null));
                }
            );
        } catch (e) {
            console.log(e);
            res.status(500).send(util.returnMessaging(path, "Error in node", err, null, null));
        }
    } else {
        try {
            System.system.find({
                'dataName': 'seasonInfo'
            }).lean().then(
                found => {
                    found = found.sort((a, b) => {
                        if (a.value > b.value) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                    res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, found[0], null));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, "Error finding season schedule.", err, null, null));
                }
            );
        } catch (e) {
            console.log(e);
        }
    }





})

module.exports = router;