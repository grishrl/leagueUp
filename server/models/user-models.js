const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveSchema = new Schema({
    season: Number,
    replays: [String]
})

const userSchema = new Schema({
    "bNetId": String,
    "displayName": String,
    "teamId": String,
    "teamName": String,
    "isCaptain": Boolean,
    "hlRankMetal": String,
    "hlRankDivision": Number,
    "stats": String, //future plans to include stats to users later
    "messageCenter": Array,
    "lookingForGroup": Boolean, //form input added
    "availability": Object, //form input added  --- perhaps changed into 'avialability'
    "competitiveLevel": String, //form input added
    "descriptionOfPlay": String, //form input added
    "role": Object, //form input added
    "timeZone": String, //form input added
    "hotsLogsURL": String, //form input added
    "hotsLogsPlayerID": String,
    "averageMmr": Number,
    "heroesProfileMmr": Number,
    "ngsMmr": Number,
    "lowReplays": Boolean,
    "pendingTeam": Boolean,
    "toonHandle": String, //used for tieng profile to replays submitted
    "discordTag": String,
    "lastTouched": Number,
    "replays": [String],
    "replayArchive": [archiveSchema],
    "parseStats": Boolean,
    "smurfAccount": Boolean,
    "seasonsPlayed": Number,
    "history": [Object] //history of player in NGS
});


/**
 * {
 *  <seasonNumber>:['replays']
 * }
 */

const User = mongoose.model('user', userSchema);
// const MiniUser = mongoose.model('miniUser', miniUser);

module.exports = User;