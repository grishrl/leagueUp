const Team = require('../models/team-models');
const ParsedReplay = require('../models/replay-parsed-models');
const Match = require('../models/match-model');
const util = require('../utils');
const passport = require("passport");
const _ = require('lodash');
const router = require('express').Router();
const uniqid = require('uniqid');
const levelRestrict = require("../configs/admin-leveling");
const scheduleGenerator = require('../subroutines/schedule-subs');
const logger = require('../subroutines/sys-logging-subs');
const Scheduling = require('../models/schedule-models');
const Division = require('../models/division-models');
const matchCommon = require('../methods/matchCommon');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const archiveMethods = require('../methods/archivalMethods');
const uploadMethod = require('../methods/replayUpload');

/**
 * returns matches that are generated
 * accepts season, division, round
 * return matches that fit the criterea
 * 
 */
router.post('/get/matches', async(req, res) => {
    const path = 'schedule/get/matches';
    let season = req.body.season;
    let division = req.body.division;
    let round = req.body.round;

    let query = { $and: [] };

    if (season) {
        query.$and.push({
            season: season
        });
    }
    if (round) {
        query.$and.push({
            round: round
        });
    }
    if (division) {
        query.$and.push({
            divisionConcat: division
        });
    }

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let pastSeason = season != currentSeasonInfo.value;

    Match.find(query).lean().then((found) => {
        if (found) {
            if (pastSeason) {
                matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            } else {
                matchCommon.addTeamInfoToMatch(found).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            }

        } else {
            res.status(400).send(util.returnMessaging(path, 'No matches found for criteria', false, found));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding matches', err));
    });
});

router.post('/get/reported/matches', async(req, res) => {

    const path = 'schedule/get/reported/matches';
    let season = req.body.season;
    let division = req.body.division;
    let sortOrder = util.isNullorUndefined(req.body.sortOrder) ? false : req.body.sortOrder;
    let limit = util.isNullorUndefined(req.body.limit) ? false : req.body.limit;

    let query = {
        $and: [{
                season: season
            },
            {
                reported: true
            }
        ]
    }

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let pastSeason = season != currentSeasonInfo.value;

    if (division) {
        query.$and.push({ divisionConcat: division });
    }

    Match.find(query).lean().then(
        found => {
            if (found) {
                if (sortOrder == 'des') {
                    found = util.sortMatchesByTime(found);
                    found.reverse();
                } else if (sortOrder == 'asc') {
                    found = util.sortMatchesByTime(found);
                }

                if (limit) {
                    limit = limit > found.length ? found.length : limit;
                    found = found.slice(0, limit);
                }

                if (pastSeason) {
                    matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                        processed => {
                            res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                        },
                        err => {
                            res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                        }
                    )
                } else {
                    matchCommon.addTeamInfoToMatch(found).then(
                        processed => {
                            res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                        },
                        err => {
                            res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                        }
                    )
                }
            } else {
                res.status(200).send(util.returnMessaging(path, 'No Matches Found', null, found));
            }
        }, err => {
            res.status(500).send(util.returnMessaging(path, 'Error getting matches', err));
        }
    )
});

/**
 * returns matches that are generated
 * accepts season, division, round
 * return matches that fit the criterea
 * 
 */
router.post('/get/division/matches', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = 'schedule/get/division/matches';
    let season = req.body.season;
    let division = req.body.division;
    let round = req.body.round;
    Match.find({
        $and: [{
                season: season
            },
            {
                divisionConcat: division
            }
        ]
    }).lean().then((found) => {
        if (found) {
            let teams = findTeamIds(found);
            addTeamNamesToMatch(teams, found).then((processed) => {
                res.status(200).send(util.returnMessaging(path, 'Found matches', false, processed));
            }, (err) => {
                res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
            });
        } else {
            res.status(400).send(util.returnMessaging(path, 'No matches found for criteria', false, found));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding matches', err));
    });
});

/*
 */
router.post('/get/matches/all',
    passport.authenticate('jwt', {
        session: false
    }), util.appendResHeader, (req, res) => {
        const path = 'schedule/get/matches/all';
        Match.find().lean().then((found) => {
            if (found) {
                let teams = findTeamIds(found);
                addTeamNamesToMatch(teams, found).then((processed) => {
                    res.status(200).send(util.returnMessaging(path, 'Found matches', false, processed));
                }, (err) => {
                    res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                });
            } else {
                res.status(400).send(util.returnMessaging(path, 'No matches found for criteria', false, found));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding matches', err));
        });
    });


//match query route
router.post('/query/matches',
    passport.authenticate('jwt', {
        session: false
    }), (req, res) => {
        const path = '/query/matches';
        Match.find(req.body).lean().then(
            found => {
                res.status(200).send(util.returnMessaging(path, 'Query results', false, found));
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Query Error', err))
            }
        )
    });

router.get('/get/matches/casted/playing', (req, res) => {
    const path = 'schedule/get/matches/casted/playing';
    let now = Date.now();
    let query = {
        $and: [{
            casterUrl: {
                $exists: true
            }
        }, {
            "scheduledTime.endTime": {
                $gt: now
            }
        }, {
            "scheduledTime.startTime": {
                $lt: now
            }
        }]
    }
    Match.find(query).lean().then((found) => {
        if (found) {
            let teams = findTeamIds(found);
            addTeamNamesToMatch(teams, found).then((processed) => {
                res.status(200).send(util.returnMessaging(path, 'Found matches', false, processed));
            }, (err) => {
                res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
            });
        } else {
            res.status(200).send(util.returnMessaging(path, 'No matches found for criteria', false, found));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding matches', err));
    });
});

router.post('/get/matchup/history', (req, res) => {

    const path = 'schedule/get/matchup/history';

    let query = {
        $and: [{
                $or: [{
                        $and: [{
                                "home.id": req.body.teamAid
                            },
                            {
                                "away.id": req.body.teamBid
                            }
                        ]
                    },
                    {
                        $and: [{
                                "home.id": req.body.teamBid
                            },
                            {
                                "away.id": req.body.teamAid
                            }
                        ]
                    }
                ]
            },
            { reported: true }
        ]
    };

    Match.find(query).then(
        found => {
            matchCommon.addTeamInfoToMatch(found).then(ret => {
                    res.status(200).send(util.returnMessaging(path, 'Found matches', null, found));
                })
                // if(found){
                //   for(var i = 0; i<found.length;i++){

            //   }
            // }else{

            // }

        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error getting matches', err));
        }
    )



});
/**
 * returns matches that are generated
 * accepts season, team
 * return matches that fit the criterea
 * 
 */
router.post('/get/matches/team', async(req, res) => {
    const path = 'schedule/get/matches/team';
    let team = req.body.team;
    let season = req.body.season;

    let pastSeason = false;

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    pastSeason = season != currentSeasonInfo.value;

    team = team.toLowerCase();
    let foundTeam;
    if (pastSeason) {
        foundTeam = await archiveMethods.getTeamFromArchiveByNameSesaon(team, season);
    } else {
        foundTeam = await Team.findOne({
            teamName_lower: team
        }).then((foundTeam) => {
            if (foundTeam) {
                return foundTeam;

            } else {
                return null;
            }
        }, (err) => {
            return null;
        });
    }

    if (foundTeam) {
        let teamId = foundTeam._id;
        Match.find({
            $and: [{
                    $or: [{
                        'away.id': teamId
                    }, {
                        'home.id': teamId
                    }]
                },
                {
                    season: season
                },
                {
                    type: {
                        $ne: "tournament"
                    }
                }
            ]
        }).lean().then((foundMatches) => {
            if (pastSeason) {
                matchCommon.addTeamInfoFromArchiveToMatch(foundMatches, season).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Failed to get team matches', err));
                    })
            } else {
                matchCommon.addTeamInfoToMatch(foundMatches).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Failed to get team matches', err));
        });
    } else {
        res.status(500).send(util.returnMessaging(path, 'Failed to get team matches'));
    }

})

/*

*/
router.get('/get/matches/scheduled', (req, res) => {
    const path = 'schedule/get/matches/scheduled';

    let season = req.query.season;

    let query = {
        $and: [{
                'scheduledTime.startTime': {
                    $exists: true
                }
            },
            {
                'scheduledTime.startTime': {
                    $ne: null
                }
            }
        ]

    }

    if (season) {
        query.$and.push({ season: season });
    }

    Match.find(query).lean().then((found) => {
        if (found) {
            let teamIds = findTeamIds(found);
            addTeamAndDivsionNames(found).then(
                added => {
                    res.status(200).send(util.returnMessaging(path, 'Found scheduled matches', false, added));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, 'Failed to get team matches', err, false));
                }
            );

        } else {
            res.status(400).send(util.returnMessaging(path, 'No matches found'));
        }
    }, (err) => {
        res.status(400).send(util.returnMessaging(path, 'Error in query', err));
    })
});


router.post('/update/match/time', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = 'schedule/update/match/time';
    let requester = req.user.displayName;
    //let season = req.body.season;

    let matchId = req.body.matchId;
    let scheduledStartTime = req.body.scheduledStartTime;
    let scheduledEndTime = req.body.scheduledEndTime;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'schedule match';
    logObj.target = matchId;
    logObj.logLevel = 'STD';

    try {
        Match.findOne({
            matchId: matchId
        }).then((foundMatch) => {
            if (foundMatch) {
                let teams = findTeamIds([foundMatch.toObject()]);
                Team.find({
                    _id: {
                        $in: teams
                    }
                }).lean().then((foundTeams) => {
                    let isCapt = returnIsCapt(foundTeams, requester);
                    if (isCapt) {
                        if (util.returnBoolByPath(foundMatch.toObject(), 'scheduledTime')) {
                            if (foundMatch.scheduledTime.priorScheduled) {
                                logObj.logLevel = 'ERROR';
                                logObj.error = 'Match has all ready been scheduled';
                                res.status(400).send(util.returnMessaging(path, 'Match has all ready been scheduled', false, null, null, logObj));
                            } else {
                                foundMatch.scheduledTime.priorScheduled = true;
                                foundMatch.scheduledTime.startTime = scheduledStartTime;
                                foundMatch.scheduledTime.endTime = scheduledEndTime;
                            }
                        } else {
                            foundMatch.scheduledTime = {};
                            foundMatch.scheduledTime.priorScheduled = true;
                            foundMatch.scheduledTime.startTime = scheduledStartTime;
                            foundMatch.scheduledTime.endTime = scheduledEndTime;
                        }
                        foundMatch.markModified('scheduledTime');
                        foundMatch.save((saved) => {
                            res.status(200).send(util.returnMessaging(path, 'Match schedule saved', false, saved, null, logObj));
                        }, (err) => {
                            res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err, null, null, logObj));
                        })
                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Requester is not authorized';
                        res.status(403).send(util.returnMessaging(path, 'Requester is not authorized', null, null, null, logObj));
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err, null, null, logObj));
                });
            } else {
                res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err, null, null, logObj));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err, null, null, logObj));
        });

    } catch (e) {
        util.errLogger(path, JSON.stringify(e));
        res.status(500).send(util.returnMessaging(path, 'Error updating match time.', e, null, null, logObj));
    }
})

/*
for getting a match specified by ID
*/
router.post('/get/match', async(req, res) => {
    const path = 'schedule/get/match';
    let matchId = req.body.matchId;

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

    Match.findOne({ matchId: matchId }).lean().then((foundMatch) => {
        if (foundMatch) {
            let matchSeason = foundMatch.season
            let pastSeason = matchSeason != currentSeasonInfo.value;
            if (pastSeason) {
                matchCommon.addTeamInfoFromArchiveToMatch(foundMatch, matchSeason).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found match', null, processed[0]));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            } else {
                matchCommon.addTeamInfoToMatch(foundMatch).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found match', null, processed[0]));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            }
        } else {
            res.status(400).send(util.returnMessaging(path, 'No matches found for criteria', false, foundMatch));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
    });
});

router.post('/get/match/list', async(req, res) => {
    const path = 'schedule/get/match/list';
    let matches = req.body.matches;
    let season = req.body.season;
    let pastSeason = false;

    if (season) {
        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        pastSeason = season != currentSeasonInfo.value;
    }


    Match.find({ matchId: { $in: matches } }).lean().then(
        found => {
            if (pastSeason) {
                matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            } else {
                matchCommon.addTeamInfoToMatch(found).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
        }
    )

});


/*
for reporting matches and injesting replay files
*/
router.post('/report/match', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/schedule/report/match';
    const formidable = require('formidable');
    const parser = require('hots-parser');
    let form = new formidable.IncomingForm();

    let requester = req.user.displayName;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'report match';
    logObj.logLevel = 'STD';

    form.parse(req, (req, fields, files) => {

        logObj.target = fields.matchId;

        Match.findOne({ matchId: fields.matchId }).then(
            (foundMatch) => {
                if (foundMatch) {
                    let teamIds = findTeamIds([foundMatch.toObject()]);
                    Team.find({
                        _id: {
                            $in: teamIds
                        }
                    }).then((foundTeams) => {
                        let homeDominate = false;
                        let awayDominate = false;
                        if (fields.homeTeamScore == 2 && fields.awayTeamScore == 0) {
                            homeDominate = true;
                        } else if (fields.homeTeamScore == 0 && fields.awayTeamScore == 2) {
                            awayDominate = true;
                        }
                        //an array of team name and players on each team, used to associate the replays to the specifc team
                        teamInfo = [];
                        foundTeams.forEach(team => {
                            let teamid = team._id.toString();
                            let homeid, awayid;
                            if (util.returnBoolByPath(foundMatch.toObject(), 'home.id')) {
                                homeid = foundMatch.home.id.toString();
                            }
                            if (util.returnBoolByPath(foundMatch.toObject(), 'away.id')) {
                                awayid = foundMatch.away.id.toString();
                            }
                            if (teamid == homeid) {
                                if (homeDominate) {
                                    foundMatch.home.dominator = true;
                                }
                                foundMatch.home.teamName = team.teamName;
                                foundMatch.home.score = fields.homeTeamScore;
                            }
                            if (teamid == awayid) {
                                if (awayDominate) {
                                    foundMatch.away.dominator = true;
                                }
                                foundMatch.away.teamName = team.teamName;
                                foundMatch.away.score = fields.awayTeamScore;
                            }
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


                        if (fields.otherDetails != null && fields.otherDetails != undefined) {
                            foundMatch.other = JSON.parse(fields.otherDetails);
                        }

                        if (fields.mapBans != null && fields.mapBans != undefined) {
                            foundMatch.mapBans = JSON.parse(fields.mapBans);
                        }

                        //validate the submitter is a captain OR assistantCaptain of one of the teams
                        let isCapt = returnIsCapt(foundTeams, requester);
                        if (isCapt) {

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
                                    parsed.push({ match: { map: 'UNKNOWN-PARSE-ERROR' } });
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

                                if (foundMatch.replays[(i + 1).toString()] == undefined || foundMatch.replays[(i + 1).toString()] == null) {
                                    foundMatch.replays[(i + 1).toString()] = {};
                                }
                                foundMatch.replays[(i + 1).toString()].url = replayfilenames[i].fileName;

                                if (replayfilenames[i].id) {
                                    foundMatch.replays[(i + 1).toString()].data = replayfilenames[i].id;
                                }

                                let fileName = replayfilenames[i].fileName;
                                let file = files[fileKeys[i]].path;
                                uploadMethod.uploadReplayToS3(file, fileName).then(
                                    ret => {
                                        console.log('s3upload success', ret);
                                    },
                                    err => {
                                        console.log('s3upload err', err)
                                    }
                                )

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
                                            // let targetString = '';
                                            // records.forEach(
                                            //         record => {
                                            //             targetString += record.systemId + ', ';
                                            //         }
                                            //     )
                                            //log object
                                            let sysLog = {};
                                            sysLog.actor = 'SYS';
                                            sysLog.action = ' parsed replay stored';
                                            sysLog.logLevel = 'SYSTEM';
                                            sysLog.target = '';
                                            sysLog.timeStamp = new Date().getTime();
                                            logger(sysLog);

                                            foundMatch.reported = true;
                                            foundMatch.save((saved) => {
                                                res.status(200).send(util.returnMessaging(path, 'Match reported', false, saved, null, logObj));
                                            }, (err) => {
                                                res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err, null, null, logObj));
                                            })
                                        },
                                        (err) => {
                                            res.status(500).send(util.returnMessaging(path, 'Error (2) reporting match result', err, null, null, logObj));
                                        }
                                    )
                                }
                            );


                            //if this match was a tournmanet match then we need to promote the winner to the parent match
                            matchCommon.promoteTournamentMatch(foundMatch.toObject());




                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'Unauthorized to report'
                            res.status(403).send(path, 'Unauthorized', false, null, null, logObj);
                        }
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

/*
this is to add a caster to a match
*/
router.post('/match/add/caster', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, util.appendResHeader, (req, res) => {
    let path = 'schedule/match/add/caster';
    let matchid = req.body.matchId;
    let casterName = req.body.casterName;
    let casterUrl = req.body.casterUrl;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' add caster ';
    logObj.logLevel = 'STD';
    logObj.target = matchid;

    Match.findOne({ matchId: matchid }).then((found) => {
        if (found) {
            found.casterName = casterName;
            found.casterUrl = casterUrl;
            found.save().then(
                (saved) => {
                    res.status(200).send(util.returnMessaging(path, 'Match updated', false, saved, null, logObj));
                },
                (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error updating match', err, null, null, logObj));
                }
            )
        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'Could not find match';
            res.status(400).send(util.returnMessaging(path, 'Could not find match', false, found, null, logObj));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error updating match', err, null, null, logObj));
    });
});

/*
this is to add a caster to a match
*/
router.post('/match/fetch/mycasted', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, util.appendResHeader, async(req, res) => {
    let path = 'schedule/match/fetch/mycasted';

    if (req.user.hasOwnProperty('twitch') && req.user.hasOwnProperty('casterName')) {
        //log object
        //comeback
        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

        let query = {
            $and: [{
                    season: currentSeasonInfo.value
                },
                {
                    $or: [{
                            casterUrl: req.user.twitch
                        },
                        {
                            casterName: req.user.casterName
                        }
                    ]
                }
            ]
        };





        Match.find(query).lean().then((found) => {

            if (found) {
                matchCommon.addTeamInfoToMatch(found).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found match', false, processed, null));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Error finding match', err, null, null));
                    }
                )
            } else {
                res.status(200).send(util.returnMessaging(path, 'Could not find match', false, found, null));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding match', err, null, null));
        });
    } else {
        res.status(500).send(util.returnMessaging(path, 'No Twitch On Profile', null, null, null));
    }

});

/*
this is for casters to one click claim a match
*/
router.post('/match/add/caster/occ', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, util.appendResHeader, (req, res) => {
    let path = 'schedule/match/add/caster/occ';
    let matchid = req.body.matchId;

    if (req.user.hasOwnProperty('twitch') && req.user.hasOwnProperty('casterName')) {
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' add caster ';
        logObj.logLevel = 'STD';
        logObj.target = matchid;

        Match.findOne({
            matchId: matchid
        }).then((found) => {
            if (found) {
                found.casterName = req.user.casterName;
                found.casterUrl = req.user.twitch;
                found.save().then(
                    (saved) => {
                        res.status(200).send(util.returnMessaging(path, 'Match updated', false, saved, null, logObj));
                    },
                    (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Error updating match', err, null, null, logObj));
                    }
                )
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Could not find match';
                res.status(400).send(util.returnMessaging(path, 'Could not find match', false, found, null, logObj));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error updating match', err, null, null, logObj));
        });
    } else {
        res.status(500).send(util.returnMessaging(path, 'No Twitch On Profile', null, null, null));
    }

});


/*
generates the schedules
*/
router.post('/generate/schedules', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, util.appendResHeader, (req, res) => {
    const path = 'schedule/generate/schedules';
    let season = req.body.season;
    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' generated season schedules ';
    logObj.logLevel = 'STD';
    logObj.target = 'season: ' + season;
    scheduleGenerator.generateSeason(season).then((process) => {
        if (process) {
            scheduleGenerator.generateRoundRobinSchedule(season);
            res.status(200).send(util.returnMessaging(path, 'Schedules generated', false, null, null, logObj));
        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'Error occured in schedule generator, got null schedule'
            res.status(500).send(util.returnMessaging(path, 'Error occured in schedule generator', false, null, null, logObj));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error occured in schedule generator', err, null, null, logObj));
    })


});

router.post('/check/valid',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.scheduleGenerator, util.appendResHeader, (req, res) => {
        const path = 'schedule/check/valid';

        let season = req.body.season;

        Scheduling.findOne({ season: season }).then(
            found => {
                if (found) {
                    res.status(200).send(util.returnMessaging(path, 'Schedules found', false, { "valid": false }));

                } else {
                    res.status(200).send(util.returnMessaging(path, 'Schedules empty', false, { "valid": true }));
                }
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Query Error', false, null, null, null));
            }
        )
    });

router.post('/generate/tournament', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, util.appendResHeader, (req, res) => {

    const path = '/schedule/generate/tournament';

    let checkObj = {
        $and: [{
            type: 'tournament'
        }]
    }
    let target = '';
    let season;
    if (req.body.season) {
        season = req.body.season;
        target += 'season: ' + season;
        checkObj.$and.push({ season: season });
    }

    let division;

    if (req.body.division) {
        division = req.body.division;
        target += ' division: ' + division;
        checkObj.$and.push({
            "division": division
        });
    }

    let cupNumber;
    if (req.body.cupNumber) {
        cupNumber = req.body.cupNumber;
        target += ' cup Number: ' + cupNumber;
        checkObj.$and.push({
            cupNumber: cupNumber
        });
    }


    let tournamentName;
    if (req.body.tournamentName) {
        tournamentName = req.body.tournamentName;
        target += ' tournamentName: ' + tournamentName;
        checkObj.$and.push({
            name: tournamentName
        });
    }

    let description;
    if (req.body.description) {
        description = req.body.description;
        target += ' description: ' + description;
    }

    let teams = req.body.teams;
    let teamids = [];
    teams.forEach(team => {
        let teamid = team._id ? team._id : team.id;
        if (teamids.indexOf(teamid) == -1) {
            teamids.push(teamid);
        }
    })
    checkObj.$and.push({
        participants: teamids
    });
    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' generated tournament ';
    logObj.logLevel = 'STD';
    logObj.target = target;

    Scheduling.findOne(checkObj).then(
        found => {
            if (found) {
                res.status(500).send(util.returnMessaging(path, 'Tournament previously generated', false, null, null, logObj));
            } else {
                scheduleGenerator.generateTournamentTwo(teams, season, division, cupNumber, tournamentName, description).then((process) => {
                    if (process) {
                        res.status(200).send(util.returnMessaging(path, 'Tournament generated', false, process, null, logObj));
                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Error occured in schedule generator, got null Tournament'
                        res.status(500).send(util.returnMessaging(path, 'Error 3 occured in Tournament generator', false, process, null, logObj));
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error 2 occured in Tournament generator', err, null, null, logObj));
                })
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error 1 occured in Tournament generator', err, null, null, logObj));
        }

    )


});


//this route retuns all tournament matches that a team participates in 
router.post('/fetch/team/tournament/matches', async(req, res) => {

    const path = '/schedule/fetch/team/tournament/matches';

    let team = req.body.teamId;

    let queryObj = {
        $and: [{
                $or: [{
                        "home.id": team
                    },
                    {
                        "away.id": team
                    }
                ]
            },
            {
                "type": "tournament"
            }
        ]
    };

    let season;
    if (req.body.season) {
        season = req.body.season;
        queryObj.$and.push({ season: req.body.season });
    }
    if (req.body.division) {
        queryObj.$and.push({
            divisionConcat: req.body.division
        });
    }

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let pastSeason = season != currentSeasonInfo.value;

    Match.find(queryObj).lean().then(
        (found) => {
            if (pastSeason) {
                matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            } else {
                matchCommon.addTeamInfoToMatch(found).then(
                    processed => {
                        res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
                    })
            }

        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error occured querying schedules', err));
        }
    )

});



router.post('/fetch/team/tournament', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = '/schedule/fetch/team/tournament';

    let team = req.body.teamId;

    Scheduling.find({
        participants: team
    }).then(
        (found) => {
            res.status(200).send(util.returnMessaging(path, 'Found tournament info', false, found));
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error occured querying schedules', err));
        },
    )

});

router.post('/fetch/tournament', (req, res) => {

    const path = '/schedule/fetch/tournament';

    let checkObj = {
        $and: [{
            type: 'tournament'
        }]
    }

    let season;
    if (req.body.season) {
        season = req.body.season;
        checkObj.$and.push({
            season: season
        });
    }

    let division;
    if (req.body.division) {

        division = req.body.division;

        checkObj.$and.push({
            "division": division
        });
    }

    let tournamentName;
    if (req.body.tournamentName) {
        tournamentName = req.body.tournamentName;
        checkObj.$and.push({
            name: tournamentName
        });
    }

    // res.status(200).send(path, 'received this', false, { "hey": "hello" });


    Scheduling.find(checkObj).then(
        found => {
            if (found) {
                if (found.hasOwnProperty('toObject')) {
                    found = found.toObject();
                }
                res.status(200).send(util.returnMessaging(path, 'Found tournament info', false, {
                    tournInfo: found
                }));

                // Match.find({
                //     matchId: {
                //         $in: found.matches
                //     }
                // }).lean().then(
                //     matches => {
                //         if (matches) {
                //             let teams = findTeamIds(matches);
                //             addTeamNamesToMatch(teams, matches).then((processed) => {
                //                 res.status(200).send(util.returnMessaging(path, 'Found tournament info', false, {
                //                     tournInfo: found,
                //                     tournMatches: processed
                //                 }));
                //             }, err => {
                //                 res.status(500).send(util.returnMessaging(path, 'Error occured querying tournament matches', err));
                //             })
                //         } else {
                //             //mathces not found
                //             res.status(500).send(util.returnMessaging(path, 'Error occured querying tournament matches', err));
                //         }
                //     },
                //     err => {
                //         //matches query error
                //         res.status(500).send(util.returnMessaging(path, 'Error occured querying tournament matches', err));
                //     }
                // )
            } else {
                res.status(200).send(util.returnMessaging(path, 'No tournament info found', false, found));
                //match not found
            }

        },
        err => {
            //query error
            res.status(500).send(util.returnMessaging(path, 'Error occured querying tournament', err));
        }
    )


});

module.exports = router;


function returnIsCapt(foundTeams, requester) {
    let isCapt = false;
    foundTeams.forEach(team => {
        if (team.captain == requester) {
            isCapt = true;
        }
    });
    if (!isCapt) {
        if (foundTeams[0].assistantCaptain) {
            isCapt = foundTeams[0].assistantCaptain.indexOf(requester) > -1;
        }
    }
    if (!isCapt) {
        if (foundTeams[1].assistantCaptain) {
            isCapt = foundTeams[1].assistantCaptain.indexOf(requester) > -1;
        }
    }
    return isCapt;
}

function findTeamIds(found) {
    let teams = [];

    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
        if (util.returnBoolByPath(match, 'home.id')) {
            if (match.home.id != 'null' && teams.indexOf(match.home.id.toString()) == -1) {
                teams.push(match.home.id.toString());
            }
        }
        if (util.returnBoolByPath(match, 'away.id')) {
            if (match.away.id != 'null' && teams.indexOf(match.away.id.toString()) == -1) {
                teams.push(match.away.id.toString());
            }
        }
    });

    return teams;
}

async function addTeamNamesToMatch_foundOnly(found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }

    let teams = findTeamIds(found);

    let teamInfo = await Team.find({
        _id: {
            $in: teams
        }
    }).then((foundTeams) => {
        if (foundTeams) {
            return foundTeams;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
    if (teamInfo) {
        teamInfo.forEach(team => {
            let teamid = team._id.toString();
            found.forEach(match => {
                let homeid, awayid;
                if (util.returnBoolByPath(match, 'home.id')) {
                    homeid = match.home.id.toString();
                }
                if (util.returnBoolByPath(match, 'away.id')) {
                    awayid = match.away.id.toString();
                }
                if (teamid == homeid) {

                    match.home['teamName'] = team.teamName;
                    match.home['logo'] = team.logo;
                    match.home['teamName_lower'] = team.teamName_lower;
                    match.home['ticker'] = team.ticker;
                }
                if (teamid == awayid) {

                    match.away['teamName'] = team.teamName;
                    match.away['logo'] = team.logo;
                    match.away['teamName_lower'] = team.teamName_lower;
                    match.away['ticker'] = team.ticker;
                }
            });
        });
    }

    return found

};

async function addTeamNamesToMatch(teams, found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }

    return Team.find({ _id: { $in: teams } }).then((foundTeams) => {
        if (foundTeams) {

            foundTeams.forEach(team => {
                let teamid = team._id.toString();
                found.forEach(match => {
                    let homeid, awayid;
                    if (util.returnBoolByPath(match, 'home.id')) {
                        homeid = match.home.id.toString();
                    }
                    if (util.returnBoolByPath(match, 'away.id')) {
                        awayid = match.away.id.toString();
                    }
                    if (teamid == homeid) {
                        match.home['teamName'] = team.teamName;
                        match.home['logo'] = team.logo;
                        match.home['teamName_lower'] = team.teamName_lower;
                        match.home['ticker'] = team.ticker;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['logo'] = team.logo;
                        match.away['teamName_lower'] = team.teamName_lower;
                        match.away['ticker'] = team.ticker;
                    }
                });
            });
            return found;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
};

function findDivs(found) {
    let divs = [];

    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
        if (divs.indexOf(match.divisionConcat) == -1) {
            divs.push(match.divisionConcat);
        }
    });

    return divs;
}

async function addTeamAndDivsionNames(found) {
    let divs = await getDivisionNames(found);
    let completed = await addTeamNamesToMatch_foundOnly(found).then(
        nameProcess => {
            nameProcess.forEach(match => {
                divs.forEach(div => {
                    if (match.divisionConcat == div.divisionConcat) {
                        match.divisionDisplayName = div.displayName;
                    }
                });
            });
            return nameProcess;
        },
        err => {
            return err;
        }
    );

    return completed;
}

async function getDivisionNames(found) {
    let div = findDivs(found);
    let divInfo = await Division.find({ divisionConcat: { $in: div } }).lean().then(
        found => { return found; },
        err => { return null; }
    );
    return divInfo;
}