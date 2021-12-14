const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const replayScheam = new Schema({
    "match": Object,
    "players": Object,
    "status": Number,
    "fullyAssociated": Boolean,
    "futureAssociated": Boolean,
    "leagueStats": Boolean,
    "systemId": String,
    "season": Number,
    "archiveId": String
}, {
    strict: false,
    useNestedStrict: false
});

const parsedReplay = mongoose.model('parsedReplay', replayScheam);

module.exports = parsedReplay;