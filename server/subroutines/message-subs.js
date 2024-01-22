/**
 * Messaging subroutine; handles the creation of system messages in the system collection
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */

const Message = require('../models/message-models');
// const socketMethods = require('./socket-io-methods');
const util = require('../utils');

//function for 
//accepts a message object, or recipeint:string,subject:string,content:string,sender:string,
/**
 * @name message
 * @function
 * @description sends system messages to users
 * 
 * @param {object | string} recipient 
 * @param {string} subject 
 * @param {string} content 
 * @param {string} sender 
 */
function message(recipient, subject, content, sender) {
    //if the first parameter is an object we will simply save that object to the message table
    if (typeof recipient == 'object') {
        new Message(recipient).save();
        let recp = recipient.recipient.toString();
        // socketMethods.dispatchMessage(recp);
    } else if (typeof recipient == 'string') { //otherwise we need to create an object with the individual parameters we were given
        new Message({
            recipient: recipient,
            subject: subject,
            content: content,
            timeStamp: new Date().getTime(),
            sender: sender,
            notSeen: true
        }).save();
        // socketMethods.dispatchMessage(recipient);
    } else {
        util.errLogger('message-sub', null, 'messenger got bad data');
    }
}

module.exports = message;