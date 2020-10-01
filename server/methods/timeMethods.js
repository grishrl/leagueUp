//method for adding mil times
function addMil(time, plus) {
    let hour = Math.floor(time / 100) * 100;
    let min = time - hour;
    min = min + plus;
    if (min >= 60) {
        hour = hour + 100;
        min = min - 60;
    }
    return ((hour) + min);
}

//method for subtracting mil times
function subtractMil(time, less) {
    let hour = Math.floor(time / 100) * 100;
    let min = time - hour;
    if (min == 0) {
        hour = hour - 100;
        min = 60 - less;
    } else {
        min = min - less;
    }
    if (min < 0) {
        hour = hour - 100;
        min = min + 60;
    }
    return ((hour) + min);
}

//zeroes any time zone back to GMT
function zeroGMT(time, timezone) {

    let localTime = time;
    if (typeof localTime === 'string') {
        localTime = convertToMil(localTime);
    }
    timezone = parseInt(timezone);
    let correct = localTime - (timezone * 100);

    return correct;
}

//convert a time to military time
function convertToMil(time) {
    if (typeof time === 'string') {
        let colonSplit = time.split(':');
        return parseInt(colonSplit[0]) * 100 + parseInt(colonSplit[1]);
    } else {
        return null;
    }
}

module.exports = {
    addMil,
    subtractMil,
    zeroGMT,
    convertToMil,
}