const Team = require('../models/team-models');
const ParsedReplay = require('../models/replay-parsed-models');
const Match = require('../models/match-model');
const util = require('../utils');
const passport = require("passport");
const _ = require('lodash');
const router = require('express').Router();
const AWS = require('aws-sdk');
const uniqid = require('uniqid');
const levelRestrict = require("../configs/admin-leveling");
const scheduleGenerator = require('../subroutines/schedule-subs');

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

const s3replayBucket = new AWS.S3({
    params: {
        Bucket: process.env.s3bucketReplays
    }
});

/**
 * returns matches that are generated
 * accepts season, division, round
 * return matches that fit the criterea
 * 
 */
router.post('/get/matches', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/get/matches';
    let season = req.body.season;
    let division = req.body.division;
    let round = req.body.round;
    Match.find({
        $and: [
            { season: season },
            { round: round },
            { divisionConcat: division }
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
    }), (req, res) => {
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

/**
 * returns matches that are generated
 * accepts season, team
 * return matches that fit the criterea
 * 
 */
router.post('/get/matches/team', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/get/matches/team';
    let team = req.body.team;
    let season = req.body.season;
    team = team.toLowerCase();
    Team.findOne({ teamName_lower: team }).then((foundTeam) => {
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
                    }
                ]
            }).lean().then((foundMatches) => {
                let teams = findTeamIds(foundMatches);
                addTeamNamesToMatch(teams, foundMatches).then((processed) => {
                    res.status(200).send(util.returnMessaging(path, 'Found matches', false, processed));
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Failed to get team matches', err));
                })
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Failed to get team matches', err));
            });
        } else {
            res.status(400).send(util.returnMessaging(path, 'Failed to get team matches'));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Failed to get team matches', err));
    })
})


//TODO: test new scheduling route!
router.post('/update/match/time', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/update/match/time';
    let requester = req.user.displayName;
    //let season = req.body.season;

    let matchId = req.body.matchId;
    let scheduledStartTime = req.body.scheduledStartTime;
    let scheduledEndTime = req.body.scheduledEndTime;

    Match.findOne({ matchId: matchId }).then((foundMatch) => {
        if (foundMatch) {
            let teams = findTeamIds([foundMatch.toObject()]);
            Team.find({
                _id: {
                    $in: teams
                }
            }).lean().then((foundTeams) => {
                let isCapt = false;
                foundTeams.forEach(team => {
                    if (team.captain == requester) {
                        isCapt = true;
                    }
                })
                if (isCapt) {
                    if (util.returnBoolByPath(foundMatch.toObject(), 'scheduledTime')) {
                        if (foundMatch.scheduledTime.priorScheduled) {
                            res.status(400).send(util.returnMessaging(path, 'Match has all ready been scheduled'));
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
                        res.status(200).send(util.returnMessaging(path, 'Match schedule saved', false, saved));
                    }, (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err));
                    })
                } else {
                    res.status(401).send(util.returnMessaging(path, 'Requester is not authorized'));
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err));
            });
        } else {
            res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err));
    });
})

router.post('/get/match', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/get/match';
    let season = req.body.season;
    let matchId = req.body.matchId;
    Match.findOne({ matchId: matchId }).lean().then((foundMatch) => {
        if (foundMatch) {
            let teams = findTeamIds([foundMatch]);
            addTeamNamesToMatch(teams, [foundMatch]).then((processed) => {
                res.status(200).send(util.returnMessaging(path, 'Found match', false, processed[0]));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
            })
        } else {
            res.status(400).send(util.returnMessaging(path, 'No matches found for criteria', false, foundMatch));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
    });
});

router.post('/report/match', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/schedule/report/match';
    const formidable = require('formidable');
    const parser = require('hots-parser');
    let form = new formidable.IncomingForm();

    let requester = req.user.displayName;

    let submitterUserName;
    let submitterTeamName;
    let submitterTeamId;
    let otherTeamName;
    let otherTeamId;

    if (util.returnBoolByPath(req, 'user.displayName')) {
        submitterUserName = req.user.displayName.split('#');
        submitterUserName = submitterUserName[0];
        submitterTeamName = util.returnByPath(req.user, 'teamInfo.teamName');
    }

    form.parse(req, (req, fields, files) => {

        Match.findOne({ matchId: fields.matchId }).then(
            (foundMatch) => {
                if (foundMatch) {
                    let teamIds = findTeamIds([foundMatch.toObject()]);
                    Team.find({
                        _id: {
                            $in: teamIds
                        }
                    }).then((foundTeams) => {
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
                                foundMatch.home.teamName = team.teamName;
                                foundMatch.home.score = fields.homeTeamScore;
                            }
                            if (teamid == awayid) {
                                foundMatch.away.teamName = team.teamName;
                                foundMatch.away.score = fields.awayTeamScore;
                            }
                        });

                        let isCapt = false;
                        foundTeams.forEach(team => {
                            if (team.captain == requester) {
                                isCapt = true;
                            }
                        });
                        if (isCapt) {

                            let fileKeys = Object.keys(files);
                            let parsed = [];

                            //parse the replays
                            fileKeys.forEach(fileKey => {
                                let parsedReplay = parser.processReplay(files[fileKey].path, {
                                    useAttributeName: true,
                                    overrideVerifiedBuild: true
                                });
                                parsed.push(parsedReplay)
                            });


                            // let match = fields;

                            if (foundMatch.away.teamName == submitterTeamName) {
                                submitterTeamId = foundMatch.away.id;
                                otherTeamName = foundMatch.home.teamName;
                                otherTeamId = foundMatch.home.id;
                            } else {
                                submitterTeamId = foundMatch.home.id;
                                otherTeamName = foundMatch.away.teamName;
                                otherTeamId = foundMatch.away.id;
                            }

                            let replayfilenames = [];
                            parsed.forEach(element => {
                                let tieBack = {};
                                let UUID = uniqid();
                                tieBack.id = UUID;

                                let timeStamp = '';
                                if (util.returnBoolByPath(foundMatch.toObject(), 'scheduledTime.startTime')) {
                                    let date = new Date(parseInt(foundMatch.scheduledTime.startTime));
                                    let day = date.getDate();
                                    let year = date.getFullYear();
                                    let month = date.getMonth();
                                    month = month + 1;
                                    timeStamp = month + "-" + day + "-" + year;
                                }
                                let composeFilename = 'ngs_' + timeStamp + submitterTeamName + '_vs_' + otherTeamName + '_' + element.match.map;
                                composeFilename = composeFilename.replace(/[^A-Z0-9\-]+/ig, "_");
                                tieBack.fileName = composeFilename;
                                replayfilenames.push(tieBack);
                                element.match['ngsMatchId'] = foundMatch.matchId;
                                element.match.filename = composeFilename;
                                element.systemId = UUID;
                                let teams = element.match.teams;
                                let teamKeys = Object.keys(teams);
                                teamKeys.forEach(teamKey => {
                                    let team = teams[teamKey];
                                    if (team.names.indexOf(submitterUserName) > -1) {
                                        team.teamName = submitterTeamName;
                                        team.teamId = submitterTeamId;
                                    } else {
                                        team.teamName = otherTeamName;
                                        team.teamId = otherTeamId;
                                    }
                                });
                            });

                            for (var i = 0; i < fileKeys.length; i++) {
                                if (foundMatch.replays == undefined || foundMatch.replays == null) {
                                    foundMatch.replays = {};
                                }

                                if (foundMatch.replays[(i + 1).toString()] == undefined || foundMatch.replays[(i + 1).toString()] == null) {
                                    foundMatch.replays[(i + 1).toString()] = {};
                                }
                                foundMatch.replays[(i + 1).toString()].url = replayfilenames[i].fileName;
                                foundMatch.replays[(i + 1).toString()].data = replayfilenames[i].id;

                                var data = {
                                    Key: replayfilenames[i].fileName,
                                    Body: files[fileKeys[i]].path
                                };
                                s3replayBucket.putObject(data, function(err, data) {
                                    if (err) {
                                        console.log(err); // static logging??
                                        console.log('Error uploading data: ', data);
                                    } else {
                                        console.log(data); //static logging??
                                        console.log('succesfully uploaded the replay!');
                                    }
                                });
                            }

                            ParsedReplay.collection.insertMany(parsed).then(
                                (records) => {
                                    console.log('replays written'); //static logging??
                                    foundMatch.reported = true;
                                    foundMatch.save((saved) => {
                                        res.status(200).send(util.returnMessaging(path, 'Match reported', false, saved));
                                    }, (err) => {
                                        res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err));
                                    })
                                },
                                (err) => {
                                    res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err));
                                }
                            )


                        } else {
                            res.status(401).send(path, 'Unauthorized', false);
                        }
                    }, (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err));
                    })
                } else {
                    res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err));
                }
            },
            (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error reporting match result', err));
            }
        )
    });
});


router.post('/match/add/caster', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, (req, res) => {
    let path = 'schedule/match/add/caster';
    let matchid = req.body.matchId;
    let casterName = req.body.casterName;
    let casterUrl = req.body.casterUrl;

    Match.findOne({ matchId: matchid }).then((found) => {
        if (found) {
            found.casterName = casterName;
            found.casterUrl = casterUrl;
            found.save().then(
                (saved) => {
                    res.status(200).send(util.returnMessaging(path, 'Match updated', false, saved));
                },
                (err) => {
                    res.stutus(500).send(util.returnMessaging(path, 'Error updating match', err));
                }
            )
        } else {
            res.status(400).send(util.returnMessaging(path, 'Could not find match', false, found));
        }
    }, (err) => {
        res.stutus(500).send(util.returnMessaging(path, 'Error updating match', err));
    });
});

router.post('/generate/schedules', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, (req, res) => {
    const path = 'schedule/generate/schedules';
    let season = req.body.season;
    scheduleGenerator.generateSeason(season).then((process) => {
        if (process) {
            scheduleGenerator.generateRoundRobinSchedule(season);
            res.status(200).send(util.returnMessaging(path, 'Schedules generated', false));
        } else {
            res.status(500).send(util.returnMessaging(path, 'Error occured in schedule generator'));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error occured in schedule generator'));
    })


});

module.exports = router;

function findTeamIds(found) {
    let teams = [];
    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
        if (util.returnBoolByPath(match, 'home.id')) {
            if (match.home.id != 'null' && teams.indexOf(match.home.id.toString())) {
                teams.push(match.home.id.toString());
            }
        }
        if (util.returnBoolByPath(match, 'away.id')) {
            if (match.away.id != 'null' && teams.indexOf(match.away.id.toString())) {
                teams.push(match.away.id.toString());
            }
        }
    });
    return teams;
}

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
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['logo'] = team.logo;
                        match.away['teamName_lower'] = team.teamName_lower;
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
}