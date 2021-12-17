const logger = require('./subroutines/sys-logging-subs').logger;
const _ = require('lodash');

validateInputs = {};

validateInputs.array = function(input) {
    var retVal = { valid: false };;
    if (!isNullOrEmpty(input)) {
        retVal.valid = input instanceof Array ? true : false;
        if (retVal.valid) {
            retVal.value = input;
        }

    }
    return retVal;
}

validateInputs.string = function(input) {
    var retVal = { valid: false };
    if (!isNullOrEmpty(input)) {
        retVal.valid = typeof(input) == 'string' ? true : false;
        if (retVal.valid) {
            retVal.value = input;
        }
    }
    return retVal;
}

validateInputs.object = function(input) {
    var retVal = {
        valid: false
    };
    if (!isNullOrEmpty(input)) {
        retVal.valid = typeof(input) == 'object' ? true : false;
        if (retVal.valid) {
            retVal.type = 'object';
            retVal.value = input;
        }
    }
    return retVal;
}

validateInputs.number = function(input) {
    var retVal = { valid: false };;
    if (!isNullOrEmpty(input)) {
        retVal.valid = typeof(parseInt(input)) == 'number' ? true : false;
        if (retVal.valid) {
            retVal.value = parseInt(input);
        }
    }
    return retVal;
}

validateInputs.stringOrArrayOfStrings = function(input) {
    var retVal = { valid: false };;
    if (!isNullOrEmpty(input)) {
        if (typeof(input) == 'string') {
            retVal.valid = true;
        }
        if (input instanceof Array) {
            retVal.valid = true;
        }
        if (retVal.valid) {
            retVal.value = input;
        }
    }
    return retVal;
}

validateInputs.boolean = function(input) {
    var retVal = { valid: false };;
    if (!isNullOrEmpty(input)) {
        if (typeof(input) == 'string') {
            if (input == 'true') {
                retVal.valid = true;
                retVal.value = true;
            } else if (input == 'false') {
                retVal.valid = true;
                retVal.value = false;
            }
        }
        if (typeof(input) == 'boolean') {
            retVal.valid = true;
            retVal.value = input;
        }
    }
    return retVal;
}


isNullOrEmpty = function(dat) {
    if (dat == null || dat == undefined) {
        return true;
    }
    if (Array.isArray(dat)) {
        if (dat.length == 0) {
            return true;
        } else {
            return false;
        }
    } else if (typeof dat == 'object') {
        var noe = true;
        _.forEach(dat, (value, key) => {
            if (!isNullOrEmpty(value)) {
                noe = false;
            }
        });
        return noe;
    } else if (typeof dat == "string") {
        return dat.length == 0;
    } else {
        return false;
    }
};

removeInactiveTeams = function(teams) {
    let indexToRemove = [];
    teams.forEach((team, ind) => {
        if (team.teamName.includes('inactive') || team.teamName.includes('withdrawn')) {
            indexToRemove.push(ind);
        }
    });
    while (indexToRemove.length > 0) {
        let indToRem = indexToRemove.pop();
        teams.splice(indToRem, 1);
    }
    return teams;
}

returnIdString = function(obj) {
    let ret = '';
    if (!isNullorUndefined(obj)) {
        if (obj.hasOwnProperty('toString()')) {
            ret = obj.toString();
        } else {
            ret = obj + "";
        }
    } else {
        ret = "nil";
    }
    return ret;
}

isNullorUndefined = function(dat) {
    if (dat === null || dat === undefined) {
        return true;
    } else {
        return false;
    }
}

returnMessaging = function(route, message, err, obj, additional, logInfo) {
    var ret = {
        "message": message
    };

    if (route.indexOf('/api/') > -1) {
        ret.route = route;
    } else {
        ret.route = `/api/${route}`
    }

    if (!isNullorUndefined(err) && err) {
        if (err.hasOwnProperty('toString')) {
            ret.err = err.toString();
        } else {
            ret.err = JSON.stringify(err);
        }

    }
    if (!isNullorUndefined(obj) && obj) {
        ret.returnObject = obj;
    }
    if (!isNullorUndefined(additional)) {
        if (!ret.returnObject) {
            ret.returnObject = {};
        }
        ret.returnObject.additional = {};
        Object.assign(ret.returnObject.additional, additional);
    }

    let logObj = {};
    if (!isNullorUndefined(err) && err) {
        logObj.logLevel = 'ERROR';
        if (err.hasOwnProperty('toString')) {
            logObj.error = err.toString();
        } else {
            logObj.error = JSON.stringify(err);
        }
    } else {
        logObj.logLevel = 'STD';
    }
    if (logInfo) {
        if (logInfo.admin) {
            logObj.logLevel = 'ADMIN';
        }
        if (logInfo.actor) {
            logObj.actor = logInfo.actor;
        }
        if (logInfo.action) {
            logObj.action = logInfo.action;
        }
        if (logInfo.target) {
            logObj.target = logInfo.target;
        }
        if (logInfo.error) {
            logObj.error = logInfo.error;
        }
    }
    logObj.location = route;
    logObj.timeStamp = new Date().getTime();
    //dont log if we didnt get all the info from the caller
    if (logInfo) {
        logger(logObj);
    }

    return ret;
}

returnByPath = function(obj, path) {
    if (isNullOrEmpty(obj)) {
        return null;
    }
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
        //property exists:
        //property is an object, and the path is deeper, jump in!
        if (typeof obj[ele] == 'object' && pathArr.length > 1) {
            //remove first element of array
            pathArr.splice(0, 1);
            //reconstruct the array back into a string, adding "." if there is more than 1 element
            if (pathArr.length > 1) {
                path = pathArr.join('.');
            } else {
                path = pathArr[0];
            }
            //recurse this function using the current place in the object, plus the rest of the path
            retVal = returnByPath(obj[ele], path);
        } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
            retVal = obj[ele];
        } else {
            retVal = obj[ele]
        }
    }
    return retVal;
}

returnBoolByPath = function(obj, path) {
    //short circuit for a null object passed;
    if (isNullorUndefined(obj)) {
        return null;
    }

    obj = objectify(obj);
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //add some error checking to make sure we don't have null object passed
    if (obj == null || obj == undefined) {
        return false;
    }
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
        if (typeof obj[ele] == 'boolean') {
            retVal = true;
        }
        //property exists:
        //property is an object, and the path is deeper, jump in!
        else if (typeof obj[ele] == 'object' && pathArr.length > 1) {
            //remove first element of array
            pathArr.splice(0, 1);
            //reconstruct the array back into a string, adding "." if there is more than 1 element
            if (pathArr.length > 1) {
                path = pathArr.join('.');
            } else {
                path = pathArr[0];
            }
            //recurse this function using the current place in the object, plus the rest of the path
            retVal = returnBoolByPath(obj[ele], path);
        } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
            retVal = obj[ele];
        } else {
            retVal = obj[ele]
        }
    }
    if (typeof retVal == 'number' && retVal == 0) {
        retVal = 1;
    }
    return !!retVal;
}

function appendResHeader(request, response, next) {
    if (request.user.token != null || request.user.token != undefined) {
        response.setHeader('Authorization', 'Bearer ' + request.user.token);
    }
    next();
}

function sortMatchesByTime(matches) {
    matches.sort((a, b) => {
        let ret;
        if (!returnBoolByPath(a, 'scheduledTime.startTime')) {
            ret = -1;
        } else if (!returnBoolByPath(b, 'scheduledTime.startTime')) {
            ret = -1;
        } else {
            if (parseInt(a.scheduledTime.startTime) > parseInt(b.scheduledTime.startTime)) {
                ret = 1;
            } else {
                ret = -1;
            }
        }
        return ret;
    });
    return matches;
}

function objectify(obj) {
    if (obj) {
        try {
            let t = obj.toObject();
            if (returnBoolByPath(t, '_id')) {
                if (typeof t._id == 'object') {
                    t._id = t._id.toString()
                }
            }
            return t;
        } catch {
            return obj;
        }
    } else {
        return obj;
    }

}

function JSONCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

//simple console log for server side errors that will give me more info from the papertrail than a simple console.log;
//simple method to add a few peices of data together to log out
function errLogger(location, err, add) {
    // err = objectify(err);
    // err = JSON.stringify(err);
    let errLog = `Log @ ${location} : `;

    if (err.name && err.message) {
        errLog += ` ${err.name} : ${err.message} `
    }

    if (add) {
        errLog += `\n Additonal Message: ${add}`;
    }
    
    console.log(errLog, err);
}

module.exports = {
    isNullOrEmpty: isNullOrEmpty,
    isNullorUndefined: isNullorUndefined,
    returnMessaging: returnMessaging,
    returnByPath: returnByPath,
    returnBoolByPath: returnBoolByPath,
    appendResHeader: appendResHeader,
    returnIdString: returnIdString,
    sortMatchesByTime: sortMatchesByTime,
    objectify: objectify,
    removeInactiveTeams: removeInactiveTeams,
    errLogger: errLogger,
    JSONCopy: JSONCopy,
    validateInputs: validateInputs
};