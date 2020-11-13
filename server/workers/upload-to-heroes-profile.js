const hpUploadHandler = require('../cron-routines/uploadToHeroesProfile');
const logger = require('../subroutines/sys-logging-subs').logger;


function uploadToHeroesProfileWorker() {
    let logObj = {};
    logObj.actor = "SYSTEM";
    logObj.action = 'upload replays to hots-profile ';
    logObj.target = 'replays';
    logObj.logLevel = 'STD';
    hpUploadHandler.postToHotsProfileHandler(process.env.replayUploadLimit).then(
        (response) => {
            logObj.action = 'Submitting replays to Hots Profile completed normally ';
            logger(logObj);
        },
        err => {
            logObj.logLevel = "ERROR";
            logObj.action = 'Submitting replays to Hots Profile failed';
            logObj.error = err;
            logger(logObj)
                // res.status(500).send(util.returnMessaging(path, 'Submitting replays to Hots Profile Failed', err, null, null, logObj));
        }
    );
    uploadToHeroesProfileLoop();
}

function uploadToHeroesProfileLoop() {
    setInterval(
        function() {
            uploadToHeroesProfileWorker();
        }, 60 * 60 * 1000
    )
}

module.exports = uploadToHeroesProfileWorker;