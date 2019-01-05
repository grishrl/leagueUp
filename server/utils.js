const logger = require('./subroutines/sys-logging-subs');

isNullOrEmpty = function(dat) {
    if (dat == null || dat == undefined) {
        return true;
    }
    if (Array.isArray(dat)) {
        if (dat.length == 0) {
            return true;
        }
    } else if (typeof dat == 'object') {
        var noe = false;
        var keys = Object.keys(dat);
        keys.forEach(function(key) {
            if (isNullOrEmpty(dat[key])) {
                noe = true;
            }
        });
        return noe;
    } else if (typeof dat == "string") {
        return dat.length == 0;
    } else {
        return false;
    }
};

isNullorUndefined = function(dat) {
    if (dat === null || dat === undefined) {
        return true;
    } else {
        return false;
    }
}

returnMessaging = function(route, message, err, obj, additional, logInfo) {
    var ret = {
        "route": route,
        "message": message
    };
    if (!isNullOrEmpty(err) && err) {
        ret.err = err;
    }
    if (!isNullorUndefined(obj) && obj) {
        ret.returnObject = obj;
    }
    if (!isNullOrEmpty(additional)) {
        ret = Object.assign(additional, ret);
    }

    let logObj = {};
    if (!isNullOrEmpty(err) && err) {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
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
    logObj.timeStamp = new Date().getTime();
    //dont log if we didnt get all the info from the caller
    if (logInfo) {
        logger(logObj);
    }

    return ret;
}

returnByPath = function(obj, path) {
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
    return !!retVal;
}

function appendResHeader(request, response, next) {
    if (request.user.token != null || request.user.token != undefined) {
        response.setHeader('Authorization', 'Bearer ' + request.user.token);
    }
    next();
}

module.exports = {
    isNullOrEmpty: isNullOrEmpty,
    isNullorUndefined: isNullorUndefined,
    returnMessaging: returnMessaging,
    returnByPath: returnByPath,
    returnBoolByPath: returnBoolByPath,
    appendResHeader: appendResHeader
};