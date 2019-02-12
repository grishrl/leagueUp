const Teamjobs = require('./server/cron-routines/update-team');
const logger = require('./server/subroutines/sys-logging-subs');

let logObj = {};
logObj.actor = 'SYSTEM; CRON';
logObj.action = ' update team MMR cron runner; updating';
logObj.timeStamp = new Date().getTime();
logObj.logLevel = 'STD';
logObj.target = 'teams not update within 5 days';
console.log('starting the job! ')
Teamjobs.updateTeamsNotTouched(5).then(reply => {
    logObj.action += reply.length;
    logger(logObj);
    console.log('finished up');
    process.exit();
}, err => {
    logObj.logLevel = "ERROR";
    logObj.error = err;
    logger(logObj);
    console.log(err);
    process.exit();
});