const mongoose = require('mongoose');
// const user = require(__dirname + '/user-models');
const Schema = mongoose.Schema;

const miniUser = new Schema({
    "systemId": String,
    "displayName": String
});

const division = new Schema({
    "divisionName": String,
    "coastalDivision": String
});

const lfmSchema = new Schema({
    "availability": Object,
    "competitiveLevel": Number,
    "desctiptionOfTeam": String,
    "rolesNeeded": Object,
    "timeZone": String
});


const teamSchema = new Schema({
    "teamId": String,
    "logo": String,
    "teamName": String, //added to display form 
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