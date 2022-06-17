const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const outreach = new Schema({
    "key": String,
    "teamName": String
});

const Outreach = mongoose.model('outreach', outreach);

module.exports = Outreach;