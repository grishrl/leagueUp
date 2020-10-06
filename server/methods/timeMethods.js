/*
Methods for handling time, adding, subtracting, zeroing to gmt etc..
 * reviewed: 10-5-2020
 * reviewer: wraith
 */

/**
 * @name addMil
 * @function
 * @description adds provided amount to original time
 * @param {number} time original predicate time
 * @param {number} plus amount to add
 */
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
/**
 * @name subtractMil
 * @function
 * @description subtracts provided amount to original time
 * @param {number} time original time
 * @param {number} less time to subtract from original
 */
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

/**
 * @name zeroGMT
 * @function
 * @description zeroes any time zone back to GMT
 * @param {number} time 
 * @param {number} timezone 
 */
function zeroGMT(time, timezone) {

    let localTime = time;
    if (typeof localTime === 'string') {
        localTime = convertToMil(localTime);
    }
    timezone = parseInt(timezone);
    let correct = localTime - (timezone * 100);

    return correct;
}

/**
 * @name convertToMil
 * @function
 * @description converts a time to military time
 * @param {string} time 
 */
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