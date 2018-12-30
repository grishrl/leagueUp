const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const matchSchema = new Schema({
    "season": Number,
    "divisionDisplayName": String,
    "divisionConcat": String
}, {
    strict: false,
    useNestedStrict: false
});

const Scheduling = mongoose.model('schedule', matchSchema);

module.exports = Scheduling;