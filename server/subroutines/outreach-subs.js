const Outreach = require('../models/outreach-model');
const util = require('../utils');
const logger = require('../subroutines/sys-logging-subs');

//TODO: add to logging


//this updates the team name in the outreach queue  so that if a team name changes and there 
// was an outstanding invite, the connection can still be made.
function updateOutreachTeamname(oldteamName, newteamName) {
    let logObj = {};
    logObj.logLevel = 'STD';
    logObj.action = ' update team name recorded in the outreach queue ';
    logObj.timeStamp = new Date().getTime();
    logObj.actor = 'SYSTEM';

    Outreach.find({ teamName: oldteamName }).then((foundOutreach) => {
        if (foundOutreach && foundOutreach.length > 0) {
            foundOutreach.forEach(outreach => {
                if (outreach.teamName == oldteamName) {
                    outreach.teamName = newteamName;
                }
                foundOutreach.save().then((saved) => {
                    logObj.target = saved._id;
                    logger(logObj);

                }, (err) => {
                    logObj.logLevel = 'ERROR';
                    logObj.error = err;
                    logger(logObj)

                })
            });
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
    })
}

module.exports = {
    updateOutreachTeamname: updateOutreachTeamname
}