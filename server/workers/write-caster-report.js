const writeSheet = require('../methods/sheets/sheets_write');
const CasterReportMethods = require('../methods/casterReportMethods');
const logger = require('../subroutines/sys-logging-subs').logger;

function writeCasterReport() {
    doWork();
    // readInVodsLoop();
}

function doWork() {
    let logObj = {};
    logObj.actor = 'SYSTEM/Worker';
    logObj.action = ' writing caster report ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    logObj.target = 'writing caster report';
    CasterReportMethods.generateCastReportData().then(
        report => {
            writeSheet.writeSheet(report);
            logObj.action = ' wrote caster report ';
            logger(logObj);
        },
        f => {
            logObj.error = f;
            logger(logObj);
        }
    );
}

function writeCasterLoop() {
    setInterval(
        doWork, (60 * 60 * 1000)
    )
}

module.exports = writeCasterReport;