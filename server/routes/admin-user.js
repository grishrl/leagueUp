const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Admin = require("../models/admin-models");
const User = require('../models/user-models');
const UserSub = require('../subroutines/user-subs');
const TeamSub = require('../subroutines/team-subs');
const util = require('../utils');
const router = require('express').Router();
const request = require('request');

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
                let userKeys = Object.keys(user);
                userKeys.forEach(userKey => {
                    if (userKey != '_id') {
                        found[userKey] = user[userKey];
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
    User.find().then(
        found => {
            let ammountUpdated = 0;
            found.forEach(user => {
                let btag = routeFriendlyUsername(user.displayName);
                let reqURL = 'https://api.hotslogs.com/Public/Players/1/';
                request(reqURL + btag, {
                    json: true
                }, (err, res, body) => {
                    if (err) {
                        console.log(err)
                    };
                    var inc = 0
                    var totalMMR = 0;
                    var avgMMR = 0;
                    var playerid = null;
                    if (body) {
                        if (body.hasOwnProperty('LeaderboardRankings')) {


                            body['LeaderboardRankings'].forEach(element => {
                                if (element['GameMode'] != 'QuickMatch') {
                                    if (element['CurrentMMR'] > 0) {
                                        inc += 1;
                                        totalMMR += element.CurrentMMR;
                                    }
                                }
                            });
                            avgMMR = Math.round(totalMMR / inc);
                        } else {
                            if (body.hasOwnProperty('Message')) {
                                if (res['Message'].indexOf('invalid') > -1) {
                                    return 'error';
                                }
                            }
                        }
                        if (body.hasOwnProperty('PlayerID')) {
                            playerid = body['PlayerID'];
                        }
                    }

                    if (avgMMR > 0) {
                        user.averageMmr = avgMMR;
                    }
                    if (playerid) {
                        user.hotsLogsPlayerID = playerid;
                    }
                    user.save().then(
                        save => {
                            ammountUpdated += 1;
                        }
                    );
                })
            });
        },
        err => {
            console.log(err);
        }
    )
})

function routeFriendlyUsername(username) {
    if (username != null && username != undefined) {
        return username.replace('#', '_');
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
            var props = Object.keys(req.body);
            props.forEach(function(prop) {
                foundAdmin[prop] = req.body[prop];
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

module.exports = router;