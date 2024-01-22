const StatsJobs = require('../cron-routines/stats-routines');
const logger = require('../subroutines/sys-logging-subs').logger;

function tabulateUserStatsWorker() {
    doWork();
    // tabulateUserStatsLoop()
}

function doWork() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = ' tabulate user stats ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'player stats';
    StatsJobs.tabulateUserStats().then(
        (response) => {
            logObj.action = 'Tabulate User Stats completed normally';
            logger(logObj);
        },
        err => {
            logObj.logLevel = 'ERROR';
            logObj.action = 'Tabulate User Stats failed';
            logObj.error = err;
            logger(logObj);
        }
    );
}

function tabulateUserStatsLoop() {
    setInterval(
        doWork, (60 * 60 * 1000)
    )
}

module.exports = tabulateUserStatsWorker;