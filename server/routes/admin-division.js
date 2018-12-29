const util = require('../utils');
const router = require('express').Router();
const Division = require("../models/division-models");
const DivSubs = require('../subroutines/division-subs');
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
            { divisionConcat: null },
            {
                divisionConcat: {
                    $exists: false
                }
            },
            {
                "divisionDisplayName": null
            },
            {
                "divisionDisplayName": {
                    $exists: false
                }
            }
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
// passport.authenticate('jwt', {
// session: false
// }),

//NOTICE this route is not secured because it is used for pulling back division lists et all - no use for replication
//TODO: further refactor might move this into the division route -- and fix the service provider in client???
router.get('/getDivisionInfo', (req, res) => {
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
                    if (util.returnBoolByPath(foundDiv.toObject(), 'teams')) {
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
    });

router.post('/upsertDivision', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, (req, res) => {
    const path = '/admin/upsertDivision';
    let division = req.body.divObj;
    let name = req.body.divName;

    let runSubs = false;
    if (name == division.divisionConcat) {
        //division name not changed
    } else {
        //division name changed
        runSubs = true;
    }

    Division.findOne({ divisionConcat: name }).then((found) => {
        if (found) {
            //check one more time to ensure we dont need to run sub routines:
            if (found.displayName != division.displayName || found.divisionConcat != division.concat) {
                runSubs = true;
            }
            let keys = Object.keys(division);
            keys.forEach(key => {
                found[key] = division[key];
            });
            found.save().then(
                (saved) => {
                    res.status(200).send(util.returnMessaging(path, 'Division updated', false, saved));
                    if (runSubs) {
                        TeamSubs.upsertTeamsDivision(found.teams, {
                            "displayName": saved.displayName,
                            "divisionConcat": saved.divisionConcat
                        });
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error saving Division', err));
                }
            )

        } else {
            new Division(
                division
            ).save().then((newDivision) => {
                res.status(200).send(util.returnMessaging(path, 'Created new division', false, newDivision));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error creating new division', err));
            });
        }

    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division', err));
    })

});

router.post('/removeTeams', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, (req, res) => {
    const path = '/admin/removeTeams';
    let removeTeams = req.body.teams;
    let div = req.body.divName;
    let removed = [];

    Division.findOne({ divisionConcat: div }).then((found) => {
        if (found) {
            removeTeams.forEach(team => {
                let i = found.teams.indexOf(team);
                removed = removed.concat(found.teams.splice(i, 1));
            });
            found.save((saved) => {
                res.status(200).send(util.returnMessaging(path, 'Saved division', false, saved));
                TeamSubs.upsertTeamsDivision(removed, {});
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error saving division', err));
            })
        } else {
            res.status(200).send(util.returnMessaging(path, 'No division found', false, found));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding division', err));
    })
})

router.post('/createDivision', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, (req, res) => {
    const path = '/admin/createDivision';
    const recievedDivision = req.body.division;

    Division.findOne({ divisionConcat: recievedDivision.divisionConcat }).then(
        (found) => {
            if (found) {
                res.status(400).send(util.returnMessaging(path, 'Division All ready exists', false, found));
            } else {
                new Division(
                    recievedDivision
                ).save().then(
                    (saved) => {
                        res.status(200).send(util.returnMessaging(path, 'Division Created', false, saved));
                    },
                    (err) => {
                        res.status(500).send(util.returnMessaging(path, 'Division not created', err));
                    }
                )
            }
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error creating division', err));
        }
    )
});

router.post('/deleteDivision', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, (req, res) => {
    const path = '/admin/deleteDivision';
    const recievedDivision = req.body.division;

    Division.findOneAndDelete({ divisionConcat: recievedDivision }).then(
            (removed) => {
                if (removed) {
                    //touch each team that was in the division and remove the division from them
                    res.status(200).send(util.returnMessaging(path, 'Division was deleted.', false, removed));
                    TeamSubs.upsertTeamsDivision(removed.teams, {});

                } else {
                    res.status(400).send(util.returnMessaging(path, 'Division not found', false));
                }
            },
            (err) => {
                res.status(500).send(util.returnMessaging(path, 'Division delete failed', err));
            }
        )
        // Division.findOne({
        //     divisionConcat: recievedDivision.divisionConcat
        // }).then(
        //     (found) => {
        //         if (found) {
        //             res.status(400).send(util.returnMessaging(path, 'Division All ready exists', false, found));
        //         } else {
        //             new Division(
        //                 recievedDivision
        //             ).save().then(
        //                 (saved) => {
        //                     res.status(200).send(util.returnMessaging(path, 'Division Created', false, saved));
        //                 },
        //                 (err) => {
        //                     res.status(500).send(util.returnMessaging(path, 'Division not created', err));
        //                 }
        //             )
        //         }
        //     },
        //     (err) => {
        //         res.status(500).send(util.returnMessaging(path, 'Error creating division', err));
        //     }
        // )
});


module.exports = router;