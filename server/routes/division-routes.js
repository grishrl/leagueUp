const utils = require('../utils');
const router = require('express').Router();
const Division = require('../models/division-models');
const {
    commonResponseHandler
} = require('./../commonResponseHandler');


// this API returns a division according to the recieved division name
router.get('/get', (req, res) => {
    const path = '/division/get';

    const requiredParameters = [{
        name: 'division',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let divisionName = requiredParameters.division.value;
        return Division.findOne({
            divisionConcat: divisionName
        }).then((foundDiv) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Return division info', false, foundDiv)
            return response;
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding division', err)
            return response;
        });
    })

});

router.get('/get/by/teamname', (req, res) => {
    const path = '/division/get/by/teamname';
    var teamName = decodeURIComponent(req.query.teamName);

    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        return Division.findOne({
            teams: teamName
        }).then((foundDiv) => {
            if (foundDiv) {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Return division info', false, foundDiv)
                return response;
            } else {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Return division info', false, {})
                return response;
            }

        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding division', err);
            return response;
        });
    })
});

router.get('/get/all', (req, res) => {
    const path = '/division/get/all';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return Division.find({
            public: true
        }).then((foundDiv) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Return division info', false, foundDiv);
            return response;
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding division', err);
            return response;
        });
    })


});

///division/get/any
router.get('/get/any', (req, res) => {


    const requiredParameters = [{
        name: 'q',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let divInfo = requiredParameters.q.value;

        let query = {
            '$or': []
        }

        query["$or"].push({
            "displayName": divInfo
        });
        query["$or"].push({
            "divisionName": divInfo
        });
        query["$or"].push({
            "divisionConcat": divInfo
        });

        return Division.findOne(query).then((foundDiv) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Return division info', false, foundDiv);
            return response
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding division', err);
            return response;
        });
    })


});


module.exports = router;