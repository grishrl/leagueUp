const mongoose = require('mongoose');
const team = require('../models/team-models');
const Schema = mongoose.Schema;


const

const divisionSchema = new Schema({
    "divisionId": String,
    "divisionName": String,
    "teams": [team.miniTeam]
});

const Divison = mongoose.model('division', divisionSchema);

module.exports = Divison;