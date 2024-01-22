/*
Data model for events that will show on the calendar that are 'extra'-curricular to matches. 
General NGS Events
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef Event
 * @type {object}
 * @property {string} eventName - Name of event
 * @property {number} eventDate - Time of event
 * @property {string} eventDescription - Description of event
 * @property {string} eventLink  - Link to event stream, etc
 * @property {string} eventBlurb  - Short hype of event
 * @property {string} eventImage  - file name of the event image
 * @property {string} uuid  - id for event
 */

const EventSchema = new Schema({
    "eventName": String,
    "eventDate": Number,
    "eventDescription": String,
    "eventLink": String,
    "eventBlurb": String,
    "eventImage": String,
    "uuid": String
});

const Event = mongoose.model('event', EventSchema);

module.exports = Event;