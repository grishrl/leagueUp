const Message = require('../models/message-models');

function message(recipient, subject, body, sender) {
    if (typeof recipient == 'object') {
        new Message(recipient).save();
    } else if (typeof logObj == 'string') {
        new Message({
            recipient: recipient,
            subject: subject,
            body: body,
            timeStamp: new Date().getTime(),
            sender: sender,
            notSeen: true
        }).save();
    } else {
        console.log('messenger got bad data');
    }
}

module.exports = message;