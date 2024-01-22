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
        "data": String,
        "tempUrl": String
    },
    "2": {
        "parsedUrl": String,
        "url": String,
        "data": String,
        "tempUrl": String
    },
    "3": {
        "parsedUrl": String,
        "url": String,
        "data": String,
        "tempUrl": String
    },
    "4": {
        "parsedUrl": String,
        "url": String,
        "data": String,
        "tempUrl": String
    },
    "5": {
        "parsedUrl": String,
        "url": String,
        "data": String,
        "tempUrl": String
    }
}, { strict: false });

/**
 * @typedef Match
 * @type {object}
 * @property {number} matchId - Divisions sort order in lists
 * @property {string} season - Name for display of division
 * @property {string} divisionConcat - system name of division
 * @property {string} round  - coast of the division, if applicable
 * @property {Object} home  - combination of the divisionName and divisionCoast
 * @property {Object} away  - top level mmr for division
 * @property {boolean} [streamOnly] flag whether this entry is a stream only
 * @property {Object} scheduledTime - object with the start and end times of the entry
 * @property {string} [scheduleDeadline] - time by which this match should be scheduled
 * @property {Object} replays - object containg replay info of the match
 * @property {string} casterName - name of caster of match
 * @property {string} casterUrl - url of caster of match
 * @property {Object} mapBans - object containing the map bans of the match
 * @property {Object} other - object containing any other info needed for reporting a match
 * @property {boolean} postedToHp - flag whether this match has been reported to heroes profile
 * @property {boolean} reported - flag whether this match has results reported
 * @property {boolean} forfeit - flag whether this match was forfeit
 * @property {string} notes - admin notes about match
 * @property {number} [boX] - number best of; defualt 3
 * @property {Array.<string>} vodLinks - array of links to the cast vod
 * @property {string} [parentId] - id of the NGS match the winner flows to
 * @property {Array.<string>} [idChildren] - list of NGS ids of children matches that feeds this match
 * @property {string} [challonge_match_ref] - xref to challonge match id (if tournament)
 * @property {string} [challonge_tournament_ref] - xref to challonge tournament id (if tournament)
 * @property {Array.<string>} [challonge_idChildren] - list of challonge ids of children matches that feeds this match
 * @property {string} [loserPath] - id of NGS match the loser should flow to in double elim
 * @property {string} [title] - title of the stream for a stream only entry
 * @property {string} [name] - title of the stream for a stream only entry
 * @property {string} [type] - type of entry this is, tournament, grandfinal, etc
 */

const matchSchema = new Schema({
    "matchId": String,
    "season": Number,
    "divisionConcat": String,
    "round": Number,
    "home": team,
    "away": team,
    "scheduledTime": scheduleSubSchema,
    "scheduleDeadline": String,
    "replays": replaySchema,
    "casterName": String,
    "casterUrl": String,
    "mapBans": Object,
    "other": Object,
    "postedToHP": Boolean,
    "reported": Boolean,
    "forfeit": Boolean,
    "notes": String,
    "boX": Number,
    "vodLinks": [String],
    "parentId": String,
    "idChildren": [String],
    "challonge_match_ref": String, //new properties for reference challonge matches
    "challonge_tournament_ref": String, //new properties for reference challonge matches
    "challonge_idChildren": [String], //new properties for reference challonge matches
    "loserPath": String, //new property for double elims, must track the loss path
    "title": String,
    "streamOnly": Boolean,
    "type": String,
    "name": String,

}, { useNestedStrict: false });


const Match = mongoose.model('match', matchSchema);

module.exports = Match;