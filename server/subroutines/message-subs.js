const Message = require('../models/message-models');
const socketMethods = require('./socket-io-methods');

function message(recipient, subject, content, sender) {
    if (typeof recipient == 'object') {
        new Message(recipient).save();
        let recp = recipient.recipient.toString();
        socketMethods.dispatchMessage(recp);
    } else if (typeof recipient == 'string') {
        new Message({
            recipient: recipient,
            subject: subject,
            content: content,
            timeStamp: new Date().getTime(),
            sender: sender,
            notSeen: true
        }).save();
        socketMethods.dispatchMessage(recipient);
    } else {
        console.log('messenger got bad data');
    }
}

module.exports = message;