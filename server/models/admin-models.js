const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    "adminId": String,
    "TEAM": Boolean,
    "USER": Boolean,
    "DIVISION": Boolean,
    "STANDINGS": Boolean,
    "CASTER": Boolean,
    "MATCH": Boolean,
    "ACL": Boolean,
    "SCHEDULEGEN": Boolean,
    "EVENTS": Boolean
        //more as needed
});

const pendingMembersSchema = new Schema({
    "teamName": String,
    "userName": String,
    "timestamp": Date
});

const Admin = mongoose.model('admin', adminSchema);
const PendingQueue = mongoose.model('pendingQueue', pendingMembersSchema);

module.exports = {
    AdminLevel: Admin,
    PendingQueue: PendingQueue
};