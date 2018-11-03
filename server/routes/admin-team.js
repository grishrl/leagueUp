const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Team = require("../models/team-models");
const Admin = require("../models/admin-models");
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");

router.post('/approveMemberAdd', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, (req, res) => {
    var teamName = req.body.teamName;
    var member = req.body.member;
    Team.findOne({
        teamName: teamName
    }).then((foundTeam) => {
        if (foundTeam) {
            User.findOne({
                displayName: member
            }).then((foundUser) => {
                if (foundUser) {
                    var foundTeamObject = foundTeam.toObject();
                    if (foundTeamObject.hasOwnProperty('pendingMembers') && foundTeamObject.pendingMembers.length > 0) {
                        var index = null;
                        for (var i = 0; i < foundTeamObject.pendingMembers.length; i++) {
                            if (foundTeamObject.pendingMembers[i].displayName == member) {
                                index = i;
                            }
                        }
                        if (index != null && index != undefined && index > -1) {

                            foundTeam.teamMembers.push(foundTeamObject.pendingMembers[index]);
                            foundTeam.pendingMembers.splice(index, 1);
                            foundUser.teamInfo = {
                                "teamName": teamName,
                                "teamId": foundTeam._id
                            }
                            foundTeam.save().then((savedTeam) => {
                                foundUser.save().then((savedUser) => {
                                    res.status(200).send({
                                        "message": "Team and User updated!",
                                        "team": savedTeam,
                                        "user": savedUser
                                    });
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

module.exports = router;