const hpUploadHandler = require('../cron-routines/uploadToHeroesProfile');
const logger = require('../subroutines/sys-logging-subs').logger;


function uploadToHeroesProfileWorker() {
    doWork();
    uploadToHeroesProfileLoop();
}

function doWork() {
    let logObj = {};
    logObj.actor = "SYSTEM";
    logObj.action = 'upload replays to hots-profile ';
    logObj.target = 'replays';
    logObj.logLevel = 'STD';
    logObj.timeStamp = Date.now();
    hpUploadHandler.postToHotsProfileHandler(process.env.replayUploadLimit).then(
        (response) => {
            logObj.action = 'Submitting replays to Hots Profile started';
            logger(logObj);
        },
        err => {
            logObj.logLevel = "ERROR";
            logObj.action = 'Submitting replays to Hots Profile failed';
            logObj.error = err;
            logger(logObj);
        }
    );
}

function uploadToHeroesProfileLoop() {
    setInterval(
        doWork, (60 * 60 * 1000)
    )
}

module.exports = uploadToHeroesProfileWorker;