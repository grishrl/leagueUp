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

module.exports = {
    isNullOrEmpty: isNullOrEmpty,
    isNullorUndefined: isNullorUndefined,
    returnMessaging: returnMessaging
};