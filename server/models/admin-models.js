const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    "adminId": String,
    "TEAM": Boolean,
    "USER": Boolean,
    "DIVISON": Boolean,
    "STANDINGS": Boolean
        //more as needed
});

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;