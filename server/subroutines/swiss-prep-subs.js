const Team = require('../models/team-models');
const Division = require('../models/division-models');
const Scheduling = require('../models/schedule-models');
const swiss = require('swiss-pairing')({
    maxPerRound: 2
});
const util = require('../utils');


/* Match report format required for the generator
    {
      round: 1,
      home: {
        id: 1,
        points: 1
      },
      away: {
        id: 3,
        points: 1
      }
    }
*/

//this function generates the framework for scheduling for the season.  should only be run once ever per season;
//after this is ran, division changes should not be performed!!!!!!!
async function generateSeason(season) {
    let divObj = {};
    let getDivision = await Division.find().then((res) => {
        return res;
    });
    for (var i = 0; i < getDivision.length; i++) {
        let thisDiv = getDivision[i];
        console.log('thisDiv ', thisDiv)
        divObj[thisDiv.divisionConcat] = {};
        let lowerTeam = [];
        thisDiv.teams.forEach(iterTeam => {
            lowerTeam.push(iterTeam.toLowerCase());
        });
        console.log('lowerTeam ', lowerTeam)
        let participants = await Team.find({
            teamName_lower: {
                $in: lowerTeam
            }
        }).then((teams) => {
            let participants = [];
            if (teams && teams.length > 0) {
                teams.forEach(team => {
                    let tempObj = {
                        "id": team._id,
                        "seed": team.teamMMRAvg,
                        "dibanded": false,
                        "droppedOut": false
                    };
                    participants.push(tempObj);
                })
            }
            return participants;
        });
        divObj[thisDiv.divisionConcat]['participants'] = participants;
        divObj[thisDiv.divisionConcat]['matches'] = [];
        divObj[thisDiv.divisionConcat]['roundSchedules'] = {};
    }

    console.log('this is divObj before creating new schedule obj: ', divObj);
    let schedObj = {
        "season": season,
        "division": divObj
    }
    console.log('this is divObj before creating new schedule obj: ', schedObj);
    new Scheduling(
        schedObj
    ).save().then((saved) => {
        console.log('fin', JSON.stringify(saved));

    }, (err) => {
        console.log(err);
    });
}

function generateRoundSchedules(season, round) {
    Scheduling.findOne({ "season": season }).then((found) => {
        let divisions = found.division;
        let keys = Object.keys(divisions);
        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let participants = divisions[key].participants;
            let matches = divisions[key].matches;
            let schedule = swiss.getMatchups(round, participants, matches);
            let pathString = 'division.' + key + '.roundSchedules';
            if (schedule.length > 0) {
                if (!util.returnBoolByPath(found, pathString)) {
                    found['division'][key]['roundSchedules'] = {};
                }
                round = round.toString();
                found['division'][key]['roundSchedules'][round] = schedule;
            }
        }
        found.markModified('division');
        found.save().then((saved) => {
            console.log('fin  schedules');
        }, (err) => {
            console.log('ERROR : ', err);
        })
    });
}

function disbandTeam(season, division, team) {
    //TODO implement
}

function dropOutTeam(season, division, team) {
    //TODO implement
}

function dateTimeMatch(season, division, round, team, dateTime) {
    //TODO implement 
}


function reportMatches(season, division, team, round, result) {
    Scheduling.findOne({ "season": season }).then((found) => {
        let targetDiv = found.division[division];
        // console.log('targetDiv ', targetDiv);
        let targetRound = targetDiv['roundSchedules'];
        // console.log('targetRound ', targetRound);
        targetRound = targetRound[round.toString()];
        // console.log('narrowed round ', targetRound);
        let targetMatch = null;
        let teamIsHome = false;
        targetRound.forEach(match => {
            console.log(match.home, match.away);
            if (match.home && match.home.toString() == team) {
                targetMatch = match;
                teamIsHome = true;
            } else if (match.away && match.away.toString() == team) {
                targetMatch = match;
            }
        });

        let reportedMatch = {};
        //ensure that we matched a team;
        if (targetMatch) {
            reportedMatch['round'] = round;
            //check if the team that's reporting is the home team
            if (teamIsHome) {
                //if they report 2 points, give them 2 and the away 0,
                let homePoints = 0;
                let awayPoints = 0;
                if (result == 2) {
                    homePoints = result
                } else if (result == 1) {
                    //if they report 1 point split the points
                    homePoints = 1;
                    awayPoints = 1;
                } else if (result == 0) {
                    //if they report 0 points give the away team 2
                    homePoints = 0;
                    awayPoints = 2;
                } else {
                    console.log('this isnt a valid result.')
                }
                reportedMatch['home'] = {
                    id: targetMatch.home,
                    points: homePoints
                };
                reportedMatch['away'] = {
                    id: targetMatch.away,
                    points: awayPoints
                }
            } else {
                //the reporting team was the away team;
                let homePoints = 0;
                let awayPoints = 0;
                //give away all the points
                if (result == 2) {
                    awayPoints = result
                } else if (result == 1) {
                    //if they report 1 point split the points
                    homePoints = 1;
                    awayPoints = 1;
                } else if (result == 0) {
                    //if they report 0 points give the home team 2
                    awayPoints = 0;
                    homePoints = 2;
                } else {
                    console.log('this isnt a valid result.')
                }
                reportedMatch['home'] = {
                    id: targetMatch.home,
                    points: homePoints
                };
                reportedMatch['away'] = {
                    id: targetMatch.away,
                    points: awayPoints
                }
            }

            found.division[division]['matches'].push(reportedMatch);
            found.markModified('division');
            found.save().then(
                (saved) => {
                    console.log('fin match reporting ', saved);
                }, (err) => {
                    console.log('Error match reporting ', err);
                }
            )
        } else {
            console.log('we got some bad something here pal');
        }

    }, (err) => {

    });
}

module.exports = {
    generateSeason: generateSeason,
    generateRoundSchedules: generateRoundSchedules,
    reportMatches: reportMatches
};