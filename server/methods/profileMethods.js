const User = require('../models/user-models');

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