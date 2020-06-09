const util = require('../utils');
const router = require('express').Router();
const Division = require('../models/division-models');


// this API returns a division according to the recieved division name
router.get('/get', (req, res) => {
    const path = '/division/get';
    var divisionName = req.query.division;
    Division.findOne({
        divisionConcat: divisionName
    }).then((foundDiv) => {
        res.status(200).send(util.returnMessaging(path, 'Return division info', false, foundDiv));
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division', err));
    });
});

router.get('/get/by/teamname', (req, res) => {
    const path = '/division/get/by/teamname';
    var teamName = decodeURIComponent(req.query.teamName);
    Division.findOne({
        teams: teamName
    }).then((foundDiv) => {
        if (foundDiv) {
            res.status(200).send(util.returnMessaging(path, 'Return division info', false, foundDiv));
        } else {
            res.status(200).send(util.returnMessaging(path, 'Return division info', false, {}));
        }

    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division', err));
    });
});

router.get('/get/all', (req, res) => {
    const path = '/division/get/all';
    Division.find({
        public: true
    }).then((foundDiv) => {
        res.status(200).send(util.returnMessaging(path, 'Return division info', false, foundDiv));
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division', err));
    });
});

///division/get/any
router.get('/get/any', (req, res) => {
    var divInfo = decodeURIComponent(req.query.q);

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

    Division.findOne(query).then((foundDiv) => {
        res.status(200).send(util.returnMessaging(path, 'Return division info', false, foundDiv));
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division', err));
    });
});


module.exports = router;