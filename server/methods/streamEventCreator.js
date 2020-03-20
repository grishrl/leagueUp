const Match = require('../models/match-model');
const utls = require('../utils');
const uniqid = require('uniqid');

async function createStreamEvent({ casterName, casterUrl, team1Name, team2Name, title, runTime, startTime, startNow }) {

    let matchObj = {};

    if (utls.isNullOrEmpty(casterName) || utls.isNullOrEmpty(casterUrl)) {
        throw new Error('Caser Name and Caster Url must not be empty.');
    } else {
        matchObj.casterName = casterName;
        matchObj.casterUrl = casterUrl;
    }

    if (utls.isNullOrEmpty(startTime) && utls.isNullOrEmpty(startNow)) {
        throw new Error('Start time or start now must be provided');
    }

    if (utls.isNullOrEmpty(team1Name) && utls.isNullOrEmpty(team2Name) && utls.isNullOrEmpty(title)) {
        throw new Error('Must provide team names or stream title.');

    } else if (!utls.isNullOrEmpty(team1Name) && !utls.isNullOrEmpty(team2Name)) {
        matchObj.home = {};
        matchObj.home.teamName = team1Name;
        matchObj.away = {};
        matchObj.away.teamName = team2Name;
    } else if (!utls.isNullOrEmpty(title)) {
        matchObj.title = title;
    }

    if (utls.isNullOrEmpty(startTime) || startNow) {
        startTime = Date.now();
    }

    if (utls.isNullOrEmpty(runTime)) {
        runTime = startTime + 5400000
    } else {
        runTime = runTime * 60 * 1000;
        runTime = startTime + runTime;
    }

    matchObj.scheduledTime = {};
    matchObj.scheduledTime.startTime = startTime;
    matchObj.scheduledTime.endTime = runTime;
    matchObj.matchId = uniqid();
    matchObj.streamOnly = true;

    return await new Match(matchObj).save().then(
        res => {
            return res;
        },
        err => {
            throw err;
        }
    );

}

module.exports = { createStreamEvent };