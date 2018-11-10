const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Division = require("../models/division-models");
const TeamSubs = require('../subroutines/team-subs');
const Team = require("../models/team-models");
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");

//this api retrieves all teams that do not have a division assigned, 
router.get('/getTeamsUndivisioned', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, (req, res) => {
    const path = '/admin/getTeamsUndivisioned';
    Team.find({
        $or: [
            { teamDivision: null },
            { teamDivision: { $exists: false } }
        ]
    }).then((results) => {
        if (results && results.length > 0) {
            res.status(200).send(util.returnMessaging(path, 'Found teams', false, results));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error querying teams', err));
    })
});

//this api pulls back all divisions
router.get('/getDivisionInfo', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/admin/getDivisonInfo'

    Division.find({}).then((found) => {
        res.status(200).send(util.returnMessaging(path, 'Returning division info.', false, found));
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error getting the division info.', err));
    })
});

//this api places a provided team in to a division according to provided name
router.post('/divisionTeams',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.divisionLevel, (req, res) => {
        const path = '/admin/divisionTeams';
        let div = req.body.divisionName;
        let recTeam = req.body.teamInfo;
        let teams = [];
        recTeam.forEach(element => {
            teams.push(element.teamName);
        });

        Division.findOne({ divisionConcat: div }).then((divInfo) => {
            Division.findOne({
                divisionConcat: divInfo.divisionConcat
            }).then((foundDiv) => {
                if (foundDiv) {
                    //make sure we don't double up teams in here
                    if (util.returnBoolByPath(foundDiv, 'teams')) {
                        foundDiv.teams.forEach(element => {
                            let index = teams.indexOf(element);
                            if (index > -1) {
                                teams.splice(index, 1);
                            }
                        });
                        foundDiv.teams.concat(teams);
                    } else {
                        foundDiv.teams = teams;
                    }
                    foundDiv.save().then((saved) => {
                        runTeamSub = true;
                        res.status(200).send(util.returnMessaging(path, 'Saved division', false, saved));
                        TeamSubs.upsertTeamsDivision(teams, {
                            displayName: divInfo.displayName,
                            divisionConcat: divInfo.divisionConcat
                        });
                    }, (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Error saving divsion', err));
                    })
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error finding division', err))
            })
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding div info', err));
        });
    })


module.exports = router;