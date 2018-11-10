const mongoose = require('mongoose');
// const user = require(__dirname + '/user-models');
const Schema = mongoose.Schema;

const miniUser = new Schema({
    "displayName": String
});

const division = new Schema({
    "displayName": String,
    "divisionConcat": String
});

const lfmSchema = new Schema({
    "availability": Object,
    "competitiveLevel": Number,
    "descriptionOfTeam": String,
    "rolesNeeded": Object,
    "timeZone": String
});


const teamSchema = new Schema({
    "logo": String,
    "teamName": String, //added to display form 
    "teamName_lower": String, //added so we can do case insensitive searching
    "teamDivision": division, //added to display form -- maybe an object???
    "stats": String, //later addition of team statistics
    "lookingForMore": Boolean, //added to display form
    "lfmDetails": lfmSchema,
    "captain": String,
    "teamMMRAvg": Number, //added to display
    "teamMembers": [miniUser], //added to display
    "pendingMembers": [miniUser]
});

const Team = mongoose.model('team', teamSchema);
// const miniTeam = mongoose.model('miniTeam', miniTeamSchema);
module.exports = Team;