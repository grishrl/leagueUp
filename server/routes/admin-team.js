const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Team = require("../models/team-models");
const Admin = require("../models/admin-models");
const teamSub = require('../subroutines/team-subs');
const DivSub = require('../subroutines/division-subs');
const OutreachSub = require('../subroutines/outreach-subs');
const QueueSub = require('../subroutines/queue-subs');
const UserSub = require('../subroutines/user-subs');
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");


router.get('/pendingMemberQueue', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/pendingMemberQueue';
    const query = Admin.PendingQueue.find();
    query.sort('-timestamp');
    query.limit(20);
    query.exec().then((reply) => {
        res.status(200).send(util.returnMessaging(path, 'Found queues', false, reply));
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Couldn\'t get the queues', err));
    })
});

router.post('/team/removeMember', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/team/removeMember';
    let teamName = req.body.teamName;
    let payloadUser = req.body.removeUser;
    Team.findOne({ teamName_lower: teamName }).then(
        (foundTeam) => {
            if (foundTeam) {
                let indiciesToRemove = [];
                let usersRemoved = [];
                if (Array.isArray(payloadUser)) {
                    for (var i = 0; i < foundTeam.teamMembers.length; i++) {
                        if (payloadUser.indexOf(foundTeam.teamMembers[i].displayName) > -1) {
                            indiciesToRemove.push(i);
                        }
                    }
                } else {
                    for (var i = 0; i < foundTeam.teamMembers.length; i++) {
                        if (payloadUser == foundTeam.teamMembers[i].displayName) {
                            indiciesToRemove.push(i);
                        }
                    }
                }
                if (indiciesToRemove.length == 0) {
                    res.status(400).send(
                        util.returnMessaging(path, "User not found on team.", false, foundTeam)
                    );
                } else {
                    indiciesToRemove.forEach(function(index) {
                        usersRemoved = usersRemoved.concat(foundTeam.teamMembers.splice(index, 1));
                    });
                    UserSub.clearUsersTeam(usersRemoved);
                    foundTeam.save().then((savedTeam) => {
                        if (savedTeam) {
                            teamSub.updateTeamMmr(foundTeam);
                            res.status(200).send(
                                util.returnMessaging(path, "users removed from team", false, savedTeam)
                            );
                        } else {
                            res.status(400).send(
                                util.returnMessaging(path, "users not removed from team", false, savedTeam));
                        }
                    }, (err) => {
                        res.status(400).send(util.returnMessaging(path, "Unable to save team", err));
                    });
                }
            } else {
                res.status(400).send(util.returnMessaging(path, 'Team not found!'));
            }
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding team!', err));
        }
    )
});

router.post('/reassignCaptain', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/reassignCaptain';

    let team = req.body.teamName;
    let newCpt = req.body.userName;

    Team.findOne({ teamName_lower: team }).then((foundTeam) => {
        if (foundTeam) {
            let members = util.returnByPath(foundTeam.toObject(), 'teamMembers');
            let cont = false;
            if (members) {
                members.forEach(element => {
                    if (element.displayName == newCpt) {
                        cont = true;
                    }
                })
            }
            if (cont) {
                let oldCpt = foundTeam.captain;
                foundTeam.captain = newCpt;
                foundTeam.save().then((savedTeam) => {
                    if (savedTeam) {
                        UserSub.toggleCaptain(oldCpt);
                        UserSub.toggleCaptain(savedTeam.captain);
                        res.status(200).send(util.returnMessaging(path, 'Team captain changed', false, savedTeam));
                    } else {
                        res.status(500).send(util.returnMessaging(path, 'Error saving team captain changes'));
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error changing the team captian', err));
                })
            } else {
                res.status(400).send(util.returnMessaging(path, 'User was not found in team members'));
            }
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding team!', err));
    })
});

router.post('/approveMemberAdd', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    var teamName = req.body.teamName;
    var member = req.body.member;
    var approved = req.body.approved;
    teamName = teamName.toLowerCase();

    //find team matching the team in question
    Team.findOne({
        teamName_lower: teamName
    }).then((foundTeam) => {
        //we found the team
        if (foundTeam) {
            //grab the user associated with this
            User.findOne({
                displayName: member
            }).then((foundUser) => {
                //we found the user
                if (foundUser) {
                    var foundTeamObject = foundTeam.toObject();
                    //double check that the user is in the pending members
                    if (foundTeamObject.hasOwnProperty('pendingMembers') && foundTeamObject.pendingMembers.length > 0) {

                        var index = null;
                        for (var i = 0; i < foundTeamObject.pendingMembers.length; i++) {
                            if (foundTeamObject.pendingMembers[i].displayName == member) {
                                index = i;
                            }
                        }
                        //if we find the user in the pending members
                        if (index != null && index != undefined && index > -1) {
                            //we need to do some different things here for approved accounts and denied.
                            if (approved) {
                                //push the member into the team's actual members then splice them out of the pending members
                                foundTeam.teamMembers.push(foundTeamObject.pendingMembers[index]);
                                foundTeam.pendingMembers.splice(index, 1);
                                //update the user with the team info
                                foundUser.teamName = teamName;
                                foundUser.teamId = foundTeam._id
                                foundUser.pendingTeam = false;
                            } else {
                                //remove the member from the pending members
                                foundTeam.pendingMembers.splice(index, 1);
                                //make sure that the member's teaminfo is cleared.
                                if (foundUser.teamName || foundUser.teamId) {
                                    foundUser.teamName = null;
                                    foundUser.teamId = null;
                                    foundUser.pendingTeam = false;
                                }
                            }
                            //save the team and the user
                            foundTeam.save().then((savedTeam) => {
                                    foundUser.save().then((savedUser) => {
                                        res.status(200).send({
                                            "message": "Team and User updated!",
                                            "team": savedTeam,
                                            "user": savedUser
                                        });
                                        teamSub.updateTeamMmr(savedTeam);
                                    }, (userSaveErr) => {
                                        res.status(500).send({
                                            "message": "Error saving user",
                                            "err": userSaveErr
                                        });
                                    })
                                }, (teamSaveErr) => {
                                    res.status(500).send({
                                        "message": "Error saving team",
                                        "err": teamSaveErr
                                    });
                                })
                                //this should fire whether the user was approved or denied, clean this item from the queue
                            QueueSub.removePendingByTeamAndUser(foundTeam.teamName_lower, foundUser.displayName);
                        } else {
                            res.status(500).send({
                                "message": "User \'" + member + "\' was not found in pending members of team \'" + teamName + "\'"
                            })
                        }
                    } else {
                        res.status(500).send({
                            "message": "The team " + teamName + " had no pending members!"
                        })
                    }
                } else {
                    res.status(500).send({
                        "message": "This user was not found" + member + ""
                    })
                }
            }, (err) => {
                res.status(500).send({
                    "message": "Error finding user",
                    "err": err
                });
            })
        } else {
            res.status(500).send({
                "message": "This team was not found" + teamName + ""
            })
        }
    }, (err) => {
        res.status(500).send({
            "message": "Error finding team",
            "err": err
        });
    })
});

router.post('/delete/team', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/delete/team';
    var team = req.body.teamName;
    team = team.toLowerCase();
    Team.findOneAndDelete({ teamName_lower: team }).then((deleted) => {
        if (deleted) {
            //TODO : need to remove this team from division if it was in one!!!!
            UserSub.clearUsersTeam(deleted.teamMembers);
            res.status(200).send(util.returnMessaging(path, 'Team deleted', false, deleted));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error deleting team', err));
    })
});

router.post('/teamSave', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/teamSave';
    //this teamName passed in the body is considered a safe source of the orignal team name
    let team = req.body.teamName;
    let payload = req.body.teamObj;
    team = team.toLowerCase();
    //check if the team was renamed at the client
    if (team != payload.teamName_lower) {
        //team was renamed
        //double check the new name doesn't exist all ready
        Team.findOne({ teamName_lower: payload.teamName_lower }).then((foundTeam) => {
                if (foundTeam) {
                    res.status(400).send(util.returnMessaging(path, 'This team name was all ready taken, can not complete request!'));
                } else {
                    //this might be a candidate for refactoring all the team saves into one single sub component - but not until I have a warm fuzzy about including teamName changes into the base sub, which I dont.
                    //team name was not modified; edit the properties we received.
                    Team.findOne({
                        teamName_lower: team
                    }).then((originalTeam) => {
                        if (originalTeam) {

                            //update the team name and teamname lower
                            originalTeam.teamName = payload.teamName;
                            originalTeam.teamName_lower = payload.teamName.toLowerCase();

                            // check the paylaod and update the found team if the originalTeam property if it existed on the payload
                            if (util.returnBoolByPath(payload, 'lookingForMore')) {
                                originalTeam.lookingForMore = payload.lookingForMore;
                            }

                            if (util.returnBoolByPath(payload, 'availability')) {
                                originalTeam.availability = {};
                                originalTeam.availability = payload.availability;
                            }

                            if (util.returnBoolByPath(payload, 'competitiveLevel')) {
                                originalTeam.competitiveLevel = payload.competitiveLevel;
                            }

                            if (util.returnBoolByPath(payload, 'descriptionOfTeam')) {
                                originalTeam.descriptionOfTeam = payload.descriptionOfTeam;
                            }

                            if (util.returnBoolByPath(payload, 'rolesNeeded')) {
                                originalTeam.rolesNeeded = {};
                                originalTeam.rolesNeeded = payload.rolesNeeded;
                            }

                            if (util.returnBoolByPath(payload, 'timeZone')) {
                                originalTeam.timeZone = payload.timeZone;
                            }

                            originalTeam.save().then((savedTeam) => {
                                var message = "";
                                message += "Team updated!";
                                res.status(200).send(util.returnMessaging(path, message, false, savedTeam));

                                //now we need subs to remove all instances of the old team name and replace it with
                                //this new team name
                                DivSub.updateTeamNameDivision(team, savedTeam.teamName);
                                OutreachSub.updateOutreachTeamname(team, savedTeam.teamName);
                                QueueSub.updatePendingMembersTeamNameChange(team, savedTeam.teamName_lower);
                                //matches ... not existing yet
                                UserSub.upsertUsersTeamName(savedTeam.teamMembers, savedTeam.teamName);
                            }, (err) => {
                                res.status(400).send(util.returnMessaging(path, 'Error saving team information', err));
                            });
                        } else {
                            res.status(400).send(util.returnMessaging(path, "Team not found"));
                        }
                    }, (err) => {
                        res.status(400).send(util.returnMessaging(path, 'Error finding team', err));
                    })
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error querying teams!', err));
            })
            //delete old team???
            //save a new instance of the renamed team
    } else {
        //team name was not modified; edit the properties we received.
        Team.findOne({
            teamName_lower: team
        }).then((foundTeam) => {
            if (foundTeam) {

                // check the paylaod and update the found team if the foundTeam property if it existed on the payload
                if (util.returnBoolByPath(payload, 'lookingForMore')) {
                    foundTeam.lookingForMore = payload.lookingForMore;
                }

                if (util.returnBoolByPath(payload, 'availability')) {

                    foundTeam.availability = {};

                    foundTeam.availability = payload.availability;
                }

                if (util.returnBoolByPath(payload, 'competitiveLevel')) {
                    foundTeam.competitiveLevel = payload.competitiveLevel;
                }

                if (util.returnBoolByPath(payload, 'descriptionOfTeam')) {
                    foundTeam.descriptionOfTeam = payload.descriptionOfTeam;
                }

                if (util.returnBoolByPath(payload, 'rolesNeeded')) {
                    foundTeam.rolesNeeded = {};
                    foundTeam.rolesNeeded = payload.rolesNeeded;
                }

                if (util.returnBoolByPath(payload, 'timeZone')) {
                    foundTeam.timeZone = payload.timeZone;
                }

                foundTeam.save().then((savedTeam) => {
                    var message = "";
                    message += "Team updated!";
                    res.status(200).send(util.returnMessaging(path, message, false, savedTeam));
                }, (err) => {
                    res.status(400).send(util.returnMessaging(path, 'Error saving team information', err));
                });
            } else {
                res.status(400).send(util.returnMessaging(path, "Team not found"));
            }
        }, (err) => {
            res.status(400).send(util.returnMessaging(path, 'Error finding team', err));
        })

    }
});

router.post('/resultantmmr', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/resultantmmr'
    let userMmr = req.body.userMmr;
    let teamName = req.body.teamName;

    Team.findOne({
        teamName_lower: teamName.toLowerCase()
    }).then((foundTeam) => {
        if (foundTeam) {
            let members = [];
            foundTeam.teamMembers.forEach(element => {
                members.push(element.displayName);
            });
            teamSub.resultantMMR(userMmr, members).then((processed) => {
                if (processed) {
                    res.status(200).send(util.returnMessaging(path, "Team mmr calculated.", false, { resultantMmr: processed }));
                } else {
                    res.status(400).send(util.returnMessaging(path, "Team mmr not calculated."));
                }
            }, (err) => {
                res.status(400).send(util.returnMessaging(path, "Team mmr not calculated.", err));
            })
        } else {
            res.status(400).send(util.returnMessaging(path, "Team not found"));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding team', err));
    })

});

router.post('/team/refreshMmr', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = 'admin/team/refreshMmr';
    let teamName = req.body.teamName;
    teamName = teamName.toLowerCase();
    Team.findOne({ teamName_lower: teamName }).then(
        (foundTeam) => {
            let members = [];
            foundTeam.teamMembers.forEach(member => {
                members.push(member.displayName);
            })
            teamSub.returnTeamMMR(members).then(
                (processed) => {
                    if (processed) {
                        foundTeam.teamMMRAvg = processed;
                        foundTeam.save().then(
                            (saved) => {
                                res.status(200).send(util.returnMessaging(path, 'Recalculated Team', false, {
                                    newMMR: processed
                                }));
                            },
                            (err) => {
                                res.status(500).send(util.returnMessaging(path, 'Error saving team', err));
                            }
                        )

                    } else {
                        res.status(500).send(util.returnMessaging(path, 'Error processing mmr team'));
                    }
                },
                (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error finding team', err));
                }
            )
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding team', err));
        }
    )
})


module.exports = router;