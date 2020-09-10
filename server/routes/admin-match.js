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
                    // let keys = Object.keys(match);
                    // keys.forEach(key => {
                    //     found[key] = match[key];
                    // });
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
});


router.post('/match/set/schedule/deadline', passport.authenticate('jwt', { session: false }), levelRestrict.matchLevel, util.appendResHeader, async(req, res) => {
    const path = 'admin/match/set/schedule/deadline';
    let div = req.body.division;
    let date = req.body.date;
    let endWeek = req.body.endWeek;

    let logInfo = {};

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

});

router.post('/match/deletereplay', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    let logInfo = {};

    const path = 'admin/match/deletereplay'

    logInfo.action = 'delete replay from match';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = `${req.body.match} : replay prop ${req.body.replayProp}`;

    // res.status(200).send("Under construction");
    if (req.body.matchId && req.body.replayProp) {
        deleteReplay(req.body.matchId, req.body.replayProp).then(
            answer => {
                res.status(200).send(util.returnMessaging(path, 'Replay Deleted', false, answer, null, logInfo));
            },
            err => {
                console.log('err', err);
                res.status(500).send(util.returnMessaging(path, 'Delete replay failed', err));
            }
        )
    } else {
        res.status(500).send(util.returnMessaging(path, 'Bad parameters', null));
    }
});


router.post('/match/uploadreplay', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = '/schedule/report/match';
    const formidable = require('formidable');
    const parser = require('hots-parser');
    let form = new formidable.IncomingForm();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'report match';
    logObj.logLevel = 'STD';

    form.parse(req, (req, fields, files) => {

        logObj.target = fields.matchId;

        //get the match
        Match.findOne({
            matchId: fields.matchId
        }).then(
            (foundMatch) => {
                if (foundMatch) {
                    //get the teams
                    let teamIds = matchCommon.findTeamIds([foundMatch.toObject()]);
                    Team.find({
                        _id: {
                            $in: teamIds
                        }
                    }).then(
                        (foundTeams) => {

                            //an array of team name and players on each team, used to associate the replays to the specifc team
                            teamInfo = [];

                            foundTeams.forEach(team => {
                                let teamid = team._id.toString();
                                //info object
                                let teamInf = {};
                                //teamname
                                teamInf['teamName'] = team.teamName;
                                teamInf['id'] = teamid;
                                //add all the players of the team into a player array
                                teamInf['players'] = [];
                                team.teamMembers.forEach(member => {
                                    let name = member.displayName.split('#');
                                    name = name[0];
                                    teamInf['players'].push(name);
                                });
                                teamInfo.push(teamInf);
                            });

                            let fileKeys = Object.keys(files);
                            let parsed = [];

                            //parse the replays
                            fileKeys.forEach(fileKey => {
                                try {
                                    let parsedReplay = parser.processReplay(files[fileKey].path, {
                                        useAttributeName: true,
                                        overrideVerifiedBuild: true
                                    });

                                    if (parsedReplay.status != 1) {
                                        parsedReplay['failed'] = true;
                                    }
                                    parsed.push(parsedReplay);
                                } catch (error) {
                                    parsed.push({
                                        match: {
                                            map: 'UNKNOWN-PARSE-ERROR'
                                        }
                                    });
                                    util.errLogger(path, error, 'caught parse error');
                                }
                            });

                            let replayfilenames = [];
                            //loop through the parsed replays to grab some info
                            parsed.forEach((element, index) => {
                                //this tie back object is used to tie together the parsed replays, the match objects, and the replay files
                                let tieBack = {};
                                let timeStamp = '';
                                if (util.returnBoolByPath(foundMatch.toObject(), 'scheduledTime.startTime')) {
                                    let date = new Date(parseInt(foundMatch.scheduledTime.startTime));
                                    let day = date.getDate();
                                    let year = date.getFullYear();
                                    let month = date.getMonth();
                                    month = month + 1;
                                    timeStamp = month + "-" + day + "-" + year;
                                }
                                let composeFilename = 'ngs_' + timeStamp + "_" + teamInfo[0].teamName + '_vs_' + teamInfo[1].teamName;

                                //if the replay does not parse we will still store in the s3 giving it an unknown_map suffix
                                if (element.hasOwnProperty('failed') && element.failed == true) {
                                    composeFilename += '_' + 'unknown_map-' + index;
                                } else {
                                    let UUID = uniqid();
                                    tieBack.id = UUID;
                                    //this object will be pushed into the replayfilenames hold some info we need to save back to the match to tie the two together
                                    let replayTeamA = element.match.teams["0"];
                                    let replayTeamB = element.match.teams["1"];

                                    //sort through the team members in the replay to assign the proper team names into the parsed replay object
                                    teamInfo.forEach(teamInfo => {
                                        if (_.intersection(replayTeamA.names, teamInfo.players).length > _.intersection(replayTeamB.names, teamInfo.players).length) {
                                            replayTeamA.teamName = teamInfo.teamName;
                                            replayTeamA.teamId = teamInfo.id;
                                        } else if (_.intersection(replayTeamA.names, teamInfo.players).length < _.intersection(replayTeamB.names, teamInfo.players).length) {
                                            replayTeamB.teamName = teamInfo.teamName;
                                            replayTeamB.teamId = teamInfo.id;
                                        } else {
                                            //some error state, both == 0.... 
                                        }
                                    })

                                    composeFilename += '_' + element.match.map;

                                    element.match['ngsMatchId'] = foundMatch.matchId;
                                    composeFilename = composeFilename.replace(/[^A-Z0-9\-]+/ig, "_");
                                    element.match.filename = composeFilename;
                                    element.systemId = UUID;
                                }

                                composeFilename = composeFilename.replace(/[^A-Z0-9\-]+/ig, "_");
                                tieBack.fileName = composeFilename + '.stormReplay';
                                replayfilenames.push(tieBack);

                            });


                            //TODO: possibly combining these into a promise array to bring exectuion time into sync so we can report to hots-profile here?
                            for (var i = 0; i < fileKeys.length; i++) {
                                if (foundMatch.replays == undefined || foundMatch.replays == null) {
                                    foundMatch.replays = {};
                                }

                                if (foundMatch.replays[fields.round] == undefined || foundMatch.replays[fields.round] == null) {
                                    foundMatch.replays[fields.round] = {};
                                }

                                foundMatch.replays[fields.round].url = replayfilenames[i].fileName;

                                if (replayfilenames[i].id) {
                                    foundMatch.replays[fields.round].data = replayfilenames[i].id;
                                }

                                let fileName = replayfilenames[i].fileName;
                                let filePath = files[fileKeys[i]].path;
                                uploadMethods.uploadReplayToS3(filePath, fileName).then(
                                    ret => {
                                        console.log(ret, 'uploaded to s3')
                                    },
                                    err => {
                                        console.log(err, 'err sending to s3');
                                    }
                                );
                            }

                            //if we have failed parse - remove those junk objects from the array before inserting them into the database.
                            indiciesToRemove = [];
                            SeasonInfoCommon.getSeasonInfo().then(
                                rep => {
                                    let seasonNum = rep.value;
                                    parsed.forEach((element, index) => {
                                        element.season = seasonNum;
                                        if (element.hasOwnProperty('failed') && element.failed == true) {
                                            indiciesToRemove.push(index);
                                        }
                                    });

                                    indiciesToRemove.forEach(index => {
                                        parsed.splice(index, 1);
                                    });

                                    ParsedReplay.collection.insertMany(parsed).then(
                                        (records) => {
                                            let sysLog = {};
                                            sysLog.actor = 'SYS';
                                            sysLog.action = ' parsed replay stored';
                                            sysLog.logLevel = 'SYSTEM';
                                            sysLog.target = '';
                                            sysLog.timeStamp = new Date().getTime();
                                            logger(sysLog);
                                        },
                                        (err) => {
                                            let sysLog = {};
                                            sysLog.actor = 'SYS';
                                            sysLog.action = ' parsed replay error';
                                            sysLog.logLevel = 'ERROR';
                                            sysLog.error = err;
                                            sysLog.target = '';
                                            sysLog.timeStamp = new Date().getTime();
                                            logger(sysLog);
                                        }
                                    )
                                }
                            );
                            foundMatch.reported = true;
                            foundMatch.postedToHP = false;
                            foundMatch.save((saved) => {
                                res.status(200).send(util.returnMessaging(path, 'Match reported', false, saved, null, logObj));
                            }, (err) => {
                                res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err, null, null, logObj));
                            })

                        }, (err) => {
                            res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err, null, null, logObj));
                        })
                } else {
                    res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err, null, null, logObj));
                }
            },
            (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err, null, null, logObj));
            }
        )
    });
});

router.post('/match/deletereplay', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    let logInfo = {};

    const path = 'admin/match/deletereplay'

    logInfo.action = 'delete replay from match';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = `${req.body.match} : replay prop ${req.body.replayProp}`;

    // res.status(200).send("Under construction");
    if (req.body.matchId && req.body.replayProp) {
        deleteReplay(req.body.matchId, req.body.replayProp).then(
            answer => {
                util.errLogger(path, null, answer);
                res.status(200).send(util.returnMessaging(path, 'Replay Deleted', false, answer, null, logInfo));
            },
            err => {
                console.log('err', err);
                res.status(500).send(util.returnMessaging(path, 'Delete replay failed', err));
            }
        )
    } else {
        res.status(500).send(util.returnMessaging(path, 'Bad parameters', null));
    }
});

router.post('/match/create/grandfinal', passport.authenticate('jwt', {
    session: false
}), levelRestrict.multi(['MATCH']), util.appendResHeader, (req, res) => {
    const path = 'admin/match/create/grandfinal';

    const logInfo = {}
    logInfo.action = 'create grand final match';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = `${req.body.home.teamName} vs ${req.body.away.teamName}`;

    req.body.matchId = uniqid();

    new Match(req.body).save(
        success => {
            res.status(200).send(util.returnMessaging(path, 'Match Created', false, success, null, logInfo));
        },
        err => {
            logInfo.status = 'ERROR';
            logInfo.error = err;
            res.status(500).send(util.returnMessaging(path, 'Match Creation Failed', err, null, null, logInfo));
        }
    )

});

router.post('/match/delete/grandfinal', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = '/match/delete/grandfinal';

    const logInfo = {}
    logInfo.action = 'delete grand final match';
    logInfo.admin = 'ADMIN';
    logInfo.actor = req.user.displayName;
    logInfo.target = `${req.body.matchId}`;

    Match.findOneAndDelete({ matchId: req.body.matchId })
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


});


router.post('/match/create/stream/link', passport.authenticate('jwt', {
    session: false
}), levelRestrict.multi(['MATCH', 'CASTER']), util.appendResHeader, (req, res) => {
    const path = '/match/create/stream/link';

    streamMethod.createStreamEvent(req.body).then(
        answer => {
            res.status(200).send(util.returnMessaging(path, 'Stream info created', false, answer));
        },
        err => {
            console.log(err);
            if (err instanceof Error) {
                err = err.message;
            }
            res.status(500).send(util.returnMessaging(path, 'Stream info failed', err));
        }
    )
});

router.post('/match/delete/stream/link', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, (req, res) => {
    const path = '/match/delete/stream/link';

    let query = { "$and": [{ "matchId": req.body.matchId }, { "streamOnly": true }] };
    Match.findOneAndDelete(query).then(
        deleted => {
            res.status(200).send(util.returnMessaging(path, 'Stream info deleted', false, deleted));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Stream info delete failed', err));
        }
    )
});

router.post('/season/reset', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, util.appendResHeader, async(req, res) => {

    const Division = require('../models/division-models');

    let path = 'admin/season/reset';

    let logObj = {};



    let archived = await ArchiveMethods.archiveDivisions().then(
        suc => {
            return {
                success: true,
                data: suc
            };
        },
        fail => {
            return { success: false, data: fail };
        }
    );

    if (archived.success) {

        res.status(200).send(util.returnMessaging(path, 'Season Reset', false, archived, null, logObj));
    } else {
        res.status(500).send(util.returnMessaging(path, 'Error resetting teams registration division', teams.data, null, null, logObj));
    }



})


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