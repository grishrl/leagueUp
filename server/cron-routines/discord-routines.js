/**
 * These were a play ground for some discord stuff; it is mostly defunct; I dont intend to comment this much now; unless its needed later.
 * 
 * reviewed: 9-30-2020
 * reviewer: wraith
 */
const Match = require('../models/match-model');
const mongoose = require('mongoose');
// const Standings = require('../subroutines/standings-subs'); -> void
const axios = require('axios');
const matchCom = require('../methods/matchCommon');
const Division = require('../models/division-models');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');

// connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});

async function getLeanMatches(query) {

    let foundMatches = await Match.find(query).lean().then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );

    return foundMatches;

}


async function getTodaysMatchesLean() {

    let returnMatches = null;

    let dayStart = new Date();
    let dayEnd = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 59, 59, 0);

    let dayStartMS = dayStart.getTime();
    let dayEndMS = dayEnd.getTime();

    let query = {
        $and: [{
                'scheduledTime.startTime': {
                    $exists: true
                }
            },
            {
                'scheduledTime.startTime': {
                    $gte: dayStartMS
                }
            },
            {
                'scheduledTime.startTime': {
                    $lte: dayEndMS
                }
            }
        ]
    }
    let matches = await getLeanMatches(query).then(
        res => {
            return res;
        },
        err => {
            return err;
        }
    );

    if (matches) {
        let readyToShip = await associateStandingsWithTeams(matches).then(res => { return res; }, err => { return null; });
        returnMatches = readyToShip;
    }
    return returnMatches;
}

async function associateStandingsWithTeams(matches) {

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let season = currentSeasonInfo.value;
    let standings = {};
    let divisions = [];
    matches.forEach(match => {
        if (divisions.indexOf(match.divisionConcat) == -1) {
            divisions.push(match.divisionConcat);
        }
    });
    for (var i = 0; i < divisions.length; i++) {
        let thisDiv = divisions[i];
        let standing = await Standings.calulateStandings(thisDiv, season).then(
            res => {
                return res;
            },
            err => {
                return err;
            }
        );
        if (standing) {
            standings[thisDiv] = standing;
        }
    }
    let divisionData = await Division.find({
        divisionConcat: {
            $in: divisions
        }
    }).lean().then(
        reply => {
            return reply;
        },
        err => {
            console.log(err);
            return null;
        }
    );

    matches.forEach(match => {
        match.divisionDisplayName = getDivisionNameFromConcat(divisionData, match.divisionConcat);
        match.divSort = getDivisionSortingFromConcat(divisionData, match.divisionConcat);
        let thisStandings = standings[match.divisionConcat];
        let homeTeam = match.home;
        let awayTeam = match.away;
        let homeTeamStanding = returnTeamFromStandingListById(homeTeam.id, thisStandings);
        let awayTeamStanding = returnTeamFromStandingListById(awayTeam.id, thisStandings);

        homeTeam['win'] = homeTeamStanding['wins'];
        homeTeam['loss'] = homeTeamStanding['losses'];
        homeTeam['standing'] = homeTeamStanding['standing'];

        awayTeam['win'] = awayTeamStanding['wins'];
        awayTeam['loss'] = awayTeamStanding['losses'];
        awayTeam['standing'] = awayTeamStanding['standing'];

    });

    matches = matchCom.addTeamInfoToMatch(matches).then(res => {
        return res;
    }, err => {
        return null;
    });

    return matches;

}

function returnTeamFromStandingListById(teamId, standingList) {
    let returnValue = null;
    standingList.forEach(teamStanding => {
        if (teamStanding.id == teamId) {
            returnValue = teamStanding;
        }
    });
    return returnValue;
}

async function postTodaysMatchesToDiscord() {
    getTodaysMatchesLean().then(
        res => {
            if (res) {
                let postObj = {
                    secret: process.env.discordAPItoken,
                    schedules: res
                }
                axios.post(process.env.discordServerAddress + process.env.discordServerSchedulePostApi, postObj).then(
                    reply => {
                        console.log(reply);
                    }, err => {
                        console.log(err);
                    }
                )
            }
        },
        err => {
            console.log(err);
        }
    )
}

postTodaysMatchesToDiscord()

module.exports = {
    getLeanMatches: getLeanMatches
};

function getDivisionNameFromConcat(divisionList, divConcat) {
    let returnDiv = '';
    divisionList.forEach(element => {
        if (element.divisionConcat == divConcat) {
            returnDiv = element.displayName;
        }
    });
    return returnDiv;
}

function getDivisionSortingFromConcat(divisionList, divConcat) {
    let returnDiv = -1;
    divisionList.forEach(element => {
        if (element.divisionConcat == divConcat) {
            returnDiv = element.sorting;
        }
    });
    return returnDiv;
}