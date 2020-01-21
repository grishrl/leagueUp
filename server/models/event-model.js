/*
Data model for events that will show on the calendar that are 'extra'-curricular to matches. 
General NGS Events
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


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