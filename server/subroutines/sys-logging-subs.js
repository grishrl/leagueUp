const log = require('../models/system-models');

//helper method to log server side activity to the database

//accepts : logObj: object - containing the log information we want,
// or
// lobObj:string - the level of the log, actor:string the - system or user performing the actoun, 
// action:string - action being performed, target: the object upon which actionw as performed, error:string - errors that occured
function logger(logObj, actor, action, target, error) {
    if (typeof logObj == 'object') {
        new log.Log(logObj).save();
    } else if (typeof logObj == 'string') {
        new log.Log({
            logLevel: logObj,
            actor: actor,
            action: action,
            target: target,
            error: error
        }).save();
    } else {
        console.log('logger got bad data');
    }
}

module.exports = logger;