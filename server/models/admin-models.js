const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const pendingMembersSchema = new Schema({
    "teamId": String,
    "teamName": String,
    "userId": String,
    "userName": String,
    "timestamp": Date
});

const pendingAvatarSchema = new Schema({
    'userId': String,
    'displayName': String,
    'fileName': String,
    'timestamp': Date
});

const Admin = mongoose.model('admin', adminSchema);
const PendingQueue = mongoose.model('pendingQueue', pendingMembersSchema);
const PendingAvatarQueue = mongoose.model('pendingAvatarQueue', pendingAvatarSchema);

module.exports = {
    AdminLevel: Admin,
    PendingQueue: PendingQueue,
    PendingAvatarQueue: PendingAvatarQueue
};