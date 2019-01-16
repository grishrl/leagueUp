const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    "recipient": String,
    "sender": String,
    "content": String,
    "subject": String,
    "timeStamp": Number,
    "notSeen": Boolean
});

const Message = mongoose.model('message', messageSchema);
module.exports = Message;