const utils = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Message = require('../models/message-models');
const passport = require("passport");
const {
    commonResponseHandler
} = require('./../commonResponseHandler');


router.post('/get/message', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = '/messageCenter/get/message';
    // let payload = req.body.recipient;

    const requiredParameters = [{
        name: 'recipient',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let payload = requiredParameters.recipient.value;
        return Message.find({
            recipient: payload
        }).then(
            foundMessage => {
                return appendUserNames(foundMessage).then(
                    processedMessages => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Found messages', null, processedMessages);
                        return response;
                    }, err => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Error processing messages', err)
                    }
                )

            },
            err => {
                res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding messages', err));
            }
        )
        return response;
    });
});

router.post('/get/message/numbers', (req, res) => {
    const path = '/messageCenter/get/message/numbers';

    const requiredParameters = [{
        name: 'recipient',
        type: 'string'
    }];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let payload = requiredParameters.recipient.value;

        return Message.find({
            $and: [{
                    recipient: payload
                },
                {
                    notSeen: true
                }
            ]
        }).then(
            foundMessage => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found messages', null, foundMessage.length);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding messages', err)
                return response;
            }
        );
    });
});

router.post('/mark/message/seen', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = '/messageCenter/mark/message/seen'

    const requiredParameters = [{
        name: 'message',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let msg = requiredParameters.message.value;

        return Message.findById(msg).then(
            found => {
                if (found) {
                    found.notSeen = false;
                    return found.save().then(
                        saved => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Message updated', null, saved);
                            return response;
                        },
                        err => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error saving message', err);
                            return response;
                        }
                    )
                } else {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Could not find messages', null, found);
                    return response;
                }

            },
            err => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Error setting message to read', err);
                return response;
            }
        );
    })


});

router.post('/delete/message', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = '/messageCenter/mark/message/seen'

    const requiredParameters = [{
        name: 'message',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let msg = requiredParameters.message.value;

        return Message.findByIdAndDelete(msg).then(
            found => {
                if (found) {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Message deleted', null, found)
                    return response;
                } else {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Could not find messages', null, found);
                    return response;
                }

            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error deleting message', err)
                return response;
            }
        );
    });
});

module.exports = router;


async function appendUserNames(msgs) {
    let userids = [];
    msgs.forEach(msg => {
        if (userids.indexOf(msg.recipient) === -1) {
            userids.push(msg.recipient);
        }
        if (userids.indexOf(msg.sender) === -1) {
            userids.push(msg.sender);
        }
    });
    let users = await User.find({ _id: { $in: userids } }).then(
        found => {
            return found;
        }, err => {
            return null;
        }
    )
    if (users) {
        msgs.forEach(msg => {
            users.forEach(user => {
                if (user._id == msg.recipient) {
                    msg.recipient = user.displayName;
                }
                if (user._id == msg.sender) {
                    msg.sender = user.displayName
                }
            })
        });
    }
    return msgs;
}