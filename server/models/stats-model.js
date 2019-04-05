const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statisticsModel = new Schema({
    "stats": Object,
    "associateId": Object,
    "season": Number
}, {
    strict: false,
    useNestedStrict: false
});

const Statistics = mongoose.model('Statistics', statisticsModel);

module.exports = Statistics;