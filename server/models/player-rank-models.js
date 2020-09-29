const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankSchema = new Schema({
    season: String,
    imageUrl: String,
    rank: String
})

const playerRankSchema = new Schema({
    "playerId": String,
    "ranks": [rankSchema]
});


const PlayerRanks = mongoose.model('userRanks', playerRankSchema);
// const MiniUser = mongoose.model('miniUser', miniUser);

module.exports = PlayerRanks;