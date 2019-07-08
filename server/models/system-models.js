const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const systemSchema = new Schema({
    "dataName": String,
    "data": Object
}, {
    strict: false,
    useNestedStrict: false
});

const logSchema = new Schema({
    "logLevel": String,
    "actor": String,
    "action": String,
    "target": String,
    "timeStamp": Number,
    "error": String,
    'location': String,
    'deepLogging': String
});

const archiveSchema = new Schema({
    "season": Number,
    "type": String,
    "object": Object,
    "timeStamp": String
}, {
    useNestedStrict: false
})

const System = mongoose.model('system', systemSchema);
const Log = mongoose.model('log', logSchema);
const Archive = mongoose.model('archive', archiveSchema);

module.exports = {
    system: System,
    Log: Log,
    archive: Archive
};