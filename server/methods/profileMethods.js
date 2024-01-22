/**
 * Helpful profile methods
 * 
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 */

const User = require('../models/user-models');

/**
 * @name returnDisplayNameFromId
 * @function
 * @description returns the display name for provided ID
 * @param {string} id 
 */
function returnDisplayNameFromId(id) {
    return User.findById(id).lean().then(
        res => {
            let name;
            if (res) {
                name = res.displayName;
            }
            return name
        },
        err => {
            throw err;
        }
    )
}

/**
 * @name returnIdFromDisplayName
 * @function
 * @description returns id for provided displayname
 * @param {string} displayName 
 */
function returnIdFromDisplayName(displayName) {
    return User.findOne({ displayName: displayName }).lean().then(
        res => {
            let name;
            if (res) {
                name = res._id.toString();
            }
            return name
        },
        err => {
            throw err;
        }
    )
}

module.exports = {
    returnDisplayNameFromId,
    returnIdFromDisplayName
}