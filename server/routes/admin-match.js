const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Match = require('../models/match-model');

router.post('/match/update', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    let logInfo = {};

    const path = 'admin/match/update'

    logInfo.action = 'update match ' + path;
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = req.body.match;

    if (req.body.match) {
        let match = req.body.match;
        Match.findOne({ matchId: match.matchId }).then(
            (found) => {
                if (found) {
                    // found = match;
                    let keys = Object.keys(match);
                    keys.forEach(key => {
                        found[key] = match[key];
                    });
                    found.save().then(
                        (saved) => {
                            res.status(200).send(util.returnMessaging(path, 'Match Saved', false, saved, null, logInfo));
                        },
                        (err) => {
                            logInfo.logLevel = 'ERROR';
                            res.status(500).send(util.returnMessaging(path, 'Error saving match', err, null, null, logInfo));
                        }
                    )
                } else {
                    logInfo.logLevel = 'STD';
                    logInfo.error = 'Match not found';
                    res.status(400).send(util.returnMessaging(path, 'Match not found', false, null, null, logInfo));
                }
            },
            (err) => {
                logInfo.logLevel = 'ERROR';
                res.status(500).send(util.returnMessaging(path, 'Error getting match', err, null, null, logInfo));
            }
        )

    } else {
        logInfo.logLevel = 'STD';
        logInfo.error = 'Proper info not sent';
        res.status(400).send(util.returnMessaging(path, 'Proper info not sent', false, false, null, null, logInfo));
    }
})

module.exports = router;