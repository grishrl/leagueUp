const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const team = new Schema({
    "id": String,
    "teamName": String,
    "score": Number
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
        "url": String,
        "data": String
    },
    "2": {
        "url": String,
        "data": String
    }
}, { strict: false });

const division = new Schema({
    "displayName": String,
    "divisionConcat": String
}, {
    strict: false
});

const streamerSchema = new Schema({
    "name": String,
    "url": String
}, {
    strict: false
});

const matchSchema = new Schema({
    "matchId": String,
    "season": Number,
    "divison": division,
    "round": Number,
    "home": team,
    "away": team,
    "scheduledTime": scheduleSubSchema,
    "replays": replaySchema,
    "streamer": streamerSchema,
    "reported": Boolean
});


const Match = mongoose.model('match', matchSchema);

module.exports = Match;