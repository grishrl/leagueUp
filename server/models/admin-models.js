const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef Permissions
 * @type {object}
 * @property {string} adminId - cross reference of user if
 * @property {boolean} LOGS - flag treu if access to logs
 * @property {boolean} TEAM - flag true if access to manage teams
 * @property {boolean} USER  - flag true if access to manage user
 * @property {boolean} DIVISION  - flag true if access to manage division
 * @property {boolean} STANDINGS  - flag true if access to manage standings
 * @property {boolean} TOURNAMENT  - flag true if access to manage tournaments
 * @property {boolean} CASTER  - flag true if caster
 * @property {boolean} MATCH  - flag true if access to manage matches
 * @property {boolean} ACL  - flag true if access to manage user access levels
 * @property {boolean} SCHEDULEGEN  - flag true if access to generate schedules
 * @property {boolean} EVENTS  - flag true if access to manage events
 */

const adminSchema = new Schema({
    "adminId": String,
    "LOGS": Boolean,
    "TEAM": Boolean,
    "USER": Boolean,
    "DIVISION": Boolean,
    "STANDINGS": Boolean,
    "TOURNAMENT": Boolean,
    "CASTER": Boolean,
    "MATCH": Boolean,
    "ACL": Boolean,
    "SCHEDULEGEN": Boolean,
    "EVENTS": Boolean
        //more as needed
});


const pendingMemberNotes = new Schema({
    "id": String,
    "note": String,
    "timeStamp": Number
});

const pendingMembersSchema = new Schema({
    "teamId": String,
    "teamName": String,
    "userId": String,
    "userName": String,
    "timestamp": Date,
    "notes": [pendingMemberNotes]
});

const pendingAvatarSchema = new Schema({
    'userId': String,
    'displayName': String,
    'fileName': String,
    'timestamp': Date
});


const pendingRankSchema = new Schema({
    'userId': String,
    "year": String,
    "season": String,
    'fileName': String,
    'timestamp': Date
});

const Admin = mongoose.model('admin', adminSchema);
const PendingQueue = mongoose.model('pendingQueue', pendingMembersSchema);
const PendingAvatarQueue = mongoose.model('pendingAvatarQueue', pendingAvatarSchema);
const PendingRankQueue = mongoose.model('pendingRankQueue', pendingRankSchema);

module.exports = {
    AdminLevel: Admin,
    PendingQueue: PendingQueue,
    PendingAvatarQueue: PendingAvatarQueue,
    PendingRankQueue: PendingRankQueue
};