const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Admin = require("../models/admin-models");
const User = require('../models/user-models');
const UserSub = require('../subroutines/user-subs');
const TeamSub = require('../subroutines/team-subs');
const util = require('../utils');
const router = require('express').Router();
const request = require('request');
const Avatar = require('../methods/avatarUpload');
const mmrMethods = require('../methods/mmrMethods');
const messageSub = require('../subroutines/message-subs');
const QueueSubs = require('../subroutines/queue-subs');
const _ = require('lodash');

router.post('/delete/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/delete/user';
    let user = req.body.displayName;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'delete user';
    logObj.target = user;
    logObj.logLevel = 'ADMIN';

    if (user == req.user.displayName) {
        logObj.logLevel = 'ERROR';
        logObj.error = 'Tried to delete theirselve';
        res.status(400).send(util.returnMessaging(path, 'You can\t delete yourself', null, null, null, logObj));
    } else {
        User.findOne({
            displayName: user
        }).then((foundUser) => {
            if (foundUser) {
                //if user is a captain to not delete:
                if (util.returnByPath(foundUser, 'isCaptain')) {
                    //if user is a capt, send error back
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Cannot delete user that is captain';
                    res.status(400).send(util.returnMessaging(path, 'Cannot delete user that is captain', false, foundUser, null, null, logObj));
                } else {
                    foundUser.remove().then((removed) => {
                        res.status(200).send(util.returnMessaging(path, 'User removed', null, removed, null, logObj));
                        UserSub.scrubUser(removed.displayName);
                    }, (remErr) => {
                        res.status(500).send(util.returnMessaging(path, 'Error removing user', remErr, null, null, logObj));
                    });
                }
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding user', err, null, null, logObj));
        });
    }

});

router.post('/user/save', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/user/save';

    let user = req.body.user;
    let id = user._id;
    let target = user.displayName
        //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'delete user';
    logObj.target = target;
    logObj.logLevel = 'ADMIN';

    if (user.teamId == 'nil') {
        user.teamId = null;
    }
    if (user.teamName == 'nil') {
        user.teamName = null;
    }


    User.findById(id).then(
        found => {
            if (found) {
                // let userKeys = Object.keys(user);
                // userKeys.forEach(userKey => {
                //     if (userKey != '_id') {
                //         found[userKey] = user[userKey];
                //     }
                // });
                _.forEach(user, (value, key) => {
                    if (key != '_id') {
                        found[key] = value;
                    }
                });
                found.save().then(
                    saved => {
                        res.status(200).send(util.returnMessaging(path, 'User saved!', null, saved, null, logObj));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'User saved!', err, false, null, logObj));
                    }
                )
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'User saved!', err, false, null, logObj));
        }
    )

});

router.post('/user/teamUpdate', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/user/teamUpdate';
    let user = req.body.displayName;
    let teamId = req.body.teamId;
    let teamName = req.body.teamName;

})

router.get('/user/update', (req, res) => {
    const path = '/admin/user/update';
    let query = {};
    if (req.query.user) {
        query['displayName'] = btagConvert(req.query.user);
    }
    User.find(query).then(
        found => {
            let ammountUpdated = 0;
            found.forEach(user => {
                mmrMethods.comboMmr(user.displayName).then(
                    processed => {
                        //leaving this here incase it stops any errors
                        if (util.returnBoolByPath(processed, 'hotsLogs')) {
                            user.averageMmr = processed.hotsLogs.mmr;
                            user.hotsLogsPlayerID = processed.hotsLogs.playerId;
                        }
                        if (util.returnBoolByPath(processed, 'heroesProfile')) {
                            if (processed.heroesProfile >= 0) {
                                user.heroesProfileMmr = processed.heroesProfile;
                                if (user.lowReplays) {
                                    user.lowReplays = false;
                                }
                            } else {
                                user.heroesProfileMmr = -1 * processed.heroesProfile;
                                user.lowReplays = true;
                            }
                        }
                        if (util.returnBoolByPath(processed, 'ngsMmr')) {
                            user.ngsMmr = processed.ngsMmr;
                        }
                        user.save().then(
                            save => {
                                ammountUpdated += 1;
                                util.errLogger(path, null, 'updated ' + ammountUpdated + ' users')
                            }
                        );
                    }
                )
            });
        }
    )
    res.status(200).send(util.returnMessaging(path, 'Update player mmr started successfully', null, null, {}));
});

function btagConvert(username) {
    if (username != null && username != undefined) {
        return username.replace('_', '#');
    } else {
        return '';
    }
}

//returns all users and acl lists
router.get('/user/get/usersacl/all', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userACL, util.appendResHeader, (req, res) => {
    const path = 'admin/user/get/usersacl/all';
    User.find({}).lean().then(
        users => {
            if (users) {
                let ids = [];
                users.forEach(user => {
                    ids.push(user._id.toString());
                });
                Admin.AdminLevel.find({
                    adminId: {
                        $in: ids
                    }
                }).then(
                    (adminRights) => {
                        if (adminRights) {
                            adminRights.forEach(admin => {
                                users.forEach(user => {
                                    if (admin.adminId == user._id) {
                                        user.adminRights = admin;
                                    }
                                });
                            });
                            res.status(200).send(util.returnMessaging(path, 'Found users ACL', false, users));
                        } else {
                            res.status(200).send(util.returnMessaging(path, 'No admin rights existed', false, users));
                        }
                    },
                    (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Error getting users acl', err));
                    });
            } else {
                res.status(400).send(util.returnMessaging(path, 'Found no users.', false));
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error getting users acl', err));
        }
    )
});

//returns specified users ACL
router.post('/user/get/usersacl', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userACL, util.appendResHeader, (req, res) => {
    let id = req.body.id;
    const path = 'admin/user/get/usersacl';
    User.findById(id).lean().then(
        users => {
            if (users) {
                Admin.AdminLevel.findOne({
                    adminId: users._id
                }).then(
                    (adminRights) => {
                        if (adminRights) {
                            users.adminRights = adminRights;
                            res.status(200).send(util.returnMessaging(path, 'Found users ACL', false, users));
                        } else {
                            res.status(200).send(util.returnMessaging(path, 'No admin rights existed', false, users));
                        }
                    },
                    (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Error getting users acl', err));
                    });
            } else {
                res.status(400).send(util.returnMessaging(path, 'Found no users.', false));
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error getting users acl', err));
        }
    )
});

//updates or creates user acl list
router.post('/user/upsertRoles', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userACL, util.appendResHeader, (req, res) => {
    const path = 'admin/user/upsertRoles';

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' updated users ACLs ';
    logObj.target = req.body.admin;
    logObj.logLevel = 'ADMIN';


    Admin.AdminLevel.findOne({
        adminId: req.body.adminId
    }).then((foundAdmin) => {
        if (foundAdmin) {
            // var props = Object.keys(req.body);
            // props.forEach(function(prop) {
            //     foundAdmin[prop] = req.body[prop];
            // });
            _.forEach(req.body, (value, key) => {
                foundAdmin[key] = value;
            });
            foundAdmin.save().then((savedAdmin) => {
                res.status(200).send(util.returnMessaging(path, 'Admin saved', false, savedAdmin, null, logObj));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error saving admin.', err, null, null, logObj));
            });
        } else {
            new Admin.AdminLevel(req.body).save().then((newAdmin) => {
                res.status(200).send(util.returnMessaging(path, 'Admin Created', false, newAdmin, null, logObj));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error creating admin', err, null, null, logObj));
            })
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding admin', err, null, null, logObj));
    })
});

//admin/approveAvatar
//approves a pending team member queue, removes the item from the queue and adds the member to the team
//updates the members profile to now be part of the team
router.post('/approveAvatar', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/approveAvatar';
    var userId = req.body.userId;
    var fileName = req.body.fileName;
    var approved = req.body.approved;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'pending avatar approval';

    logObj.logLevel = 'ADMIN';

    let msg = {};
    msg.sender = req.user._id;
    msg.subject = 'Profile Avatar Approval';
    msg.timeStamp = new Date().getTime()
    if (approved) {
        msg.content = 'Your avatar has been approved!';
    } else {
        msg.content = 'Your avatar has been denied!';
    }

    msg.notSeen = true;

    //find team matching the team in question
    User.findById(userId).then((foundUser) => {
        //we found the team
        if (foundUser) {
            logObj.target = foundUser.displayName + ' : ' + fileName + ' - approved: ' + approved;
            msg.recipient = foundUser._id;
            let oldAvatar;
            if (foundUser.avatar) {
                oldAvatar = foundUser.avatar;
            }
            //approved image
            if (approved) {
                foundUser.avatar = fileName;
                //if the image was approved delete the old profile; if it wasn't the pending or default image
                if (oldAvatar && oldAvatar != 'pendingAvatar.png' && oldAvatar != 'defaultAvatar.png') {
                    Avatar.deleteFile(oldAvatar);
                }
            } else {
                //not approved image
                //set image back to what it was; or default it wasnt something before
                if (oldAvatar && oldAvatar != 'pendingAvatar.png') {
                    foundUser.avatar = foundUser.avatar;
                } else {
                    foundUser.avatar = 'defaultAvatar.png';
                }
                Avatar.deleteFile(fileName);
            }

            foundUser.save().then(
                savedUser => {
                    if (savedUser) {
                        messageSub(msg);
                        QueueSubs.removePendingAvatarQueue(userId, fileName);
                        res.status(200).send(util.returnMessaging(path, 'User updated', null, savedUser, null, logObj));
                    }
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, 'User not updated', err, null, null, logObj))
                }
            )

        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'User was not found';
            res.status(500).send(util.returnMessaging(path, 'User not found', null, null, null, logObj))
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding user', err, null, null, logObj));
    })

});

module.exports = router;