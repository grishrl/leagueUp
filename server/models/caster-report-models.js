const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const casterReport = new Schema({
    casterName: String,
    casterId: String,
    coCasters: [String],
    coCasterIds: [String],
    matchId: String,
    division: String,
    vodLinks: [String],
    issue: String,
    season: Number,
    event: String,
    playlistCurrated: Boolean
})

const CasterReport = mongoose.model('casterReport', casterReport);

module.exports = {
    CasterReport: CasterReport
}