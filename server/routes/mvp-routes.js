const MvpMethods = require('../methods/mvpMethods');
const { commonResponseHandler } = require('./../commonResponseHandler');

const {
    confirmCaptain
} = require("../methods/confirmCaptain");

const utils = require('../utils');
const router = require('express').Router();
const passport = require("passport");


router.get('/get', (req, res) => {

    const path = '/mvp/get';

    const optionalParameters = [{
            name: 'type',
            type: 'string'
        },
        {
            name: 'list',
            type: 'string'
        },
        {
            name: 'id',
            type: 'string'
        }, {
            name: 'season',
            type: 'number'
        }
    ]

    commonResponseHandler(req, res, [], optionalParameters, async(req, res, requiredParameters, optionalParameters) => {
        const response = {};

        let type = optionalParameters['type'].value;
        let list = optionalParameters.list.value;
        let id = optionalParameters.id.value;
        let season = optionalParameters.season.value;

        if (utils.isNullorUndefined(id) && !utils.isNullorUndefined(list)) {

            let listArr = list.split(',');

            return MvpMethods.getList({
                type,
                listArr
            }).then(
                found => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found records', false, found);
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error fetching records', err)
                    return response;
                }
            );
        } else if (!utils.isNullorUndefined(id) && utils.isNullorUndefined(list)) {

            return MvpMethods.getById({
                type,
                id
            }).then(
                found => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found records', false, found);
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error fetching records', err);
                    return response;
                }
            )
        } else if (!utils.isNullOrEmpty(season)) {
            return MvpMethods.getBySeason(season).then(
                found => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found records', false, found);
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error fetching records', err);
                    return response;
                }
            )
        } else {

            return MvpMethods.getAll().then(
                found => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found records', false, found);
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error fetching records', err);
                    return response;
                }
            )
        }

    });

});

router.post('/upsert', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {

    const path = '/mvp/upsert';
    MvpMethods.upsert(req.body).then(
        found => {
            found = utils.objectify(found);
            if (req.body.displayName) {
                found.displayName = req.body.displayName;
            }
            res.status(200).send(
                utils.returnMessaging(req.originalUrl, 'Record created', false, found)
            );
        },
        err => {
            res.status(500).send(
                utils.returnMessaging(req.originalUrl, 'Error creating record', err)
            );
        }
    )

});

router.post('/like', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const path = '/mvp/like';

    const requiredParameters = [{
        name: 'id',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        return MvpMethods.like(requiredParameters.id.value, req.user._id).then(
            found => {
                found = utils.objectify(found);
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Record updated', false, found);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error updating record', err);
                return response;
            }
        );

    });

});

module.exports = router;