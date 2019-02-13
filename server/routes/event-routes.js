const util = require('../utils');
const router = require('express').Router();
const Event = require('../models/event-model');
const uniqid = require('uniqid');
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");

//Edit or create new event

router.post('test', (req, res) => {
    res.send("it worked");
})

// router.post('upsert', passport.authenticate('jwt', {
//     session: false
// }), levelRestrict.events, util.appendResHeader, (req, res) => {

//     const path = '/event/upsert';

//     const orig = req.body.event;
//     const event = req.body.event;

//     if (util.isNullOrEmpty(orig)) {
//         event.uuid = uniqid();
//         orig = event;
//     }

//     //log object
//     let logObj = {};
//     logObj.actor = req.user.displayName;
//     logObj.action = 'create event';
//     logObj.target = 'new event';
//     logObj.logLevel = 'STD';

//     Event.findOneAndUpdate(orig, event).then(
//         reply => {
//             res.status(200).send(util.returnMessaging(path, "Event updated", false, reply, null, logObj));
//         },
//         err => {
//             res.status(500).send(util.returnMessaging(path, "Error creating event", err, null, null, logObj));
//         }
//     );

// });

// //Get event by id

// router.post('get/id', (req, res) => {

//     const path = '/event/get/id';

//     let id = req.body.id;

//     Event.findOne({ uuid: id }).then(
//         found => {
//             res.status(200).send(util.returnMessaging(path, "Event found", false, found));
//         },
//         err => {
//             res.status(500).send(util.returnMessaging(path, "Error getting event", err));
//         }
//     );

// });

// //Get event by id

// router.post('get/params', (req, res) => {

//     const path = '/event/get/params';

//     let name = req.body.name;
//     let date = req.body.date;
//     let startRange = req.body.startRange;
//     let endRange = req.body.endRange;
//     let searchObj = { $or: [] };

//     if (name) {
//         searchObj.$or.push({ "eventName": name })
//     }

//     if (date) {
//         searchObj.$or.push({
//             "eventDate": date
//         });
//     }

//     if (startRange && endRange) {
//         let ranges = [{
//             $lte: startRange
//         }, {
//             $lte: endRange
//         }];
//         searchObj.$or.push({
//             "$and": ranges
//         });
//     }

//     Event.find(searchObj).then(
//         found => {
//             res.status(200).send(util.returnMessaging(path, "Event found", false, found));
//         },
//         err => {
//             res.status(500).send(util.returnMessaging(path, "Error getting event", err));
//         }
//     );

// });

module.exports = router;