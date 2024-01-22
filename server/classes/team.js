const { mongo } = require('mongoose');
const utils = require('../utils');
const utls = require('../utils');
/**
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
    "assistantCaptain": [String],
    "invitedUsers": [String],
    "teamMMRAvg": Number, //added to display
    "hpMmrAvg": Number,
    "ngsMmrAvg": Number,
    "stormRankAvg": Number,
    "teamMembers": [miniUser], //added to display
    "pendingMembers": [miniUser],
    "lastTouched": Number,
    "replays": [String],
    "parseStats": Boolean,
    "ticker": String, //short aberviation of team name
    "ticker_lower": String,
    "history": [Object],
    "twitch": String,
    "twitter": String,
    "youtube": String
 */


//is there any benefit in makeing objects to handle these things?

function Team(mongoObj) {
    let TeamClass = {};

    TeamClass.mongoObj = {};
    TeamClass.jsonObj = {};

    if (mongoObj) {
        TeamClass.mongoObj = mongoObj;
        TeamClass.jsonObj = utils.objectify(mongoObj);
    }

    TeamClass.addTeamMember = function(membersToAdd) {

        if (!Array.isArray(membersToAdd)) {
            membersToAdd = [membersToAdd];
        }



    }

    TeamClass.save = function() {
        return mongoObj.save();
    }

    TeamClass.delete = function() {
        return mongoObj.remove();
    }


    return TeamClass;
}