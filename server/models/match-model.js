const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const team = new Schema({
    "id": String,
    "teamName": String,
    "score": Number,
    "dominator": Boolean
}, {
    strict: false
});

const scheduleSubSchema = new Schema({
    "priorScheduled": Boolean,
    "startTime": String,
    "endTime": String
}, {
    strict: false
});

const replaySchema = new Schema({
    "1": {
        "parsedUrl": String,
        "url": String,
        "data": String
    },
    "2": {
        "parsedUrl": String,
        "url": String,
        "data": String
    },
    "3": {
        "parsedUrl": String,
        "url": String,
        "data": String
    },
    "4": {
        "parsedUrl": String,
        "url": String,
        "data": String
    },
    "5": {
        "parsedUrl": String,
        "url": String,
        "data": String
    }
}, { strict: false });

const matchSchema = new Schema({
    "matchId": String,
    "season": Number,
    "divisionConcat": String,
    "round": Number,
    "home": team,
    "away": team,
    "title": String,
    "streamOnly": Boolean,
    "scheduledTime": scheduleSubSchema,
    "replays": replaySchema,
    "casterName": String,
    "type": String,
    "name": String,
    "parentId": String,
    "idChildren": [String],
    "casterUrl": String,
    "mapBans": Object,
    "other": Object,
    "postedToHP": Boolean,
    "reported": Boolean,
    "scheduleDeadline": String,
    "forfeit": Boolean,
    "notes": String,
    "boX": Number,
    "vodLinks": [String],
    "challonge_match_ref": String, //new properties for reference challonge matches
    "challonge_tournament_ref": String, //new properties for reference challonge matches
    "challonge_idChildren": [String], //new properties for reference challonge matches
    "loserPath": String //new property for double elims, must track the loss path
}, { useNestedStrict: false });


const Match = mongoose.model('match', matchSchema);

module.exports = Match;