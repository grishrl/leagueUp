const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mvp = new Schema({
    "player_id": String,
    "match_id": String,
    "potg_link": String,
    "timeStamp": Number,
    "likes": Number,
    "season": Number,
    "likeHistory": [String]
});

const Mvp = mongoose.model('mvp', mvp);
module.exports = Mvp;