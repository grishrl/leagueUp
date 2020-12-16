const StatsJobs = require('../cron-routines/stats-routines');
const logger = require('../subroutines/sys-logging-subs').logger;

function tabulateTeamStatsWorker() {
    doWork();
    // tabulateTeamStatsLoop()
}

function doWork() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = ' tabulate team stats ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'team stats';
    StatsJobs.tabulateTeamStats().then(
        (response) => {
            logObj.action = 'Tabulate Team Stats completed normally';
            logger(logObj);
        },
        err => {
            logObj.logLevel = 'ERROR';
            logObj.action = 'Tabulate Team Stats failed';
            logObj.error = err;
            logger(logObj);
        }
    );
}

function tabulateTeamStatsLoop() {
    setInterval(
        doWork, (60 * 60 * 1000)
    )
}

module.exports = tabulateTeamStatsWorker;