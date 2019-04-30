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
const messageSub = require('../subroutines/message-subs');
const uploadTeamLogo = require('../methods/teamLogoUpload').uploadTeamLogo;
const deleteFile = require('../methods/teamLogoUpload').deleteFile;

//returns the lists of users who are awaiting admin attention to complete the team join process
router.get('/pendingMemberQueue', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
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

//removes the supplied member from the supplied team
router.post('/team/removeMember', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/team/removeMember';
    let teamName = req.body.teamName;
    let payloadUser = req.body.removeUser;
    teamName = teamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'remove user from team ';
    logObj.target = teamName + ' : ' + payloadUser;
    logObj.logLevel = 'ADMIN';

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
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'User not found on team.';
                    res.status(400).send(util.returnMessaging(path, "User not found on team.", false, foundTeam, null, logObj));
                } else {
                    indiciesToRemove.forEach(function(index) {
                        usersRemoved = usersRemoved.concat(foundTeam.teamMembers.splice(index, 1));
                    });
                    UserSub.clearUsersTeam(usersRemoved);
                    foundTeam.save().then((savedTeam) => {
                        if (savedTeam) {
                            teamSub.updateTeamMmr(foundTeam);
                            res.status(200).send(util.returnMessaging(path, "Users removed from team", false, savedTeam, logObj));
                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'Users were not removed from team';
                            res.status(400).send(util.returnMessaging(path, "Users not removed from team", false, savedTeam, logObj));
                        }
                    }, (err) => {
                        res.status(400).send(util.returnMessaging(path, "Unable to save team", err, null, null, logObj));
                    });
                }
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Team not found';
                res.status(400).send(util.returnMessaging(path, 'Team not found!', false, null, null, logObj));
            }
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding team!', err, null, null, logObj));
        }
    )
});


//reassigns captain from the supplied team to the supplied teammember
router.post('/reassignCaptain', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/reassignCaptain';

    let team = req.body.teamName;
    let newCpt = req.body.userName;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'reassign team captain ';
    logObj.target = team + ' : ' + newCpt;
    logObj.logLevel = 'ADMIN';

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
                        res.status(200).send(util.returnMessaging(path, 'Team captain changed', false, savedTeam, null, logObj));
                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Error saving team';
                        res.status(500).send(util.returnMessaging(path, 'Error saving team captain changes', null, null, null, logObj));
                    }
                }, (err) => {
                    res.status(500).send(util.returnMessaging(path, 'Error changing the team captian', err, null, null, logObj));
                })
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'User was not found in team members';
                res.status(400).send(util.returnMessaging(path, 'User was not found in team members', null, null, null, logObj));
            }
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding team!', err, null, null, logObj));
    })
});


//approves a pending team member queue, removes the item from the queue and adds the member to the team
//updates the members profile to now be part of the team
router.post('/approveMemberAdd', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/approveMemberAdd';
    var teamName = req.body.teamName;
    var member = req.body.member;
    var approved = req.body.approved;
    teamName = teamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'pending team member approval';
    logObj.target = teamName + ' : ' + member + ' - ' + approved;
    logObj.logLevel = 'ADMIN';

    let msg = {};
    msg.sender = req.user._id;
    msg.subject = 'Team Join Approval';
    msg.timeStamp = new Date().getTime()
    if (approved) {
        msg.content = 'Your team join has been approved!';
    } else {
        msg.content = 'Your team join has been denied!';
    }

    msg.notSeen = true;

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
                    msg.recipient = foundUser._id.toString();
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
                                if (foundTeam.history) {
                                    foundTeam.history.push({
                                        timestamp: Date.now(),
                                        action: 'Joined team',
                                        target: foundUser.displayName
                                    });
                                } else {
                                    foundTeam.history = [{
                                        timestamp: Date.now(),
                                        action: 'Joined team',
                                        target: foundUser.displayName
                                    }];
                                }
                                //update the user with the team info
                                foundUser.teamName = foundTeam.teamName;
                                foundUser.teamId = foundTeam._id
                                foundUser.pendingTeam = false;
                                foundUser.lookingForGroup = false;
                                if (foundUser.history) {
                                    foundUser.history.push({
                                        timestamp: Date.now(),
                                        action: 'Joined team',
                                        target: foundTeam.teamName
                                    });
                                } else {
                                    foundUser.history = [{
                                        timestamp: Date.now(),
                                        action: 'Joined team',
                                        target: foundTeam.teamName
                                    }];
                                }
                            } else {
                                //remove the member from the pending members
                                foundTeam.pendingMembers.splice(index, 1);
                                //make sure that the member's teaminfo is cleared.
                                if (foundUser.teamName || foundUser.teamId) {
                                    foundUser.teamName = null;
                                    foundUser.teamId = null;
                                }
                                foundUser.pendingTeam = false;
                            }
                            //save the team and the user
                            foundTeam.save().then((savedTeam) => {
                                foundUser.save().then((savedUser) => {
                                    res.status(200).send(util.returnMessaging(path, 'Team and User updated!', false, savedTeam, savedUser, logObj));
                                    teamSub.updateTeamMmr(savedTeam);
                                }, (userSaveErr) => {
                                    res.status(500).send(util.returnMessaging(path, "Error saving user", userSaveErr, null, null, logObj));
                                })
                            }, (teamSaveErr) => {
                                res.status(500).send(util.returnMessaging(path, 'Error saving team', teamSaveErr, null, null, logObj));
                            });
                            //this should fire whether the user was approved or denied, clean this item from the queue
                            QueueSub.removePendingByTeamAndUser(foundTeam.teamName_lower, foundUser.displayName);
                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'User was not found in pending members of team';
                            res.status(500).send(util.returnMessaging(path, "User \'" + member + "\' was not found in pending members of team \'" + teamName + "\'", false, null, null, logObj));
                        }
                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'team had no pending members';
                        res.status(500).send(util.returnMessaging(path, "The team " + teamName + " had no pending members!", null, null, null, logObj));
                    }
                    messageSub(msg);
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'This user was not found';
                    res.status(500).send(util.returnMessaging(path, "This user was not found", false, null, null, logObj));
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error finding user', err, null, null, logObj));
            });
        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'This team was not found';
            res.status(500).send(util.returnMessaging(path, 'Team not found', null, null, null, logObj))
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding team', err, null, null, logObj));
    })

});


//deletes the supplied team,
//removes all team information from users profiles
router.post('/delete/team', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/delete/team';
    var team = req.body.teamName;
    team = team.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'team deletion';
    logObj.target = team;
    logObj.logLevel = 'ADMIN';

    Team.findOneAndDelete({ teamName_lower: team }).then((deleted) => {
        if (deleted) {
            UserSub.clearUsersTeam(deleted.teamMembers);
            teamSub.updateTeamMatches(deleted.toObject());
            DivSub.updateTeamNameDivision(deleted.teamName, deleted.teamName + ' (withdrawn)');
            res.status(200).send(util.returnMessaging(path, 'Team deleted', false, deleted, null, logObj));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error deleting team', err, null, null, logObj));
    })
});

//Saves a supplied team
router.post('/teamSave', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/teamSave';
    //this teamName passed in the body is considered a safe source of the orignal team name
    let team = req.body.teamName;
    let payload = req.body.teamObj;
    let teamLower = team.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'team edit';
    logObj.target = team;
    logObj.logLevel = 'ADMIN';

    //check if the team was renamed at the client
    if (teamLower != payload.teamName_lower) {
        //team was renamed
        //double check the new name doesn't exist all ready
        Team.findOne({ teamName_lower: payload.teamName_lower }).then((foundTeam) => {
                if (foundTeam) {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'team name was taken';
                    res.status(400).send(util.returnMessaging(path, 'This team name was all ready taken, can not complete request!', false, null, null, logObj));
                } else {
                    //this might be a candidate for refactoring all the team saves into one single sub component - but not until I have a warm fuzzy about including teamName changes into the base sub, which I dont.
                    //team name was not modified; edit the properties we received.
                    Team.findOne({
                        teamName_lower: teamLower
                    }).then((originalTeam) => {
                        if (originalTeam) {
                            let originalTeamName = originalTeam.teamName

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
                                message += "Team updated";
                                res.status(200).send(util.returnMessaging(path, message, false, savedTeam, null, logObj));

                                //now we need subs to remove all instances of the old team name and replace it with
                                //this new team name
                                DivSub.updateTeamNameDivision(originalTeamName, savedTeam.teamName);
                                OutreachSub.updateOutreachTeamname(originalTeamName, savedTeam.teamName);
                                QueueSub.updatePendingMembersTeamNameChange(originalTeamName, savedTeam.teamName_lower);
                                //matches ... not existing yet
                                UserSub.upsertUsersTeamName(savedTeam.teamMembers, savedTeam.teamName, savedTeam._id.toString());
                            }, (err) => {
                                res.status(400).send(util.returnMessaging(path, 'Error saving team information', err, null, null, logObj));
                            });
                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'Team not found';
                            res.status(400).send(util.returnMessaging(path, "Team not found", null, null, null, logObj));
                        }
                    }, (err) => {
                        res.status(400).send(util.returnMessaging(path, 'Error finding team', err, null, null, logObj));
                    })
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error querying teams!', err, null, null, logObj));
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
                    res.status(200).send(util.returnMessaging(path, message, false, savedTeam, null, logObj));
                }, (err) => {
                    res.status(400).send(util.returnMessaging(path, 'Error saving team information', err, null, null, logObj));
                });
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Team not found';
                res.status(400).send(util.returnMessaging(path, "Team not found", null, null, null, logObj));
            }
        }, (err) => {
            res.status(400).send(util.returnMessaging(path, 'Error finding team', err, null, null, logObj));
        })

    }
});


//calculates the resultant MMR from a pending member add for suplied memebers MMR and supplied team
router.post('/resultantmmr', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
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
                    res.status(200).send(util.returnMessaging(path, "Team MMR calculated.", false, { resultantMmr: processed }));
                } else {
                    res.status(400).send(util.returnMessaging(path, "Team MMR not calculated."));
                }
            }, (err) => {
                res.status(400).send(util.returnMessaging(path, "Team MMR not calculated.", err));
            })
        } else {
            res.status(400).send(util.returnMessaging(path, "Team not found"));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'Error finding team', err));
    })

});


//refreshes the MMR of a supplied team, in case the team mmr may need to be updated
router.post('/team/refreshMmr', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
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
});


//returns a list of all teams!
router.get('/get/teams/all', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = 'admin/get/teams/all';
    Team.find().then(
        (foundTeams) => {
            if (foundTeams) {
                res.status(200).send(util.returnMessaging(path, 'Found teams', false, foundTeams));
            } else {
                res.status(200).send(util.returnMessaging(path, 'No teams found', false));
            }
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding teams', err));
        }
    )

});

router.post('/team/memberAdd',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
        const path = 'admin/team/memberAdd';
        let user = req.body.user;
        let team = req.body.teamName;

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' manual add user to team ';
        logObj.target = team + ' : ' + user;
        logObj.logLevel = 'ADMIN';

        Team.findOne({ teamName_lower: team.toLowerCase() }).then(
            found => {
                if (found) {
                    let index = -1;
                    found.teamMembers.forEach(
                        (member, i) => {
                            if (member.displayName == user) {
                                index = i;
                            }
                        }
                    )
                    if (index == -1) {

                        if (found.teamMembers) {
                            found.teamMembers.push({
                                "displayName": user
                            });
                        } else {
                            found.teamMembers = [{
                                "displayName": user
                            }]
                        }

                        if (found.history) {
                            found.history.push({
                                timestamp: Date.now(),
                                action: 'Joined team',
                                target: user
                            });
                        } else {
                            found.history = [{
                                timestamp: Date.now(),
                                action: 'Joined team',
                                target: user
                            }];
                        }

                        found.save().then(
                            saved => {
                                UserSub.upsertUsersTeamName([{ displayName: user }], found.teamName, found._id.toString());
                                res.status(200).send(util.returnMessaging(path, 'User Added To Team', false, saved, null, logObj));
                            },
                            err => {
                                res.status(500).send(util.returnMessaging(path, 'Error saving team', err, false, null, logObj));
                            }
                        )

                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'User Existed On Team All Ready';
                        res.status(200).send(util.returnMessaging(path, 'User Existed On Team All Ready', false, found, null, logObj));
                    }

                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'team not found'
                    res.status(200).send(util.returnMessaging(path, 'Team not found', false, false, null, logObj));
                }
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Error finding team', err, false, null, logObj));
            }
        )
    });

//returns a list of all teams!
router.post('/team/uploadLogo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {

    const path = '/admin/team/uploadLogo';
    let uploadedFileName = "";

    let teamName = req.body.teamName;
    let dataURI = req.body.logo;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'upload team logo ';
    logObj.target = teamName;
    logObj.logLevel = 'STD';

    uploadTeamLogo(path, dataURI, teamName).then(rep => {
            res.status(200).send(util.returnMessaging(path, "Image Uploaded.", false, null, rep.eo, logObj));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "err.message", err, null, null, logObj))
        });

});

router.post('/team/removeLogo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {

    const path = '/admin/team/removeLogo';

    let teamName = req.body.teamName;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'remove team logo ';
    logObj.target = teamName;
    logObj.logLevel = 'STD';

    Team.findOne({ teamName: teamName }).then(
        found => {
            if (found) {
                if (found.logo) {
                    let path = found.logo;
                    found.logo = null;
                    deleteFile(path);
                    found.save().then(
                        saved => {
                            res.status(200).send(util.returnMessaging(path, 'Logo removed.', null, null, saved, logObj));
                        },
                        err => {
                            res.status(500).send(util.returnMessaging(path, 'Team save error.', err, null, null, logObj));
                        }
                    )
                } else {
                    logObj.logLevel = "ERROR";
                    logObj.error = 'Team had no logo';
                    res.status(500).send(util.returnMessaging(path, 'Team had no logo', null, null, null, logObj));
                }
            } else {
                logObj.logLevel = "ERROR";
                logObj.error = 'Team not found.';
                res.status(500).send(util.returnMessaging(path, 'Team not found.', null, null, null, logObj));
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Team query error.', err, null, null, logObj));
        }
    )

});

module.exports = router;