const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Team = require("../models/team-models");
const passport = require("passport");

//return to client teams by division
router.get('/get', (req, res) => {
    const path = '/division/get';
    var divisionName = req.query.division;
    var coastalDivison = req.query.coast;
    if (util.isNullOrEmpty(coastalDivison)) {
        Team.find({ "teamDivision.divisionName": divisionName }).exec().then((found) => {
            if (found && found.length > 0) {
                res.status(200).send(util.returnMessaging(path, "Found teams!", false, found));
            } else {
                res.status(200).send(util.returnMessaging(path, "No teams found for division " + divisionName));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
        });
    } else {
        Team.find({
            "teamDivision.divisionName": divisionName,
            "teamDivision.divisionCoast": coastalDivison
        }).then((found) => {
            if (found && found.length > 0) {
                res.status(200).send(util.returnMessaging(path, "Found teams!", false, found));
            } else {
                res.status(200).send(util.returnMessaging(path, "No teams found for division " + divisionName));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
        });
    }
});

module.exports = router;