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

    logInfo.action = 'update match ';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = req.body.match;

    if (req.body.match) {
        let match = req.body.match;

        let homeDominate = false;
        let awayDominate = false;

        if (util.returnBoolByPath(match, 'home.score') && util.returnBoolByPath(match, 'away.score')) {
            if (match.home.score == 2 && match.away.score == 0) {
                homeDominate = true;
            } else if (match.home.score == 0 && match.away.score == 2) {
                awayDominate = true;
            } else {
                match.home.dominator = false;
                match.away.dominator = false;
            }
            if (homeDominate) {
                if (util.returnBoolByPath(match, 'away.dominator')) {
                    match.away.dominator = false;
                }
                match.home.dominator = true;
            }
            if (awayDominate) {
                if (util.returnBoolByPath(match, 'home.dominator')) {
                    match.home.dominator = false;
                }
                match.away.dominator = true;
            }
            //if scores are sent - regardless of whether there was domination; set this match to reported
            match.reported = true;
        }

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
});

router.post('/match/set/schedule/deadline', passport.authenticate('jwt', { session: false }), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = 'admin/match/set/schedule/deadline';
    let div = req.body.division;
    let date = req.body.date;
    let endWeek = req.body.endWeek;

    let logInfo = {};

    logInfo.action = 'set schedule deadline ';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = div;

    Match.find({ divisionConcat: div }).then((found) => {
        if (found) {
            let updateFound;
            updateFoundAsync(endWeek, found, date).then(updated => {
                let ok = true;
                updated.forEach(updated => {
                    if (updated == null) {
                        ok = false;
                    }
                });
                if (ok) {
                    res.status(200).send(util.returnMessaging(path, 'Matches Updated', false, null, null, logInfo));
                } else {
                    logInfo.logLevel = 'ERROR';
                    logInfo.error = 'Error updating matches';
                    res.status(400).send(util.returnMessaging(path, 'Matches not updated', false, null, null, logInfo));
                }
            }, err => {
                res.status(500).send(util.returnMessaging(path, 'Error getting matches', err, null, null, logInfo));
            });


        } else {
            logInfo.logLevel = 'STD';
            logInfo.error = 'Match not found';
            res.status(400).send(util.returnMessaging(path, 'Match not found', false, null, null, logInfo));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error getting matches', err, null, null, logInfo));
    })

    // Match.find({
    //     divisionConcat: div
    // }).then((foundMatches) => {
    //     if (foundMatches) {
    //         for (var i = 1; i <= endWeek; i++) {
    //             foundMatches.forEach(match => {
    //                 if (match.round == i) {
    //                     match.scheduleDeadline = date;
    //                 }
    //             });
    //             date = date + (1000 * 60 * 60 * 24 * 7);
    //         }
    //         foundMatches.save().then(saved => {
    //             res.status(400).send(util.returnMessaging(path, 'Matches saved', false, saved, null, logInfo));
    //         }, err => {
    //             res.status(500).send(util.returnMessaging(path, 'Error saving matches', err, null, null, logInfo));
    //         });

    //     } else {
    //         logInfo.logLevel = 'STD';
    //         logInfo.error = 'Match not found';
    //         res.status(400).send(util.returnMessaging(path, 'Match not found', false, null, null, logInfo));
    //     }
    // }, (err) => {
    //     res.status(500).send(util.returnMessaging(path, 'Error getting matches', err, null, null, logInfo));
    // })

});

module.exports = router;

async function updateFoundAsync(endWeek, found, date) {
    let updateFound = [];
    for (var i = 1; i <= endWeek; i++) {
        for (var j = 0; j < found.length; j++) {
            if (found[j].round == i) {
                found[j].scheduleDeadline = date;
                let update = await found[j].save().then(saved => { return saved; }, err => { return null; });
                updateFound.push(update);
            }

        }
        date += (1000 * 60 * 60 * 24 * 7);
    }
    return updateFound;
}