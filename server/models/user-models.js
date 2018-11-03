const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const miniTeamSchema = new Schema({
    "teamName": String, //form input added
    "teamId": String
});

const hlRankShema = new Schema({
    "metal": String, //Form input added
    "division": Number //Form input added
});

const lfgSchema = new Schema({
    "availability": Object, //form input added  --- perhaps changed into 'avialability'
    "competitiveLevel": String, //form input added
    "descriptionOfPlay": String, //form input added
    "role": Object, //form input added
    "timeZone": String, //form input added
    "heroLeague": hlRankShema,
    "hotsLogsURL": String //form input added
});


const userSchema = new Schema({

    "bNetId": String,
    "displayName": String,
    "teamInfo": miniTeamSchema,
    "stats": String, //future plans to include stats to users later
    "messageCenter": Array,
    "lookingForGroup": Boolean, //form input added
    "lfgDetails": lfgSchema
});



const User = mongoose.model('user', userSchema);
// const MiniUser = mongoose.model('miniUser', miniUser);

module.exports = User;