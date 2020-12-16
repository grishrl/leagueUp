const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Match = require('../models/match-model');
const _ = require('lodash');
const matchCommon = require('../methods/matchCommon');
const deleteReplay = require('../methods/deleteReplay').deleteReplay;
const Team = require('../models/team-models');
const uniqid = require('uniqid');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const logger = require('../subroutines/sys-logging-subs').logger;
const ParsedReplay = require('../models/replay-parsed-models');
const uploadMethods = require('../methods/replayUpload');
const streamMethod = require('../methods/streamEventCreator');
const ArchiveMethods = require('../methods/archivalMethods');
const reportMatch = require('../methods/matches/report-match');


router.post('/match/update', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    let logInfo = {};

    const path = 'admin/match/update'

    let match = req.body.match;

    match = util.validateInputs.object(match);
    try {

        if (match.valid) {

            match = match.value;

            logInfo.action = 'update match ';
            logInfo.admin = 'ADMIN';
            logInfo.actor = req.user.displayName;
            logInfo.target = match;



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


            Match.findOne({
                matchId: match.matchId
            }).then(
                (found) => {
                    if (found) {
                        _.forEach(match, (value, key) => {
                            found[key] = value;
                        });
                        found.save().then(
                            (saved) => {
                                if (saved.reported) {
                                    matchCommon.promoteTournamentMatch(saved.toObject());
                                }
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

    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }

});


router.post('/match/set/schedule/deadline', passport.authenticate('jwt', { session: false }), levelRestrict.matchLevel, util.appendResHeader, async(req, res) => {
    const path = 'admin/match/set/schedule/deadline';
    let div = req.body.division;
    let date = parseInt(req.body.date);
    let endWeek = parseInt(req.body.endWeek);

    try {

        div = util.validateInputs.string(div);
        date = util.validateInputs.number(date);
        endWeek = util.validateInputs.number(endWeek);

        if (div.valid && date.valid && endWeek.valid) {

            let logInfo = {};

            div = div.value;
            date = date.value;
            endWeek = endWeek.value;

            logInfo.action = 'set schedule deadline ';
            logInfo.admin = 'ADMIN';
            logInfo.actor = req.user.displayName;
            logInfo.target = div;

            let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
            let season = currentSeasonInfo.value;

            const query = {
                divisionConcat: div,
                season: season
            };

            Match.find(query).then((found) => {
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

        } else {
            //bad inputs
            let message = 'Error: ';
            if (!div.valid) {
                message += 'div (string) parameter required';
            }
            if (!date.valid) {
                message += 'date (number) parameter required';
            }
            if (!endWeek.valid) {
                message += 'endWeek (number) parameter required';
            }
            res.status(500).send(util.returnMessaging(path, message));
        }

    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }


});

router.post('/match/uploadreplay', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = 'admin/match/uploadreplay';

    let requester = req.user.displayName;

    let matchReport = req.body;

    try {
        matchReport = util.validateInputs.object(matchReport);
        if (matchReport.valid) {
            matchReport = matchReport.value;
            reportMatch(path, matchReport, requester, true).then(
                reported => {
                    res.status(200).send(util.returnMessaging(path, 'Match Reported', null, reported));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err));
                }
            );
        } else {
            //bad inputs
            let message = 'Error: ';
            if (!matchReport.valid) {
                message += 'matchReport (object) parameter required';
            }
            res.status(500).send(util.returnMessaging(path, message));
        }
    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }

});

router.post('/match/deletereplay', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    let logInfo = {};

    const path = 'admin/match/deletereplay'

    logInfo.action = 'delete replay from match';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = `${req.body.matchId} : replay prop ${req.body.replayProp}`;

    try {
        if (req.body.matchId && req.body.replayProp) {
            deleteReplay(req.body.matchId, req.body.replayProp).then(
                answer => {
                    util.errLogger(path, null, answer);
                    res.status(200).send(util.returnMessaging(path, 'Replay Deleted', false, answer, null, logInfo));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, 'Delete replay failed', err));
                }
            )
        } else {
            res.status(500).send(util.returnMessaging(path, 'Bad parameters', null));
        }
    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }


});

router.post('/match/create/grandfinal', passport.authenticate('jwt', {
    session: false
}), levelRestrict.multi(['MATCH']), util.appendResHeader, (req, res) => {
    const path = 'admin/match/create/grandfinal';

    try {

        let matchObj = req.body;
        matchObj = util.validateInputs.object(matchObj);
        if (matchObj.valid) {
            matchObj = matchObj.value;
            const logInfo = {}
            logInfo.action = 'create grand final match';
            logInfo.admin = 'ADMIN';
            logInfo.actor = req.user.displayName;
            logInfo.target = `${matchObj.home.teamName} vs ${matchObj.away.teamName}`;

            matchObj.matchId = uniqid();

            new Match(matchObj).save(
                success => {
                    res.status(200).send(util.returnMessaging(path, 'Match Created', false, success, null, logInfo));
                },
                err => {
                    logInfo.status = 'ERROR';
                    logInfo.error = err;
                    res.status(500).send(util.returnMessaging(path, 'Match Creation Failed', err, null, null, logInfo));
                }
            )
        } else {
            //bad inputs
            let message = 'Error: ';

            message += 'send the new object as the body of this request!';

            res.status(500).send(util.returnMessaging(path, message));
        }

    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }

});

router.post('/match/delete/grandfinal', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = 'admin/match/delete/grandfinal';

    try {

        let matchId = req.body.matchId;

        matchId = util.validateInputs.string(matchId);

        if (matchId.valid) {
            matchId = matchId.value;
            const logInfo = {}
            logInfo.action = 'delete grand final match';
            logInfo.admin = 'ADMIN';
            logInfo.actor = req.user.displayName;
            logInfo.target = `${req.body.matchId}`;

            Match.findOneAndDelete({
                    matchId: req.body.matchId
                })
                .then(
                    success => {
                        res.status(200).send(util.returnMessaging(path, 'Match Created', false, success, null, logInfo));
                    },
                    err => {
                        logInfo.status = 'ERROR';
                        logInfo.error = err;
                        res.status(500).send(util.returnMessaging(path, 'Match Creation Failed', err, null, null, logInfo));
                    }
                )

        } else {
            //bad inputs
            let message = 'Error: ';

            message += 'matchId (string) is required';

            res.status(500).send(util.returnMessaging(path, message));
        }

    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }

});


router.post('/match/create/stream/link', passport.authenticate('jwt', {
    session: false
}), levelRestrict.multi(['MATCH', 'CASTER']), util.appendResHeader, (req, res) => {
    const path = 'admin/match/create/stream/link';

    try {
        let newStream = req.body
        newStream = util.validateInputs.object(newStream);
        if (newStream.valid) {
            newStream = newStream.value;
            streamMethod.createStreamEvent(newStream).then(
                answer => {
                    res.status(200).send(util.returnMessaging(path, 'Stream info created', false, answer));
                },
                err => {
                    if (err instanceof Error) {
                        err = err.message;
                    }
                    res.status(500).send(util.returnMessaging(path, 'Stream info failed', err));
                }
            )
        } else {
            //bad inputs
            let message = 'Error: ';

            message += 'send the new object as the body of this request!';

            res.status(500).send(util.returnMessaging(path, message));
        }

    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }

});

router.post('/match/delete/stream/link', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = 'admin/match/delete/stream/link';

    try {
        let matchId = req.body.matchId
        matchId = util.validateInputs.string(matchId);
        if (matchId.valid) {
            matchId = matchId.value;
            let query = {
                "$and": [{
                    "matchId": matchId
                }, {
                    "streamOnly": true
                }]
            };
            Match.findOneAndDelete(query).then(
                deleted => {
                    res.status(200).send(util.returnMessaging(path, 'Stream info deleted', false, deleted));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, 'Stream info delete failed', err));
                }
            )
        } else {
            //bad inputs
            let message = 'Error: ';

            message += 'matchId (string) required';

            res.status(500).send(util.returnMessaging(path, message));
        }

    } catch (e) {
        util.errLogger(path, e);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e));
    }

});

router.post('/season/reset', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, async(req, res) => {

    const Division = require('../models/division-models');

    let path = 'admin/season/reset';

    let logObj = {};

    try {

        let password = req.body.password

        password = util.validateInputs.string(password);

        if (password.valid) {
            password = password.value;
            if (password == 'resetseason') {
                let archived = await ArchiveMethods.archiveDivisions().then(
                    suc => {
                        return {
                            success: true,
                            data: suc
                        };
                    },
                    fail => {
                        return {
                            success: false,
                            data: fail
                        };
                    }
                );

                if (archived.success) {
                    res.status(200).send(util.returnMessaging(path, 'Season Reset', false, archived, null, logObj));
                } else {
                    res.status(500).send(util.returnMessaging(path, 'Error resetting teams registration division', archived.data, null, null, logObj));
                }

            } else {
                res.status(500).send(util.returnMessaging(path, 'Password incorrect', null, null, {}));
            }
        } else {
            //bad inputs
            let message = 'Error: ';

            message += 'password (string) required';

            res.status(500).send(util.returnMessaging(path, message));
        }

    } catch (e) {
        util.errLogger(path, e.stack);
        res.status(500).send(util.returnMessaging(path, 'Internal Server Error', e.message));
    }

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