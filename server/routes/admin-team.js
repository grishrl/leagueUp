const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Team = require("../models/team-models");
const Admin = require("../models/admin-models");
const teamSub = require('../subroutines/team-subs');
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

router.post('/reassignCaptain', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    const path = '/admin/reassignCaptain';

    let team = req.body.teamName;
    let newCpt = req.body.userName;

    Team.findOne({ teamName_lower: team }).then((foundTeam) => {
        if (foundTeam) {
            let members = util.returnByPath(foundTeam.toObject(), 'teamMembers');
            console.log('members ', members);
            let cont = false;
            if (members) {
                members.forEach(element => {
                    if (element.displayName == newCpt) {
                        cont = true;
                    }
                })
            }
            console.log('cont after ', cont);
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
                                foundUser.teamInfo = {
                                    "teamName": teamName,
                                    "teamId": foundTeam._id
                                }
                            } else {
                                //remove the member from the pending members
                                foundTeam.pendingMembers.splice(index, 1);
                                //make sure that the member's teaminfo is cleared.
                                if (foundUser.teamInfo) {
                                    foundUser.teamInfo = {};
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
            UserSub.clearUsersTeam(deleted.teamMembers);
            res.status(200).send(util.returnMessaging(path, 'Team deleted', false, deleted));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error deleting team', err));
    })
});

module.exports = router;