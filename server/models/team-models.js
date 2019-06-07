const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const miniUser = new Schema({
    "displayName": String
});

const division = new Schema({
    "displayName": String,
    "divisionConcat": String
});


const teamSchema = new Schema({
    "logo": String,
    "teamName": String, //added to display form 
    "teamName_lower": String, //added so we can do case insensitive searching
    "divisionDisplayName": String,
    "divisionConcat": String,
    "stats": String, //later addition of team statistics
    "lookingForMore": Boolean, //added to display form
    "availability": Object,
    "competitiveLevel": Number,
    "rolesNeeded": Object,
    "descriptionOfTeam": String,
    "timeZone": String,
    "questionnaire": Object,
    "captain": String,
    "invitedUsers": [String],
    "teamMMRAvg": Number, //added to display
    "hpMmrAvg": Number,
    "ngsMmrAvg": Number,
    "teamMembers": [miniUser], //added to display
    "pendingMembers": [miniUser],
    "lastTouched": Number,
    "replays": [String],
    "parseStats": Boolean,
    "history": [Object]
});

const Team = mongoose.model('team', teamSchema);
// const miniTeam = mongoose.model('miniTeam', miniTeamSchema);
module.exports = Team;