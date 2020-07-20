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
const SeasonInfoCommon = require('../methods/seasonInfoMethods');

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

router.post('/pmq/delete', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/pmq/delete';
    // const query = Admin.PendingQueue.find();
    let queue = req.body.queue;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' delete pending member queue ';
    logObj.target = `pending member queue ${queue._id}`;
    logObj.logLevel = 'ADMIN';


    cleanUp(queue).then(
        success => {
            res.status(200).send(util.returnMessaging(path, 'Deleted queue item', false, success, null, logObj));
        },
        fail => {
            res.status(500).send(util.returnMessaging(path, 'Failed to delete queue', fail, null, null, logObj));
        }
    );

});

router.post('/pmq/addnote', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/pmq/addnote';
    // const query = Admin.PendingQueue.find();
    let queue = req.body.queue;
    let newNoteText = req.body.note;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' delete pending member queue ';
    logObj.target = `pending member queue ${queue._id}`;
    logObj.logLevel = 'ADMIN';

    Admin.PendingQueue.findById(queue._id).then(
        found => {
            const newNote = {
                id: req.user._id.toString(),
                timeStamp: Date.now(),
                note: newNoteText
            }
            if (util.returnBoolByPath(util.objectify(found), 'notes')) {
                found.notes.push(newNote);
            } else {
                found.notes = [newNote];
            }
            found.markModified('notes');
            found.save().then(
                saved => {
                    res.status(200).send(util.returnMessaging(path, 'Note updated', null, saved, null, logObj));
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, 'Failed to save note to queue', err, null, null, logObj));
                }
            )
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Failed to add note', err, null, null, logObj));
        }
    )

});

router.get('/pendingAvatarQueue', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/pendingAvatarQueue';
    const query = Admin.PendingAvatarQueue.find();
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

    const removeTeamMembers = require('../methods/team/removeMemebers').removeTeamMembers;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'remove user from team ';
    logObj.target = teamName + ' : ' + payloadUser;
    logObj.logLevel = 'ADMIN';

    removeTeamMembers(teamName, payloadUser, false).then(
        success => {

            let message = 'Default success.';

            if (success.message) {
                message = success.message;
            }

            res.status(200).send(util.returnMessaging(path, message, false, success.foundTeam, null, logObj));

        },
        fail => {
            if (fail.error) {
                logObj.error = fail.error;
            }
            if (fail.logLevel) {
                logObj.logLevel = fail.logLevel;
            }
            let message = 'Default error message';
            if (fail.message) {
                message = fail.message;
            }

            res.status(400).send(util.returnMessaging(path, message, false, null, null, logObj));
        }
    );
});

//removes the supplied member from the invited array of team
router.post('/team/removeInvitedMember', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/team/removeInvitedMember';
    let teamName = req.body.teamName;
    let payloadUser = req.body.removeUser;
    teamName = teamName.toLowerCase();

    const removeTeamMembers = require('../methods/team/removeInvitedMemebers').removeInvitedMembers;
    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'remove invited user from team ';
    logObj.target = teamName + ' : ' + payloadUser;
    logObj.logLevel = 'ADMIN';

    removeTeamMembers(teamName, payloadUser, false).then(
        success => {

            let message = 'Default success.';

            if (success.message) {
                message = success.message;
            }

            res.status(200).send(util.returnMessaging(path, message, false, success.foundTeam, null, logObj));

        },
        fail => {
            if (fail.error) {
                logObj.error = fail.error;
            }
            if (fail.logLevel) {
                logObj.logLevel = fail.logLevel;
            }
            let message = 'Default error message';
            if (fail.message) {
                message = fail.message;
            }

            res.status(400).send(util.returnMessaging(path, message, false, null, null, logObj));
        }
    );
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

    const assignNewCaptain = require('../methods/team/assignCaptain').assignNewCaptain;

    assignNewCaptain(team, newCpt).then(
        success => {
            let message = 'Default success.';

            if (success.message) {
                message = success.message;
            }

            res.status(200).send(util.returnMessaging(path, message, false, success.foundTeam, null, logObj));

        },
        fail => {
            if (fail.error) {
                logObj.error = fail.error;
            }
            if (fail.logLevel) {
                logObj.logLevel = fail.logLevel;
            }
            let message = 'Default error message';
            if (fail.message) {
                message = fail.message;
            }

            res.status(400).send(util.returnMessaging(path, message, fail.error, null, null, logObj));
        }
    )
});

//approves a pending team member queue, removes the item from the queue and adds the member to the team
//updates the members profile to now be part of the team
router.post('/approveMemberAdd', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, async(req, res) => {

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

    const path = '/admin/approveMemberAdd';
    var teamId = req.body.teamId;
    var member = req.body.memberId;
    var approved = req.body.approved;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'pending team member approval';
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
    handleMemberQueue(teamId, member, logObj, approved, seasonNum, path).then(
        success => {
            if (success.user) {
                msg.recipient = success.user._id.toString();
                //sending message to user
                messageSub(msg);
            }
            res.status(200).send(util.returnMessaging(path, 'Member added to team successfully.', false, success.team, success.user, logObj));
        },
        fail => {
            res.status(500).send(util.returnMessaging(path, fail.message, fail, null, null, logObj));
        }
    );

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

//forfeits the team matches ... will be used for withdrawl or removed teams
router.post('/forfeit/team', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, util.appendResHeader, (req, res) => {
    const path = '/admin/forfeit/team';
    var team = req.body.teamName;
    team = team.toLowerCase();

    const forfeitTeamsMatches = require('../methods/matches/forfeitTeamsMatches');
    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'team deletion';
    logObj.target = team;
    logObj.logLevel = 'ADMIN';

    forfeitTeamsMatches.forfietTeam(team).then(
        success => {
            res.status(200).send(util.returnMessaging(path, 'Forfeited matches', false, success, null, logObj));
        },
        fail => {
            console.log(fail);
            res.status(500).send(util.returnMessaging(path, 'Error forfeiting matches', fail, null, null, logObj));
        }
    );

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

    teamLower = teamLower.trim();
    payload.teamName_lower = payload.teamName_lower.trim();
    payload.teamName = payload.teamName.trim();

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
                                originalTeam.markModified('lookingForMore');
                            }

                            if (util.returnBoolByPath(payload, 'availability')) {
                                originalTeam.availability = {};
                                originalTeam.availability = payload.availability;
                                originalTeam.markModified('availability');
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

                            if (util.returnBoolByPath(payload, 'twitch')) {
                                originalTeam.twitch = payload.twitch;
                            }
                            if (util.returnBoolByPath(payload, 'twitter')) {
                                originalTeam.twitter = payload.twitter;
                            }
                            if (util.returnBoolByPath(payload, 'youtube')) {
                                originalTeam.youtube = payload.youtube;
                            }

                            if (util.returnBoolByPath(payload, 'ticker')) {
                                originalTeam.ticker = payload.ticker;
                                originalTeam.ticker_lower = payload.ticker.toLowerCase();
                            }

                            if (util.returnBoolByPath(payload, 'questionnaire')) {
                                originalTeam.questionnaire = {};
                                originalTeam.questionnaire = payload.questionnaire;
                                originalTeam.markModified('questionnaire');
                            }

                            originalTeam.save().then((savedTeam) => {
                                var message = "";
                                message += "Team updated";
                                res.status(200).send(util.returnMessaging(path, message, false, savedTeam, null, logObj));

                                //now we need subs to remove all instances of the old team name and replace it with
                                //this new team name
                                DivSub.updateTeamNameDivision(originalTeamName, savedTeam.teamName);
                                OutreachSub.updateOutreachTeamname(originalTeamName, savedTeam.teamName);
                                // QueueSub.updatePendingMembersTeamNameChange(originalTeamName, savedTeam.teamName_lower);
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

                if (util.returnBoolByPath(payload, 'twitch')) {
                    foundTeam.twitch = payload.twitch;
                }
                if (util.returnBoolByPath(payload, 'twitter')) {
                    foundTeam.twitter = payload.twitter;
                }
                if (util.returnBoolByPath(payload, 'youtube')) {
                    foundTeam.youtube = payload.youtube;
                }

                if (util.returnBoolByPath(payload, 'ticker')) {
                    foundTeam.ticker = payload.ticker;
                    foundTeam.ticker = payload.ticker.toLowerCase();
                }
                if (util.returnBoolByPath(payload, 'questionnaire')) {
                    foundTeam.questionnaire = {};
                    foundTeam.questionnaire = payload.questionnaire;
                    foundTeam.markModified('questionnaire');
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

                        foundTeam.teamMMRAvg = processed.averageMmr;
                        foundTeam.hpMmrAvg = processed.heroesProfileAvgMmr;
                        foundTeam.ngsMmrAvg = processed.ngsAvgMmr;
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
                    res.status(500).send(util.returnMessaging(path, 'Error processing team mmr', err));
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
    }), levelRestrict.teamLevel, util.appendResHeader, async(req, res) => {
        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let seasonNum = currentSeasonInfo.value;
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
                                target: user,
                                season: seasonNum
                            });
                        } else {
                            found.history = [{
                                timestamp: Date.now(),
                                action: 'Joined team',
                                target: user,
                                season: seasonNum
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

async function handleMemberQueue(teamId, member, logObj, approved, seasonNum) {

    let returnObject = {
        team: null,
        user: null
    }

    //get the team associated with this
    let teamMong = await Team.findOne({
        _id: teamId
    }).then((foundTeam) => {
        return foundTeam;
    }, (err) => {
        util.errLogger('handleMemberQueue - teamFind', err);
        return null;
    });

    //grab the user associated with this
    let userMong = await User.findOne({
        _id: member
    }).then((foundUser) => {
        return foundUser;
    }, (err) => {
        util.errLogger('handleMemberQueue - userFind', err);
        return null;
    });

    //found team and user 
    if (teamMong && userMong) {
        //join was approved;

        //update the log object target with information
        logObj.target = teamMong.teamName + ' : ' + userMong.displayName + ' - ' + approved;

        var teamMongObject = teamMong.toObject();
        //double check that the user is in the pending members
        if (teamMongObject.hasOwnProperty('pendingMembers') && teamMongObject.pendingMembers.length > 0) {
            var index = -1;
            //loop through pending members and find the index of the user in question
            for (var i = 0; i < teamMongObject.pendingMembers.length; i++) {
                if (teamMongObject.pendingMembers[i].displayName == userMong.displayName) {
                    index = i;
                }
            }
            //if we find the user in the pending members
            if (index > -1) {
                //we need to do some different things here for approved accounts and denied.
                if (approved) {
                    //push the member into the team's actual members then splice them out of the pending members
                    teamMong.teamMembers.push(teamMongObject.pendingMembers[index]);
                    teamMong.pendingMembers.splice(index, 1);

                    // create/update team history for this user joining
                    if (teamMong.history) {
                        teamMong.history.push({
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: userMong.displayName,
                            season: seasonNum
                        });
                    } else {
                        teamMong.history = [{
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: userMong.displayName,
                            season: seasonNum
                        }];
                    }

                    //update the user with the team info
                    userMong.teamName = teamMong.teamName;
                    userMong.teamId = teamMong._id;
                    userMong.pendingTeam = false;
                    userMong.lookingForGroup = false;

                    // create/update the user history this team join
                    if (userMong.history) {
                        userMong.history.push({
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: teamMong.teamName,
                            season: seasonNum
                        });
                    } else {
                        userMong.history = [{
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: teamMong.teamName,
                            season: seasonNum
                        }];
                    }

                } else {

                    //remove the member from the pending members
                    teamMong.pendingMembers.splice(index, 1);

                    //make sure that the member's teaminfo is cleared.
                    if (userMong.teamName || userMong.teamId) {
                        userMong.teamName = null;
                        userMong.teamId = null;
                    }
                    userMong.pendingTeam = false;
                }
                //save the team and the user
                let teamSavedMong = teamMong.save().then((savedTeam) => {
                    teamSub.updateTeamMmr(savedTeam);
                    return savedTeam;
                }, (teamSaveErr) => {
                    util.errLogger('handleMemberQueue - teamSave', teamSaveErr);
                    return null;
                });
                let userSavedMong = await userMong.save().then((savedUser) => {
                    return savedUser;
                }, (userSaveErr) => {
                    util.errLogger('handleMemberQueue - userSave', userSaveErr);
                    return null;
                });
                //add this to the return object for sending back to caller;
                returnObject.team = teamSavedMong;
                returnObject.user = userSavedMong;
                //this should fire whether the user was approved or denied, clean this item from the queue
                QueueSub.removePendingByTeamAndUser(util.returnIdString(teamMong._id), teamMong.teamName_lower, util.returnIdString(userMong._id), userMong.displayName);
            } else {
                throw {
                    error: `User ${member} not found in team ${teamId} pending members`,
                    message: 'User was not found in pending members of team, investigate and delete?'
                }
            }
        } else {
            throw {
                error: `Team ${teamId} had no pending members`,
                message: "Team had no pending members, investigate and delete?"
            }
            //return something back now
        }

    }
    //found team but not user
    else if (teamMong && !userMong) {
        //this is an usuall situation investigate and delete?
        throw {
            error: `Team ${teamId} not found.`,
            message: "Team was found but user was not, investigate and delete?"
        }
    }
    //found user but not team
    else if (!teamMong && userMong) {
        //this is an usuall situation investigate and delete?
        throw {
            error: `User ${member} not found.`,
            message: "User was found but team was not, investigate and delete?"
        }
    }
    //we found nothing
    else {
        //something went really wrong!
        throw {
            error: "Something really bad",
            message: "Something is wrong with this Pending Member Add, investigate and delete?"
        }
    }

    return returnObject;

}

async function cleanUp(queue) {

    let returnObject = {
        team: null,
        user: null
    }

    //get the team associated with this
    let teamMong = await Team.findOne({
        _id: queue.teamId
    }).then((foundTeam) => {
        return foundTeam;
    }, (err) => {
        util.errLogger('handleMemberQueue - teamFind', err);
        return null;
    });

    //grab the user associated with this
    let userMong = await User.findOne({
        _id: queue.userId
    }).then((foundUser) => {
        return foundUser;
    }, (err) => {
        util.errLogger('handleMemberQueue - userFind', err);
        return null;
    });

    //found team and user 
    if (teamMong && userMong) {
        //join was approved;
        var teamMongObject = teamMong.toObject();
        //double check that the user is in the pending members
        if (teamMongObject.hasOwnProperty('pendingMembers') && teamMongObject.pendingMembers.length > 0) {
            var index = -1;
            //loop through pending members and find the index of the user in question
            for (var i = 0; i < teamMongObject.pendingMembers.length; i++) {
                if (teamMongObject.pendingMembers[i].id == userMong._id.toString()) {
                    index = i;
                }
            }
            //if we find the user in the pending members
            if (index > -1) {
                //we need to do some different things here for approved accounts and denied.

                //remove the member from the pending members
                teamMong.pendingMembers.splice(index, 1);
            }
            //make sure that the member's teaminfo is cleared.
            userMong.teamName = null;
            userMong.teamId = null;
            userMong.pendingTeam = false;
        }
    }
    //found team but not user
    else if (teamMong && !userMong) {
        //this is an usuall situation investigate and delete?
        //join was approved;
        var teamMongObject = teamMong.toObject();
        //double check that the user is in the pending members
        if (teamMongObject.hasOwnProperty('pendingMembers') && teamMongObject.pendingMembers.length > 0) {
            var index = -1;
            //loop through pending members and find the index of the user in question
            for (var i = 0; i < teamMongObject.pendingMembers.length; i++) {
                if (teamMongObject.pendingMembers[i].id == member) {
                    index = i;
                }
            }
            //if we find the user in the pending members
            if (index > -1) {
                //we need to do some different things here for approved accounts and denied.

                //remove the member from the pending members
                teamMong.pendingMembers.splice(index, 1);
            }
        }
    }
    //found user but not team
    else if (!teamMong && userMong) {
        //this is an usuall situation investigate and delete?
        //make sure that the member's teaminfo is cleared.
        userMong.teamName = null;
        userMong.teamId = null;
        userMong.pendingTeam = false;
    }

    //save the team and the user
    if (teamMong) {
        let teamSavedMong = teamMong.save().then((savedTeam) => {
            teamSub.updateTeamMmr(savedTeam);
            return savedTeam;
        }, (teamSaveErr) => {
            util.errLogger('cleanUp - teamSave', teamSaveErr);
            return null;
        });
        returnObject.team = teamSavedMong;
    }
    if (userMong) {
        let userSavedMong = await userMong.save().then((savedUser) => {
            return savedUser;
        }, (userSaveErr) => {
            util.errLogger('cleanUp - userSave', userSaveErr);
            return null;
        });
        //add this to the return object for sending back to caller;
        returnObject.user = userSavedMong;
    }

    return QueueSub.removePendingQueue(queue);

}