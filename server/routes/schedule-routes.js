const Schedule = require('../models/schedule-models');
const Team = require('../models/team-models');
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

module.exports = router;