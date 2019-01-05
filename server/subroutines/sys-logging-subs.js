const log = require('../models/system-models');

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