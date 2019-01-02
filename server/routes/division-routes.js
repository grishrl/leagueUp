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


module.exports = router;