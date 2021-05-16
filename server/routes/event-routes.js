const router = require('express').Router();
const utils = require('../utils');
const Event = require('../models/event-model');
const uniqid = require('uniqid');
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const { commonResponseHandler } = require('./../commonResponseHandler');


router.post('/upsert', passport.authenticate('jwt', {
    session: false
}), levelRestrict.events, utils.appendResHeader, (req, res) => {

    const path = '/events/upsert';

    const requiredParameters = [{
        name: 'event',
        type: 'object'
    }];

    const optionalParams = [{
        name: 'org_event',
        type: 'object'
    }]

    commonResponseHandler(req, res, requiredParameters, optionalParams, async(req, res, requiredParameters, optionalParams) => {
        const response = {};

        let orig = optionalParams.org_event.valid ? optionalParams.org_event.value : {};
        let event = requiredParameters.event.value;

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

        return Event.findOneAndUpdate(orig, event, {
            upsert: true,
            overwrite: false,
            new: true
        }).then(
            reply => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Event updated", false, reply, null, logObj)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, "Error creating event", err, null, null, logObj)
                return response;
            }
        );

    });

});

// //Get event by id

router.post('/get/id', (req, res) => {

    const path = '/events/get/id';



    const requiredParameters = [{
        name: 'id',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let id = requiredParameters.id.value;
        return Event.findOne({
            uuid: id
        }).then(
            found => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Event found", false, found)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, "Error getting event", err)
                return response;
            }
        );
    });

});

// //Get event by id

router.post('/get/params', (req, res) => {

    const path = '/events/get/params';

    const optionalParams = [
        { name: 'name', type: 'string' },
        {
            name: 'date',
            type: 'string'
        },
        {
            name: 'startRange',
            type: 'number'
        }, {
            name: 'endRange',
            type: 'number'
        }
    ]

    commonResponseHandler(req, res, [], optionalParams, async(req, res, requiredParams, optionalParams) => {
        const response = {};

        let searchObj = {
            $or: []
        };
        if (optionalParams.name.valid) {
            searchObj.$or.push({
                "eventName": optionalParams.name.value
            })
        }

        if (optionalParams.date.valid) {
            searchObj.$or.push({
                "eventDate": optionalParams.date.value
            });
        }

        if (optionalParams.startRange.valid && optionalParams.endRange.valid) {
            searchObj.$or.push({
                "eventDate": {
                    "$gte": optionalParams.startRange.value,
                    "$lte": optionalParams.endRange.value
                }
            })

        }

        return Event.find(searchObj).then(
            found => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Event found", false, found)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, "Error getting event", err);
                return response;
            }
        );
    })



});


//get all
router.post('/get/all', (req, res) => {

    const path = '/events/get/all';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return Event.find({}).then(
            found => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Event found", false, found);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, "Error getting event", err);
                return response;
            }
        );
    })


});

//delete
router.post('/delete', passport.authenticate('jwt', {
    session: false
}), levelRestrict.events, utils.appendResHeader, (req, res) => {
    const path = '/events/delete';
    let id = req.body.id;
    //log object

    const requiredParameters = [{
        name: 'id',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'delete event';
        logObj.target = requiredParameters.id.value;
        logObj.logLevel = 'STD';
        return Event.findByIdAndDelete(requiredParameters.id.value).then(
            deleted => {
                if (deleted) {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, "Event deleted", false, deleted, null, logObj);
                    return response;
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Event not found';
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, "Error deleting; event not found", null, deleted, null, logObj);
                    return response;
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, "Error deleting event", err);
                return response;
            }
        );
    })

})

module.exports = router;