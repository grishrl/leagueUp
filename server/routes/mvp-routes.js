const MvpMethods = require('../methods/mvpMethods');

const {
    confirmCaptain
} = require("../methods/confirmCaptain");

const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");


router.get('/get', (req, res) => {

    const path = '/mvp/get';

    let type = req.query.type;
    let list = req.query.list;
    let id = req.query.id;

    if (util.isNullorUndefined(id) && !util.isNullorUndefined(list)) {

        MvpMethods.getList({ type, list }).then(
            found => {
                res.status(200).send(
                    util.returnMessaging(path, 'Found records', false, found)
                );
            },
            err => {
                res.status(500).send(
                    util.returnMessaging(path, 'Error fetching records', err)
                );
            }
        );
    } else if (!util.isNullorUndefined(id) && util.isNullorUndefined(list)) {

        MvpMethods.getById({ type, id }).then(
            found => {
                res.status(200).send(
                    util.returnMessaging(path, 'Found records', false, found)
                );
            },
            err => {
                res.status(500).send(
                    util.returnMessaging(path, 'Error fetching records', err)
                );
            }
        )
    } else {

        MvpMethods.getAll().then(
            found => {
                res.status(200).send(
                    util.returnMessaging(path, 'Found records', false, found)
                );
            },
            err => {
                res.status(500).send(
                    util.returnMessaging(path, 'Error fetching records', err)
                );
            }
        )
    }

});

router.post('/upsert', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {

    const path = '/mvp/upsert';
    MvpMethods.upsert(req.body).then(
        found => {
            found = found.toObject();
            if (req.body.displayName) {
                found.displayName = req.body.displayName;
            }
            res.status(200).send(
                util.returnMessaging(path, 'Record created', false, found)
            );
        },
        err => {
            res.status(500).send(
                util.returnMessaging(path, 'Error creating record', err)
            );
        }
    )

});

module.exports = router;