const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Message = require('../models/message-models');
const passport = require("passport");

router.post('/get/message', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/messageCenter/get/message';
    let payload = req.body.recipient;
    Message.find({ recipient: payload }).then(
        foundMessage => {
            res.status(200).send(util.returnMessaging(path, 'Found messages', null, foundMessage));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error finding messages', err));
        }
    )
});

router.post('/get/message/numbers', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/messageCenter/get/message/numbers';
    let payload = req.body.recipient;
    Message.find({
        $and: [{
                recipient: payload
            },
            {
                notSeen: true
            }
        ]
    }).then(
        foundMessage => {
            res.status(200).send(util.returnMessaging(path, 'Found messages', null, foundMessage.length));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error finding messages', err));
        }
    )
});

router.post('/mark/message/seen', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/messageCenter/mark/message/seen'
    let msg = req.body.message;
    Message.findById(msg).then(
        found => {
            if (found) {
                found.notSeen = false;
                found.save().then(
                    saved => {
                        res.status(200).send(util.returnMessaging(path, 'Message updated', null, saved));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'Error saving message', err));
                    }
                )
            } else {
                res.status(400).send(util.returnMessaging(path, 'Could not find messages', null, found));
            }

        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error setting message to read', err));
        }
    )
});

router.post('/delete/message', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/messageCenter/mark/message/seen'
    let msg = req.body.message;
    Message.findByIdAndDelete(msg).then(
        found => {
            if (found) {
                res.status(200).send(util.returnMessaging(path, 'Message deleted', null, found));
            } else {
                res.status(400).send(util.returnMessaging(path, 'Could not find messages', null, found));
            }

        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error deleting message', err));
        }
    )
});

module.exports = router;