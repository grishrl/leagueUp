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

    try {
        season = util.validateInputs.number(season);

        if (season.valid) {
            let logObj = {};
            logObj.actor = '/upsertSeasonInfo';
            logObj.action = 'upserting season info';
            logObj.target = 'System table: season info :' + season.value;
            logObj.logLevel = 'STD';
            logObj.timeStamp = Date.now();

            let scheduleQuery = {
                $and: [{
                        'dataName': 'seasonInfo'
                    },
                    {
                        'data.value': season.value
                    }
                ]
            };
            let postedInfo = {
                'dataName': 'seasonInfo',
                'data': {
                    'value': season.value,
                    'registrationOpen': req.body.data.registrationOpen,
                    'seasonStartDate': req.body.data.seasonStartDate,
                    'seasonEndDate': req.body.data.seasonEndDate,
                    'registrationEndDate': req.body.data.registrationEndDate,
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
        } else {
            //bad inputs
            let message = 'Error: ';

            message += 'value (number) is required!';

            res.status(500).send(utils.returnMessaging(path, message));
        }
    } catch (e) {
        utils.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }


});

router.get('/getSeasonInfo', (req, res) => {

    const path = '/admin/getSeasonInfo';

    let specificSeason = req.query.season;
    specificSeason = util.validateInputs.number(specificSeason);


    if (specificSeason.valid) {
        try {
            seasonInfoCommon.getSeasonInfo(specificSeason.value).then(
                process => {
                    res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, process, null));
                }
            )
        } catch (e) {
            util.errLogger(path, e);
            res.status(500).send(util.returnMessaging(path, "Error in node", err, null, null));
        }
    } else {
        try {
            seasonInfoCommon.getSeasonInfo().then(
                process => {
                    if (process) {
                        res.status(200).send(util.returnMessaging(path, "Found the season schedule.", false, process, null));
                    } else {
                        res.status(500).send(util.returnMessaging(path, "Error finding season schedule.", false, null, null));
                    }
                }
            )
        } catch (e) {
            util.errLogger(path, e);
            res.status(500).send(util.returnMessaging(path, "Error in node", err, null, null));
        }
    }

})

module.exports = router;