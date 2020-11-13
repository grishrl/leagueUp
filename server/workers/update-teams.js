const Teamjobs = require('../cron-routines/update-team');
const logger = require('../subroutines/sys-logging-subs').logger;


async function updateTeams() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = 'freshen up old teams ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'teams not update within 5 days';
    Teamjobs.updateTeamsNotTouched(process.env.daysToRefreshTeams, process.env.refreshTeamsLimit).then(reply => {
        logObj.action += 'Update teams completed normally';
        logger(logObj);
    }, err => {
        logObj.logLevel = "ERROR";
        logObj.action = 'Update teams Failed';
        logObj.error = err;
        logger(logObj);
    });
}

module.exports = updateTeams;