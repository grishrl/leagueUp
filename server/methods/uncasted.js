const moment = require('moment');
const fs = require('fs');
// const getMatches = require('./matches/getMatchesBy');
// const SeasonInfoCommon = require('./seasonInfoMethods');
// const getRegisteredTeams = require('./team/getRegistered');

function uncasted(teamData, reportedMatches) {

    // const teamData = await getRegisteredTeams();

    // dump all teams into a dictionary by team name
    const casts = {};
    const weekly = {};

    for (const team of teamData) {
        casts[team.teamName] = [];
        weekly[team.teamName] = [];
    }

    // now, get all reported matches

    const lastWeek = moment().subtract(1, 'week');

    // go through all reported matches, and find those with casters assigned
    for (const match of reportedMatches) {
        // if (!match.divisionConcat) continue;

        // invalid
        date = moment().subtract(1, 'year');
        if (match.scheduledTime) {
            date = moment(new Date(parseInt(match.scheduledTime.startTime)));
        }

        if (match.casterName && match.casterName !== '') {

            // push caster name onto casts just because we can
            if (!(match.home.teamName in casts)) {
                casts[match.home.teamName] = [];
            }

            casts[match.home.teamName].push(match.casterName);

            if (!(match.away.teamName in casts)) {
                casts[match.away.teamName] = [];
            }

            casts[match.away.teamName].push(match.casterName);
        } else if (date > lastWeek) {
            // no caster
            if (!(match.home.teamName in weekly)) weekly[match.home.teamName] = [];
            if (!(match.away.teamName in weekly)) weekly[match.away.teamName] = [];

            weekly[match.home.teamName].push(date);
            weekly[match.away.teamName].push(date);
        }
    }

    // put into array for filtering
    const TeamCastsArray = Object.keys(casts).map((name) => {
        return { name, castedBy: casts[name], casts: casts[name].length };
    });

    // 0 casts
    const UncastedTeams = TeamCastsArray.filter((obj) => obj.casts === 0);

    // 20 teams with lowest casts
    const sorted = TeamCastsArray.sort((a, b) => {
        return a.casts - b.casts;
    });

    const lowest20 = sorted.slice(0, 20);

    // weekly casts missed
    const missedCastArray = Object.keys(weekly)
        .map((name) => {
            return { name, missed: weekly[name].length };
        })
        .filter((t) => t.missed > 0);

    const report = {
        'TeamCastTotals': TeamCastsArray,
        'UncastedTeams': UncastedTeams,
        'lowest_20': lowest20,
        'missed_last_week': missedCastArray
    }

    return report;
}

module.exports = uncasted;