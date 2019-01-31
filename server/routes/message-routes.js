const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Message = require('../models/message-models');
const passport = require("passport");

// setInterval(function() {
//     if (clients.length > 0 && clients[0].clientId) {
//         let namespace = null;
//         let ns = socketIo.of(namespace || "/");
//         let socket = ns.connected[clients[0].clientId] // assuming you have  id of the socket
//         if (socket) {
//             console.log("Socket Connected, sent through socket");
//             socket.emit("event", clients);
//         } else {
//             console.log("Socket not connected, sending through push notification");
//         }
//     }
// }, 5000);

router.post('/get/message', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/messageCenter/get/message';
    let payload = req.body.recipient;
    Message.find({ recipient: payload }).then(
        foundMessage => {
            appendUserNames(foundMessage).then(
                processedMessages => {
                    res.status(200).send(util.returnMessaging(path, 'Found messages', null, processedMessages));
                }, err => {
                    res.status(500).send(util.returnMessaging(path, 'Error processing messages', err));
                }
            )

        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error finding messages', err));
        }
    )
});

router.post('/get/message/numbers', (req, res) => {
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