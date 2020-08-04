const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notesSchema = new Schema({
    "subjectId": String,
    "authorId": String,
    "note": String,
    "timeStamp": Number
});

const notes = mongoose.model('notes', notesSchema);
// const MiniUser = mongoose.model('miniUser', miniUser);

module.exports = notes;