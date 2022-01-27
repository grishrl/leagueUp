const router = require('express').Router();
const Division = require("../models/division-models");
const TeamSubs = require('../subroutines/team-subs');
const Team = require("../models/team-models");
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const _ = require('lodash');
const utils = require('../utils');
const { commonResponseHandler } = require('./../commonResponseHandler');

//this api retrieves all teams that do not have a division assigned, and have 
//successuflly registered for the season
router.get('/getTeamsUndivisioned', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/getTeamsUndivisioned';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return Team.find({
            $and: [{
                $or: [
                        {
                        divisionConcat: null
                        }, {
                        divisionConcat: ""
                        }, {
                        divisionConcat: {
                            $exists: false
                        }
                        }, {
                        "divisionDisplayName": null
                        }, {
                        "divisionDisplayName": {
                            $exists: false
                        }
                        },
                        {
                            "divisionDisplayName": ""
                        }
                    ]
                }, {
                    "questionnaire.registered": true
                }]}).then((results) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found teams', false, results)
            return response;
        }, (err) => {
            response.status = 500;
            response.messeage = utils.returnMessaging(req.originalUrl, 'Error querying teams', err)
            return response;
        })
    });
});


//this api pulls back all divisions
// passport.authenticate('jwt', {
// session: false
// }),

//NOTICE this route is not secured because it is used for pulling back division lists et all - no use for replication
router.get('/getDivisionInfo', (req, res) => {
    const path = '/admin/getDivisionInfo'

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return Division.find({}).then((found) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Returning division info.', false, found);
            return response;
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error getting the division info.', err);
            return response;
        });
    })

    try {

    } catch (e) {
        utils.errLogger(path, e);
        res.status(500).send(utils.returnMessaging(path, 'Internal Server Error', e));
    }
});

//this api places a provided team in to a division according to provided name
router.post('/divisionTeams',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.divisionLevel, utils.appendResHeader, (req, res) => {
        const path = '/admin/divisionTeams';
        let div = req.body.divisionName;
        let recTeam = req.body.teamInfo;
        let teams = [];

        try {

            recTeam = utils.validateInputs.array(recTeam);
            div = utils.validateInputs.string(div);

            if (recTeam.valid && div.valid) {
                //log object
                let logObj = {};
                logObj.actor = req.user.displayName;
                logObj.action = 'add team to division ';
                logObj.target = div.value + ' : ' + teams.toString();
                logObj.logLevel = 'ADMIN';


                recTeam.value.forEach(element => {
                    teams.push(element.teamName);
                });
                Division.findOne({
                    divisionConcat: div.value
                }).then((foundDiv) => {
                    if (foundDiv) {
                        //make sure we don't double up teams in here
                        if (foundDiv.teams) {
                            teams.forEach(team => {
                                if (foundDiv.teams.indexOf(team) == -1) {
                                    foundDiv.teams.push(team);
                                }
                            });
                        } else {
                            foundDiv.teams = teams;
                        }
                        foundDiv.markModified('teams');
                        foundDiv.save().then((saved) => {
                            runTeamSub = true;
                            res.status(200).send(utils.returnMessaging(path, 'Saved division', false, saved, null, logObj));
                            TeamSubs.upsertTeamsDivision(teams, {
                                displayName: saved.displayName,
                                divisionConcat: saved.divisionConcat
                            });
                        }, (err) => {
                            res.status(500).send(utils.returnMessaging(path, 'Error saving divsion', err, null, null, logObj));
                        })
                    }
                }, (err) => {
                    res.status(500).send(utils.returnMessaging(path, 'Error finding division', err, null, null, logObj))
                })
            } else {
                let message = 'Error: ';
                if (!recTeam.valid) {
                    message += 'teamInfo (array) parameter required';
                }
                if (!div.valid) {
                    message += 'divisionName (string) parameter required';
                }
                res.status(500).send(utils.returnMessaging(path, message));
            }

        } catch (e) {
            utils.errLogger(path, e);
            res.status(500).send(utils.returnMessaging(path, 'Internal Server Error', e));
        }

    });

router.post('/upsertDivision', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/upsertDivision';

    try {

        let division = req.body.divObj;
        let name = req.body.divName;

        name = utils.validateInputs.string(name);
        division = utils.validateInputs.object(division);

        if (name.valid && division.valid) {
            let runSubs = false;
            if (name.value != division.value.divisionConcat) {
                runSubs = true;
            }

            //log object
            let logObj = {};
            logObj.actor = req.user.displayName;
            logObj.action = 'create or edit division ';
            logObj.target = division.value;
            logObj.logLevel = 'ADMIN';

            Division.findOne({
                divisionConcat: name.value
            }).then((found) => {
                if (found) {
                    let divisionPriorState = found.toObject();
                    //check one more time to ensure we dont need to run sub routines:
                    if (found.displayName != division.value.displayName || found.divisionConcat != division.value.concat) {
                        runSubs = true;
                    }
                    _.forEach(division.value, (value, key) => {
                        found[key] = value;
                    });

                    found.save().then(
                        (saved) => {
                            if (saved.public && divisionPriorState.public != saved.public) {
                                TeamSubs.updateTeamDivHistory(saved.teams, saved.displayName);
                            }
                            res.status(200).send(utils.returnMessaging(path, 'Division updated', false, saved, null, logObj));
                            if (runSubs) {
                                TeamSubs.upsertTeamsDivision(found.teams, {
                                    "displayName": saved.displayName,
                                    "divisionConcat": saved.divisionConcat
                                });
                            }
                        }, (err) => {
                            res.status(500).send(utils.returnMessaging(path, 'Error saving Division', err, null, null, logObj));
                        }
                    )

                } else {
                    new Division(
                        division.value
                    ).save().then((newDivision) => {
                        res.status(200).send(utils.returnMessaging(path, 'Created new division', false, newDivision, null, logObj));
                    }, (err) => {
                        res.status(500).send(utils.returnMessaging(path, 'Error creating new division', err, null, null, logObj));
                    });
                }

            }, (err) => {
                res.status(500).send(utils.returnMessaging(path, 'Error finding division', err, null, null, logObj));
            })
        } else {
            let message = 'Error: ';
            if (!name.valid) {
                message += 'name (string) parameter required ';
            }
            if (!division.valid) {
                message += 'divisionName (object) parameter required ';
            }
            res.status(500).send(utils.returnMessaging(path, message));
        }

    } catch (e) {
        utils.errLogger(path, e);
        res.status(500).send(utils.returnMessaging(path, 'Internal Server Error', e));
    }

});

router.post('/removeTeams', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/removeTeams';

    let removeTeams = req.body.teams;
    let div = req.body.divName;

    let removed = [];

    try {

        removeTeams = utils.validateInputs.array(removeTeams);
        div = utils.validateInputs.string(div);

        if (removeTeams.valid && div.valid) {
            //log object
            let logObj = {};
            logObj.actor = req.user.displayName;
            logObj.action = 'remove team from division ';
            logObj.target = div.value + ' : ' + removeTeams.value.toString();
            logObj.logLevel = 'ADMIN';

            Division.findOne({
                divisionConcat: div.value
            }).then((found) => {
                if (found) {
                    removeTeams.value.forEach(team => {
                        let i = found.teams.indexOf(team);
                        removed = removed.concat(found.teams.splice(i, 1));
                    });
                    found.save((saved) => {
                        res.status(200).send(utils.returnMessaging(path, 'Saved division', false, saved, null, logObj));
                        TeamSubs.upsertTeamsDivision(removed, {});
                    }, (err) => {
                        res.status(500).send(utils.returnMessaging(path, 'Error saving division', err, null, null, logObj));
                    })
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Division was not found';
                    res.status(200).send(utils.returnMessaging(path, 'No division found', false, found, null, logObj));
                }
            }, (err) => {
                res.status(500).send(utils.returnMessaging(path, 'Error finding division', err, null, null, logObj));
            })
        } else {
            let message = 'Error: ';
            if (!removeTeams.valid) {
                message += 'removeTeams (array) parameter required ';
            }
            if (!div.valid) {
                message += 'div (string) parameter required ';
            }
            res.status(500).send(utils.returnMessaging(path, message));
        }


    } catch (e) {
        utils.errLogger(path, e);
        res.status(500).send(utils.returnMessaging(path, 'Internal Server Error', e));
    }


})

router.post('/createDivision', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/createDivision';

    let recievedDivision = req.body.division;

    try {
        recievedDivision = utils.validateInputs.object(recievedDivision);

        if (recievedDivision.valid) {
            //log object
            let logObj = {};
            logObj.actor = req.user.displayName;
            logObj.action = 'create division ';
            logObj.target = recievedDivision.value.divisionConcat;
            logObj.logLevel = 'ADMIN';

            Division.findOne({
                divisionConcat: recievedDivision.value.divisionConcat
            }).then(
                (found) => {
                    if (found) {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Division all ready exists';
                        res.status(400).send(utils.returnMessaging(path, 'Division All ready exists', false, found, null, logObj));
                    } else {
                        new Division(
                            recievedDivision.value
                        ).save().then(
                            (saved) => {
                                res.status(200).send(utils.returnMessaging(path, 'Division Created', false, saved, null, logObj));
                            },
                            (err) => {
                                res.status(500).send(utils.returnMessaging(path, 'Division not created', err, null, null, logObj));
                            }
                        )
                    }
                },
                (err) => {
                    res.status(500).send(utils.returnMessaging(path, 'Error creating division', err, null, null, logObj));
                }
            )
        } else {
            let message = 'Error: ';
            if (!recievedDivision.valid) {
                message += 'recievedDivision (object) parameter required ';
            }
            res.status(500).send(utils.returnMessaging(path, message));
        }
    } catch (e) {
        utils.errLogger(path, e);
        res.status(500).send(utils.returnMessaging(path, 'Internal Server Error', e));
    }



});

router.post('/deleteDivision', passport.authenticate('jwt', {
    session: false
}), levelRestrict.divisionLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/deleteDivision';
    let recievedDivision = req.body.division;

    try {

        recievedDivision = utils.validateInputs.string(recievedDivision);

        if (recievedDivision.valid) {
            //log object
            let logObj = {};
            logObj.actor = req.user.displayName;
            logObj.action = 'delete division ';
            logObj.target = recievedDivision.value;
            logObj.logLevel = 'ADMIN';

            Division.findOneAndDelete({
                divisionConcat: recievedDivision.value
            }).then(
                (removed) => {
                    if (removed) {
                        //touch each team that was in the division and remove the division from them
                        res.status(200).send(utils.returnMessaging(path, 'Division was deleted', false, removed, null, logObj));
                        TeamSubs.upsertTeamsDivision(removed.teams, {});

                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Division not found'
                        res.status(400).send(utils.returnMessaging(path, 'Division not found', false, null, null, logObj));
                    }
                },
                (err) => {
                    res.status(500).send(utils.returnMessaging(path, 'Division delete failed', err, null, null, logObj));
                }
            )
        } else {
            let message = 'Error: ';
            if (!recievedDivision.valid) {
                message += 'recievedDivision (string) parameter required ';
            }
            res.status(500).send(utils.returnMessaging(path, message));
        }

    } catch (e) {
        utils.errLogger(path, e);
        res.status(500).send(utils.returnMessaging(path, 'Internal Server Error', e));
    }


});


module.exports = router;