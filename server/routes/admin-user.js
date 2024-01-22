const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Admin = require("../models/admin-models");
const User = require('../models/user-models');
const UserSub = require('../subroutines/user-subs');
const utils = require('../utils');
const router = require('express').Router();
const Avatar = require('../methods/avatarUpload');
const mmrMethods = require('../methods/mmrMethods');
const messageSub = require('../subroutines/message-subs');
const QueueSubs = require('../subroutines/queue-subs');
const _ = require('lodash');
const notesMethods = require('../methods/notes/notes');
const prMethods = require('../methods/player-rank-upload');
const { commonResponseHandler } = require('./../commonResponseHandler');

router.post('/delete/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/delete/user';

    const requiredParameters = [{
        name: 'displayName',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let user = requiredParameters.displayName.value;
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'delete user';
        logObj.target = user;
        logObj.logLevel = 'ADMIN';

        if (user == req.user.displayName) {
            logObj.logLevel = 'ERROR';
            logObj.error = 'Tried to delete theirselve';
            response.status = 400;
            response.message = utils.returnMessaging(req.originalUrl, 'You can\t delete yourself', null, null, null, logObj);
            return response;
        } else {
            return User.findOne({
                displayName: user
            }).then((foundUser) => {
                if (foundUser) {
                    //if user is a captain to not delete:
                    if (utils.returnByPath(foundUser, 'isCaptain')) {
                        //if user is a capt, send error back
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Cannot delete user that is captain';
                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, 'Cannot delete user that is captain', false, foundUser, null, null, logObj)
                        return response;
                    } else {
                        return foundUser.remove().then((removed) => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'User removed', null, removed, null, logObj)
                            UserSub.scrubUser(removed.displayName);
                            notesMethods.deleteAllNotesWhere(removed._id.toString());
                            return response;
                        }, (remErr) => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error removing user', remErr, null, null, logObj)
                            return response;
                        });
                    }
                }
            }, (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding user', err, null, null, logObj)
                return response
            });
        }
    })

});

router.post('/user/save', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/user/save';

    const requiredParameters = [{
        name: 'user',
        type: 'object'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let user = requiredParameters.user.value;
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


        return User.findById(id).then(
            found => {
                if (found) {
                    _.forEach(user, (value, key) => {
                        if (key != '_id') {
                            found[key] = value;
                        }
                    });
                    return found.save().then(
                        saved => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'User saved!', null, saved, null, logObj)
                            return response;
                        },
                        err => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'User saved!', err, false, null, logObj)
                            return response;
                        }
                    )
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'User saved!', err, false, null, logObj)
                return response;
            }
        );
    })

});

// router.post('/user/teamUpdate', passport.authenticate('jwt', {
//     session: false
// }), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
//     const path = '/admin/user/teamUpdate';
//     let user = req.body.displayName;
//     let teamId = req.body.teamId;
//     let teamName = req.body.teamName;

// })

router.get('/user/update', (req, res) => {
    const path = '/admin/user/update';

    const requiredParameters = [{
        name: 'user',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let query = {};

        query['displayName'] = btagConvert(requiredParameters.user.value);

        User.find(query).then(
            found => {
                let ammountUpdated = 0;
                found.forEach(user => {
                    mmrMethods.comboMmr(user.displayName).then(
                        processed => {
                            //leaving this here incase it stops any errors
                            if (utils.returnBoolByPath(processed, 'hotsLogs')) {
                                user.averageMmr = processed.hotsLogs.mmr;
                                user.hotsLogsPlayerID = processed.hotsLogs.playerId;
                            }
                            if (utils.returnBoolByPath(processed, 'heroesProfile')) {
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
                            if (utils.returnBoolByPath(processed, 'ngsMmr')) {
                                user.ngsMmr = processed.ngsMmr;
                            }

                            user.save().then(
                                save => {
                                    ammountUpdated += 1;
                                    utils.errLogger(path, null, 'updated ' + ammountUpdated + ' users')
                                }
                            );
                        }
                    )
                });
            }
        )
        response.status = 200;
        response.message = utils.returnMessaging(req.originalUrl, 'Update player mmr started successfully', null, null, {})
        return response;
    });
});

//returns all users and acl lists
router.get('/user/get/usersacl/all', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userACL, utils.appendResHeader, (req, res) => {
    const path = 'admin/user/get/usersacl/all';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return User.find({}).lean().then(
            users => {
                if (users) {
                    let ids = [];
                    users.forEach(user => {
                        ids.push(user._id.toString());
                    });
                    return Admin.AdminLevel.find({
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
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'Found users ACL', false, users);
                                return response;
                            } else {
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'No admin rights existed', false, users)
                                return response;
                            }
                        },
                        (err) => {
                            response.status = 500
                            response.message = utils.returnMessaging(req.originalUrl, 'Error getting users acl', err);
                            return response;
                        });
                } else {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found no users.', false)
                    return response;
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting users acl', err)
            }
        );
    })
});

//returns specified users ACL
router.post('/user/get/usersacl', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userACL, utils.appendResHeader, (req, res) => {
    let id = req.body.id;
    const path = 'admin/user/get/usersacl';

    const requiredParameters = [{
        name: 'id',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        return User.findById(requiredParameters.id.value).lean().then(
            users => {
                if (users) {
                    return Admin.AdminLevel.findOne({
                        adminId: users._id
                    }).then(
                        (adminRights) => {
                            if (adminRights) {
                                users.adminRights = adminRights;
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'Found users ACL', false, users)
                                return response;
                            } else {
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'No admin rights existed', false, users)
                                return response;
                            }
                        },
                        (err) => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error getting users acl', err)
                            return response;
                        });
                } else {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found no users.', false)
                    return response;
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting users acl', err)
                return response;
            }
        );
    })
});

//updates or creates user acl list
router.post('/user/upsertRoles', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userACL, utils.appendResHeader, (req, res) => {
    const path = 'admin/user/upsertRoles';

    const requiredParameters = [{
        name: 'adminId',
        type: 'string'
    }];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' updated users ACLs ';
        logObj.target = req.body.admin;
        logObj.logLevel = 'ADMIN';


        return Admin.AdminLevel.findOne({
            adminId: req.body.adminId
        }).then((foundAdmin) => {
            if (foundAdmin) {
                _.forEach(req.body, (value, key) => {
                    foundAdmin[key] = value;
                });
                return foundAdmin.save().then((savedAdmin) => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Admin saved', false, savedAdmin, null, logObj)
                    return response;
                }, (err) => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error saving admin.', err, null, null, logObj)
                    return response;
                });
            } else {
                return new Admin.AdminLevel(req.body).save().then((newAdmin) => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Admin Created', false, newAdmin, null, logObj)
                    return response;
                }, (err) => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error creating admin', err, null, null, logObj)
                    return response;
                })
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding admin', err, null, null, logObj)
            return response;
        });
    });
});

//admin/approveAvatar
//approves a pending team member queue, removes the item from the queue and adds the member to the team
//updates the members profile to now be part of the team
router.post('/approveAvatar', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/approveAvatar';

    const requiredParameters = [{
        name: 'approved',
        type: 'boolean'
    }, {
        name: 'fileName',
        type: 'string'
    }, {
        name: 'userId',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'pending avatar approval';

        var userId = requiredParameters.userId.value;
        var fileName = requiredParameters.fileName.value;
        var approved = requiredParameters.approved.value;

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
        return User.findById(userId).then((foundUser) => {
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
                        Avatar.deleteAvatar(oldAvatar);
                    }
                } else {
                    //not approved image
                    //set image back to what it was; or default it wasnt something before
                    if (oldAvatar && oldAvatar != 'pendingAvatar.png') {
                        foundUser.avatar = foundUser.avatar;
                    } else {
                        foundUser.avatar = 'defaultAvatar.png';
                    }
                    Avatar.deleteAvatar(fileName);
                }

                return foundUser.save().then(
                    savedUser => {
                        if (savedUser) {
                            messageSub(msg);
                            QueueSubs.removePendingAvatarQueue(userId, fileName);
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'User updated', null, savedUser, null, logObj)
                            return response;
                        }
                    },
                    err => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'User not updated', err, null, null, logObj)
                        return response;
                    }
                )

            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'User was not found';
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'User not found', null, null, null, logObj)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding user', err, null, null, logObj);
            return response;
        });
    });

});


router.post('/approveRank', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {

    const path = '/admin/approveRank';

    /*
      userId
      hlRankMetal
      hlRankDivision
      seasonInf
      verified 
    */

    const requiredParameters = [{
        name: '',
        type: ''
    }]

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let rankObj = req.body;

        if (rankObj.verified) {

            //method to handle this sit
            return prMethods.playerRankApproved(rankObj).then(
                success => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'User updated', null, success, null)
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'User not updated', err, null, null)
                    return response;
                }
            )

        } else {

            //append the person who denied this to the obj for messaging.
            rankObj.sender = req.user._id;
            //method to handle this sit
            return prMethods.playerRankDenied(rankObj).then(
                success => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'User updated', null, success, null)
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'User not updated', err, null, null)
                    return response;
                }
            )

        }
    });

})

module.exports = router;

function btagConvert(username) {
    if (username != null && username != undefined) {
        return username.replace('_', '#');
    } else {
        return '';
    }
}