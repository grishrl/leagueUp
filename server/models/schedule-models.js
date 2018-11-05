const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchResultSchema = new Schema({
    winTeam: 'teamname',
    replayFile: url
});

const matchSchema = new Schema({

    teamA: String, //teamName
    teamB: String, //teamName
    dateTime: Date, //scheduled time of match
    outcome: {
        game1: matchResultSchema,
        game2: matchResultSchema
    }

});

const Match = mongoose.model('match', matchSchema);

module.exports = Match;