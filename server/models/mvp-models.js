const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * typedef Mvp
 * @type {object}
 * @property {string} player_id - id of player for MVP
 * @property {string} match_id - id of match
 * @property {string} potg_link - URL to play of the game
 * @property {number} timeStamp - timestamp
 * @property {number} likes - number of likes this has 
 * @property {number} season - season this occured
 * @property {Array.<string>} likeHistory - array of user ids that have liked
 */

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