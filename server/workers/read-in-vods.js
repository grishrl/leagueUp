const readInVods = require('../methods/sheets/sheets');
const logger = require('../subroutines/sys-logging-subs').logger;

function readInVodsWorker() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = ' read in vods ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'hourly import of vod links..';
    readInVods.readInVods();
    logger(logObj);
    readInVodsLoop();
}

function readInVodsLoop() {
    setInterval(
        function() {
            readInVodsWorker();
        }, 60 * 60 * 1000
    )
}

module.exports = readInVodsWorker;