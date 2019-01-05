const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const systemSchema = new Schema({
    "dataName": String
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
    'location': String
})

const System = mongoose.model('system', systemSchema);
const Log = mongoose.model('log', logSchema);

module.exports = { systemSchema: systemSchema, Log: Log };