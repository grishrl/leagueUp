const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveSchema = new Schema({
    season: Number,
    replays: [String]
});

const seasonInf = new Schema({
    "year": String,
    "season": String
});

//this will hold the ranks of the player verified by the new rank check system
const rankSchema = new Schema({
    "hlRankMetal": String,
    "hlRankDivision": Number,
    "season": String,
    "year": String,
    "status": String, //pending, verified
    "level": {
        type: Number,
        required: false
    }
});

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
    "groupMaker": Boolean,
    "hotsLogsPlayerID": String,
    "averageMmr": Number,
    "heroesProfileMmr": Number,
    "ngsMmr": Number,
    "lowReplays": Boolean,
    "pendingTeam": Boolean,
    "toonHandle": String, //used for tieng profile to replays submitted
    "discordTag": String,
    "discordId": String,
    "lastTouched": Number,
    "replays": [String],
    "replayArchive": [archiveSchema],
    "parseStats": Boolean,
    "smurfAccount": Boolean,
    "seasonsPlayed": Number,
    "history": [Object], //history of player in NGS
    "avatar": String,
    "twitch": String,
    "casterName": String,
    "twitter": String,
    "youtube": String,
    "patron": String,
    "verifiedRankHistory": [rankSchema],
    "adminNotes":String,
    "accountAlias":String
});

const User = mongoose.model('user', userSchema);
// const MiniUser = mongoose.model('miniUser', miniUser);

module.exports = User;