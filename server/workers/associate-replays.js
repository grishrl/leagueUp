const StatsJobs = require('../cron-routines/stats-routines');
const logger = require('../subroutines/sys-logging-subs').logger;

function associateReplaysWorker() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = ' associate replay data ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'unassociated replays';
    StatsJobs.asscoatieReplays().then(
        (response) => {
            logObj.action = 'Associate Replays Completed Normally'
            logger(logObj);
        },
        err => {
            logObj.logLevel = 'ERROR';
            logObj.action = 'Associate Replays Failed'
            logObj.error = err;
            logger(logObj);
        }
    );
    // asscoatieReplaysLoop();
}

function asscoatieReplaysLoop() {
    setInterval(
        function() {
            associateReplaysWorker();
        }, 60 * 60 * 1000
    )
}

module.exports = associateReplaysWorker