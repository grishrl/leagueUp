const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const divisionInfoSchema = new Schema({
    "sorting": Number,
    "displayName": String,
    "divisionName": String,
    "divisionCoast": String,
    "divisionConcat": String,
    "maxMMR": Number,
    "minMMR": Number,
    "teams": [String],
    "lastTouched": String,
    "public": Boolean,
    "cupDiv": Boolean,
    "DRR": Boolean,
    "participants": [String],
    "tournaments": [String], //tournament references for cup divs
    "moderator": String
});


const Division = mongoose.model('division', divisionInfoSchema);

module.exports = Division;