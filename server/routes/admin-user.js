const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Admin = require("../models/admin-models");
const User = require('../models/user-models');
const UserSub = require('../subroutines/user-subs');
const TeamSub = require('../subroutines/team-subs');
const util = require('../utils');
const router = require('express').Router();

router.post('/delete/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {
    const path = '/admin/delete/user';
    let user = req.body.displayName;
    if (user == req.user.displayName) {
        res.status(400).send(util.returnMessaging(path, 'You can\t delete yourself'));
    } else {
        User.findOne({
            displayName: user
        }).then((foundUser) => {
            if (foundUser) {
                //if user is a captain to not delete:
                if (util.returnByPath(foundUser, 'isCaptain')) {
                    //if user is a capt, send error back
                    res.status(400).send(util.returnMessaging(path, 'Cannot delete user that is captain', false, foundUser));
                } else {
                    foundUser.remove().then((removed) => {
                        res.status(200).send(util.returnMessaging(path, 'User removed'));
                        UserSub.scrubUser(removed.displayName);
                    }, (remErr) => {
                        res.status(500).send(util.returnMessaging(path, 'Error removing user', remErr));
                    });
                }
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding user', err));
        });
    }

});
//res.status(500).send(util.returnMessaging(path, 'Error getting users acl', err));
router.get('/user/get/usersacl/all', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
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

router.post('/user/get/usersacl', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
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

router.post('/user/upsertRoles', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'admin/user/upsertRoles';
    Admin.AdminLevel.findOne({
        adminId: req.body.adminId
    }).then((foundAdmin) => {
        if (foundAdmin) {
            var props = Object.keys(req.body);
            props.forEach(function(prop) {
                foundAdmin[prop] = req.body[prop];
            });
            foundAdmin.save().then((savedAdmin) => {
                res.status(200).send(util.returnMessaging(path, 'Admin saved', false, savedAdmin));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error saving admin.', err));
            });
        } else {
            new Admin.AdminLevel(req.body).save().then((newAdmin) => {
                res.status(200).send(util.returnMessaging(path, 'Admin Created', false, newAdmin));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error creating admin', err));
            })
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding admin', err));
    })
});

module.exports = router;