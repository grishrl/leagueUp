const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
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

module.exports = router;