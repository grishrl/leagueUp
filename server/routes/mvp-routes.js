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
    let season = req.query.season;

    if (util.isNullorUndefined(id) && !util.isNullorUndefined(list)) {

        let listArr = list.split(',');
        console.log(listArr);
        MvpMethods.getList({
            type,
            listArr
        }).then(
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
    } else if (!util.isNullOrEmpty(season)) {
        MvpMethods.getBySeason(season).then(
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
            found = util.objectify(found);
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

router.post('/like', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = '/mvp/like';
    MvpMethods.like(req.body.id, req.user._id).then(
        found => {
            found = util.objectify(found);
            res.status(200).send(
                util.returnMessaging(path, 'Record updated', false, found)
            );
        },
        err => {
            res.status(500).send(
                util.returnMessaging(path, 'Error updating record', err)
            );
        }
    )

});

module.exports = router;