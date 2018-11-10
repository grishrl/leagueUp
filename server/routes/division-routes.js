const util = require('../utils');
const router = require('express').Router();
const Division = require('../models/division-models');
const User = require("../models/user-models");
const Team = require("../models/team-models");
const passport = require("passport");


// this API returns a division according to the recieved division name
router.get('/get', (req, res) => {
    const path = '/division/get';
    var divisionName = req.query.division;
    console.log('divisionName ', divisionName);
    Division.findOne({
        divisionConcat: divisionName
    }).then((foundDiv) => {
        res.status(200).send(util.returnMessaging(path, 'Return division info.', false, foundDiv));
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division.', err));
    });
});


module.exports = router;