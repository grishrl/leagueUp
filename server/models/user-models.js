const mongoose = require('mongoose');
const Schema = mongoose.Schema;


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
    "pendingTeam": Boolean,
    "toonHandle": String, //used for tieng profile to replays submitted
    "discordTag": String,
    "lastTouched": Number,
    "replays": [String],
    "parseStats": Boolean
});



const User = mongoose.model('user', userSchema);
// const MiniUser = mongoose.model('miniUser', miniUser);

module.exports = User;