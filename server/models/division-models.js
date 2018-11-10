const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const divisionSchema = new Schema({
    "divisionId": String,
    "divisionName": String,
    "teams": [String]
});

const Divison = mongoose.model('division', divisionSchema);

module.exports = Divison;