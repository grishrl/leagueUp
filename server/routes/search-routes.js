const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Team = require('../models/team-models');
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

router.post('/user/unteamed', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/unteamed';
    let payload = req.body.userName;
    let regEx = new RegExp(payload, "i");
    User.find({
        $and: [{
                displayName: regEx
            },
            {
                $or: [
                    { teamName: null },
                    { teamName: undefined },
                    { teamId: null },
                    { teamId: undefined }
                ]
            },
            {
                $or: [
                    { pendingTeam: null },
                    { pendingTeam: false }
                ]
            }

        ]
    }).exec().then((foundUsers) => {
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

router.post('/team', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/team';
    let payload = req.body.teamName.toLowerCase();
    let regEx = new RegExp(payload, "i");
    Team.find({
        teamName_lower: regEx
    }).exec().then((foundTeams) => {
        if (foundTeams && foundTeams.length > 0) {
            let ret = [];
            foundTeams.forEach(function(team) {
                ret.push(team.teamName);
            })
            res.status(200).send(util.returnMessaging(path, "Found Teams", false, ret));
        } else {
            res.status(200).send(util.returnMessaging(path, "Found Teams", false, foundTeams));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
    });
});

module.exports = router;