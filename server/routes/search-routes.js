const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const passport = require("passport");

router.post('/user', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user';
    let payload = req.body.userName;
    let regEx = new RegExp(payload, "i");
    User.find({ displayName: regEx }).exec().then((foundUsers) => {
        if (foundUsers && foundUsers.length > 0) {
            let ret = [];
            foundUsers.forEach(function(user) {
                ret.push(user.displayName);
            })
            res.status(200).send(util.returnMessaging(path, "Found Users", false, ret));
        } else {
            res.status(200).send(util.returnMessaging(path, "Found Users", false, foundUsers));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "Error finding users", err));
    })
});

module.exports = router;