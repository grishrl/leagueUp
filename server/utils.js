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

returnMessaging = function(route, message, err, obj, additional) {
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
            retVal = returnPath(obj[ele], path);
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
            retVal = returnBoolByPath(obj[ele], path);
        } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
            retVal = obj[ele];
        } else {
            retVal = obj[ele]
        }
    }
    return !!retVal;
}

module.exports = {
    isNullOrEmpty: isNullOrEmpty,
    isNullorUndefined: isNullorUndefined,
    returnMessaging: returnMessaging,
    returnByPath: returnByPath,
    returnBoolByPath: returnBoolByPath
};