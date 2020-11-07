const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Log = require('../models/system-models');

// passport.authenticate('jwt', {
// session: false
// }),
router.get('/logs', passport.authenticate('jwt', {
    session: false
}), levelRestrict.logs, util.appendResHeader, (req, res) => {

    const path = 'admin/logs';

    try {
        Log.Log.find().sort({ timeStamp: -1 }).then(
            found => {
                res.status(200).send(util.returnMessaging(path, 'Got logs', null, found, null));
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Error getting logs', err, null, null));
            }
        )
    } catch (e) {
        console.log('admin logs catch', e)
        res.status(500).send(util.returnMessaging(path, 'Error getting logs', e, null, null));
    }


});

module.exports = router;