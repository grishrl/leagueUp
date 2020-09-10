const log = require('../models/system-models');
const util = require('../utils');

//helper method to log server side activity to the database

//accepts : logObj: object - containing the log information we want,
// or
// lobObj:string - the level of the log, actor:string the - system or user performing the actoun, 
// action:string - action being performed, target: the object upon which actionw as performed, error:string - errors that occured
function logger(logObj, actor, action, target, error, deepLogging) {
    if (typeof logObj == 'object') {
        if (logObj.hasOwnProperty('deepLogging')) {
            logObj.deepLogging = JSON.stringify(logObj.deepLogging);
        }
        new log.Log(logObj).save();
    } else if (typeof logObj == 'string') {
        new log.Log({
            logLevel: logObj,
            actor: actor,
            action: action,
            target: target,
            error: error,
            deepLogging: JSON.stringify(deepLogging)
        }).save();
    } else {
        util.errLogger('sys-logging-subs', null, 'logger got bad data');
    }
}

function newLogger() {

    const logger = {
        logObj: {
            logLevel: '',
            actor: '',
            target: '',
            timeStamp: '',
            target: '',
            error: '',
            deepLoging: '',
            location: ''
        },
        log: function() {
            logger(this.logObj)
        }
    };
    return logger;
}

module.exports = {
    logger,
    newLogger
};