const router = require('express').Router();
const util = require('../utils');
const Event = require('../models/event-model');
const uniqid = require('uniqid');
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");


router.post('/upsert', passport.authenticate('jwt', {
    session: false
}), levelRestrict.events, util.appendResHeader, (req, res) => {

    const path = '/events/upsert';

    let orig = req.body.org_event;
    let event = req.body.event;

    let keys = Object.keys(orig);
    if (keys.length == 0) {
        event.uuid = uniqid();
        orig = event;
    }

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'create event';
    logObj.target = 'new event';
    logObj.logLevel = 'STD';

    Event.findOneAndUpdate(orig, event, { upsert: true, overwrite: false, new: true }).then(
        reply => {
            res.status(200).send(util.returnMessaging(path, "Event updated", false, reply, null, logObj));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Error creating event", err, null, null, logObj));
        }
    );

});

// //Get event by id

router.post('/get/id', (req, res) => {

    const path = '/events/get/id';

    let id = req.body.id;

    Event.findOne({ uuid: id }).then(
        found => {
            res.status(200).send(util.returnMessaging(path, "Event found", false, found));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Error getting event", err));
        }
    );

});

// //Get event by id

router.post('/get/params', (req, res) => {

    const path = '/events/get/params';

    let name = req.body.name;
    let date = req.body.date;
    let startRange = req.body.startRange;
    let endRange = req.body.endRange;
    let searchObj = { $or: [] };

    if (name) {
        searchObj.$or.push({ "eventName": name })
    }

    if (date) {
        searchObj.$or.push({
            "eventDate": date
        });
    }

    if (startRange && endRange) {
        searchObj.$or.push({
            "eventDate": {
                "$gte": startRange,
                "$lte": endRange
            }
        })

    }

    Event.find(searchObj).then(
        found => {
            res.status(200).send(util.returnMessaging(path, "Event found", false, found));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Error getting event", err));
        }
    );

});


//get all
router.post('/get/all', (req, res) => {

    const path = '/events/get/all';

    // let name = req.body.name;
    // let date = req.body.date;
    // let startRange = req.body.startRange;
    // let endRange = req.body.endRange;
    // let searchObj = {
    //     $or: []
    // };

    // if (name) {
    //     searchObj.$or.push({
    //         "eventName": name
    //     })
    // }

    // if (date) {
    //     searchObj.$or.push({
    //         "eventDate": date
    //     });
    // }

    // if (startRange && endRange) {
    //     searchObj.$or.push({
    //         "eventDate": {
    //             "$gte": startRange,
    //             "$lte": endRange
    //         }
    //     })

    // }

    Event.find({}).then(
        found => {
            res.status(200).send(util.returnMessaging(path, "Event found", false, found));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Error getting event", err));
        }
    );

});

//delete
router.post('/delete', passport.authenticate('jwt', {
    session: false
}), levelRestrict.events, util.appendResHeader, (req, res) => {
    const path = '/events/delete';
    let id = req.body.id;
    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'delete event';
    logObj.target = id;
    logObj.logLevel = 'STD';
    Event.findByIdAndDelete(id).then(
        deleted => {
            if (deleted) {
                res.status(200).send(util.returnMessaging(path, "Event deleted", false, deleted, null, logObj));
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Event not found';
                res.status(500).send(util.returnMessaging(path, "Error deleting; event not found", null, deleted, null, logObj));
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "Error deleting event", err));
        }
    )
})

module.exports = router;