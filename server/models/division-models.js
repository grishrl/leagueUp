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
    "lastTouched": String
});


const Division = mongoose.model('division', divisionInfoSchema);

module.exports = Division;