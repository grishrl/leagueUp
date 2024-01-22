const readInVods = require('../methods/sheets/sheets');
const logger = require('../subroutines/sys-logging-subs').logger;

function readInVodsWorker() {
    doWork();
    readInVodsLoop();
}

function doWork() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = ' read in vods ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'hourly import of vod links..';
    readInVods.readInVods();
    logger(logObj);
}

function readInVodsLoop() {
    setInterval(
        doWork, (60 * 60 * 1000)
    )
}

module.exports = readInVodsWorker;