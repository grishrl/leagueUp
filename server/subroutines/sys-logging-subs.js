/**
 * Logging Subs -> logs messages to the db for checking in case things bork up
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */
const log = require('../models/system-models');

/**
 * @name logger
 * @function
 * @description helper method to log server side activity to the database
 * @param {Object | string} logObj 
 * @param {string} actor 
 * @param {string} action 
 * @param {string} target 
 * @param {string} error 
 * @param {Object} deepLogging 
 */
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
        console.log('sys-logging-subs logger got bad data');
    }
}

//might start using this... it would be nice not to have to define a durn log object all the durn time!
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