const Schedule = require('../models/schedule-models');
const Team = require('../models/team-models');
const Division = require('../models/division-models');
const util = require('../utils');
const passport = require("passport");
const _ = require('lodash');
const router = require('express').Router();

router.post('/getSchedule', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/getSchedule';
    let season = req.body.season;
    let division = req.body.division;
    let round = req.body.round;
    Schedule.findOne({ "season": season }).then((foundSeason) => {
        if (foundSeason) {
            let divInfo = foundSeason.division[division];
            let roundInfo = divInfo.roundSchedules[round];
            if (roundInfo.length > 0) {
                let teamIds = [];
                roundInfo.forEach(match => {
                    if (teamIds.indexOf(match.home) == -1) {
                        teamIds.push(match.home);
                    }
                    if (teamIds.indexOf(match.away) == -1) {
                        teamIds.push(match.away);
                    }
                });
                Team.find({ _id: { $in: teamIds } }).then((foundTeams) => {
                    if (foundTeams) {
                        foundTeams.forEach(team => {
                            let teamid = team._id.toString();
                            roundInfo.forEach(match => {
                                let homeid = match.home ? match.home.toString() : match.home;
                                let awayid = match.away ? match.away.toString() : match.away;
                                if (teamid == homeid) {
                                    match.hometeamName = team.teamName;
                                }
                                if (team._id == awayid) {
                                    match.awayteamName = team.teamName;
                                }
                            })
                        });

                        res.status(200).send(util.returnMessaging(path, 'Found schedule!', false, roundInfo));
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error getting the schedules', err));
                })
            } else {
                res.status(400).send(util.returnMessaging(path, 'Schedules not found provided season/division/round'));
            }
        } else {
            res.status(400).send(util.returnMessaging(path, 'Schedule not found, did you send the right season?'));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error getting the schedules', err));
    })
});

router.post('/getTeamMatches', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/getTeamMatches';
    let team = req.body.team;
    let season = req.body.season;
    let division = req.body.division;
    team = team.toLowerCase();
    Team.findOne({ teamName_lower: team }).then((foundTeam) => {
        if (foundTeam) {
            let teamId = foundTeam._id.toString();
            if (division == null || division == undefined) {
                division = foundTeam.teamDivision.divisionConcat;
            }
            Schedule.findOne({ "season": season }).then((foundSeason) => {
                let divInfo = foundSeason.division[division];
                let schedules = divInfo['roundSchedules'];
                let returnObject = {};
                let keys = Object.keys(schedules);
                let otherTeam = [];
                keys.forEach(key => {
                    returnObject[key] = [];
                    schedules[key].forEach(match => {
                        let homeid = match.home ? match.home.toString() : match.home;
                        let awayid = match.away ? match.away.toString() : match.away;
                        if (homeid == teamId) {
                            match.hometeamName = foundTeam.teamName;
                            match.hometeamLogo = foundTeam.logo;
                            returnObject[key].push(match);
                            if (awayid) {
                                otherTeam.push(match.away);
                            }
                        } else if (awayid == teamId) {
                            match.awayteamName = foundTeam.teamName;
                            match.awayteamLogo = foundTeam.logo;
                            returnObject[key].push(match);
                            if (homeid) {
                                otherTeam.push(match.home);
                            }
                        }
                    });
                });
                if (otherTeam.length > 0) {
                    Team.find({
                        "_id": {
                            $in: otherTeam
                        }
                    }).then((foundTeams) => {
                        if (foundTeams && foundTeams.length > 0) {
                            let keys = Object.keys(returnObject);
                            keys.forEach(key => {
                                let sched = returnObject[key];
                                sched.forEach(match => {
                                    let homeid = match.home ? match.home.toString() : match.home;
                                    let awayid = match.away ? match.away.toString() : match.away;
                                    foundTeams.forEach(team => {
                                        let id = team._id.toString();
                                        if (homeid == id) {
                                            match.hometeamName = team.teamName;
                                            match.hometeamLogo = team.logo;
                                        }
                                        if (awayid == id) {
                                            match.awayteamName = team.teamName;
                                            match.awayteamLogo = team.logo;
                                        }
                                    });
                                });
                            });
                            res.status(200).send(util.returnMessaging(path, 'Returned matches for team', false, returnObject));
                        } else {
                            res.status(400).send(util.returnMessaging(path, 'Failed to get team matches1'));
                        }
                    }, (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Failed to get team matches2', err));
                    })
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Failed to get team matches3', err));
            })
        } else {
            res.status(400).send(util.returnMessaging(path, 'Failed to get team matches4'));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Failed to get team matches5', err));
    })
})

/*
                    Team.find({
                        "_id": {
                            $in: otherTeam
                        }
                    }).find((foundTeams) => {
                        console.log(foundTeams);
                        if (foundTeams && foundTeams.length > 0) {
                            returnObject.forEach(shed => {
                                sched.forEach(match => {
                                    let homeid = match.home ? match.home.toString() : match.home;
                                    let awayid = match.away ? match.away.toString() : match.away;
                                    foundTeams.forEach(team => {
                                        let id = team._id.toString();
                                        if (homeid == id) {
                                            match.hometeamName = team.teamName;
                                            match.hometeamLogo = team.logo;
                                        }
                                        if (awayid == id) {
                                            match.awayteamName = team.teamName;
                                            match.awayteamLogo = team.logo;
                                        }
                                    });
                                });
                            });
                            res.status(200).send(util.returnMessaging(path, 'Returned matches for team', false, returnObject));
                        } else {
                            res.status(400).send(util.returnMessaging(path, 'Failed to get team matches1'));
                        }
                    }, (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Failed to get team matches2', err));
                    })
*/

router.post('/setMatchTime', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/setMatchTime';
    let requester = req.user.displayName;
    let teams = req.body.teams;
    let season = req.body.season;
    let division = req.body.division;
    let round = req.body.round;
    let matchId = req.body.matchId;
    let scheduledStartTime = req.body.scheduledStartTime;
    let scheduledEndTime = req.body.scheduledEndTime;
    if (teams.length > 0) {
        teams.forEach(team => {
            team = team.toLowerCase();
        })
    } else {
        //send error message.
    }

    Team.find({ teamName_lower: { $in: teams } }).then((foundTeams) => {
        let isCapt = false;
        if (foundTeams && foundTeams.length > 0) {
            foundTeams.forEach(team => {
                if (team.captain == requester) {
                    isCapt = true;
                }
            });
            if (isCapt) {
                Schedule.findOne({ "season": season }).then((foundSeason) => {
                    if (foundSeason) {
                        let match;
                        let divInfo = foundSeason.division[division];
                        let roundInfo = divInfo.roundSchedules[round];
                        match = _.find(roundInfo, { "matchId": matchId });
                        if (match != undefined && match != null) {
                            match.scheduledStartTime = scheduledStartTime;
                            match.scheduledEndTime = scheduledEndTime;
                            foundSeason.markModified('division');
                            foundSeason.save().then(
                                (saved) => {
                                    res.status(200).send(util.returnMessaging(path, 'Saved the match time.', false, saved));
                                },
                                (err) => {
                                    res.status(500).send(util.returnMessaging(path, 'Error saving match time', err));
                                }
                            )
                        } else {
                            res.status(400).send(util.returnMessaging(path, 'Error finding match!'));
                        }
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error finding schedule information', err));
                })
            } else {
                res.status(401).send(util.returnMessaging(path, 'Unauthorized, requester is not a captain of the teams.'));
            }
        } else {
            res.status(400).send(util.returnMessaging(path, 'Error updating match time.'));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error updating match time.', err));
    });
})

router.post('/getMatch', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'schedule/getMatch';
    let season = req.body.season;
    let matchId = req.body.matchId;
    console.log('season ', season, ' matchid ', matchId)
    Schedule.findOne({ "season": season }).then((foundSched) => {
        if (foundSched) {
            let division = foundSched.division;
            // console.log(division);
            let keys = Object.keys(division);
            console.log('keys ', keys)
            let match;
            let retDiv;
            let retRound;
            keys.forEach(key => {
                if (util.returnBoolByPath(division[key], 'roundSchedules')) {
                    let roundSchedules = division[key].roundSchedules;
                    let rounds = Object.keys(roundSchedules);
                    rounds.forEach(round => {
                        sched = roundSchedules[round];
                        let testMatch = _.find(sched, {
                            "matchId": matchId
                        });
                        if (testMatch != undefined && testMatch != null) {
                            match = testMatch;
                            retDiv = key;
                            retRound = round;
                        }
                    });
                }
            });
            if (match != undefined && match != null) {
                let teams = [];
                if (match.home) {
                    teams.push(match.home);
                }
                if (match.away) {
                    teams.push(match.away);
                }
                Team.find({
                    _id: {
                        $in: teams
                    }
                }).then((foundTeams) => {
                    if (foundTeams && foundTeams.length > 0) {
                        foundTeams.forEach(team => {
                            let homeid = match.home ? match.home.toString() : match.home;
                            let awayid = match.away ? match.away.toString() : match.away;
                            if (homeid == team._id.toString()) {
                                match.hometeamName = team.teamName;
                                match.hometeamLogo = team.logo;
                            }
                            if (awayid == team._id.toString()) {
                                match.awayteamName = team.teamName;
                                match.awayteamLogo = team.logo;
                            }
                        });
                        match.division = retDiv;
                        match.round = retRound;
                        res.status(200).send(util.returnMessaging(path, 'Found match', false, match));
                    } else {
                        res.status(400).send(util.returnMessaging(path, 'Error getting match'));
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
                })
            } else {
                res.status(400).send(util.returnMessaging(path, 'Error getting match'));
            }
        } else {
            res.status(400).send(util.returnMessaging(path, 'Error getting match'));
        }

    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
    })
});

module.exports = router;