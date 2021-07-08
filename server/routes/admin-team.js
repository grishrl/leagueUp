const utils = require('../utils');
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
const teamLogoDelete = require('../methods/teamLogoUpload').teamLogoDelete;
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const notesMethods = require('../methods/notes/notes');
const { commonResponseHandler } = require('../commonResponseHandler');


//returns the lists of users who are awaiting admin attention to complete the team join process
router.get('/pendingMemberQueue', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/pendingMemberQueue';

    commonResponseHandler(req, res, [], [], async(req) => {
        let response = {};
        const query = Admin.PendingQueue.find();
        query.sort('-timestamp');
        query.limit(20);
        await query.exec().then((reply) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found queues', false, reply)
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Couldn\'t get the queues', err)
        })
        return response;
    })

});

router.post('/pmq/delete', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/pmq/delete';
    // const query = Admin.PendingQueue.find();
    // let queue = req.body.queue;

    let requiredInputs = [{
        name: 'queue',
        type: 'object'
    }]

    commonResponseHandler(req, res, requiredInputs, [], async(req, res, validatedRequiredInputs) => {
        //log object

        const response = {};

        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' delete pending member queue ';
        logObj.target = `pending member queue ${validatedRequiredInputs.queue.value._id}`;
        logObj.logLevel = 'ADMIN';

        return cleanUp(validatedRequiredInputs.queue.value).then(
            success => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Deleted queue item', false, success, null, logObj);
                return response;
            },
            fail => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Failed to delete queue', fail, null, null, logObj);
                return response;
            }
        );
    })

});

router.post('/pmq/addnote', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/pmq/addnote';
    // const query = Admin.PendingQueue.find();
    let queue = req.body.queue;
    let newNoteText = req.body.note;

    const requiredInputs = [
        { name: 'queue', type: 'object' },
        { name: 'note', type: 'string' }
    ]

    commonResponseHandler(req, res, requiredInputs, [], async(req, res, requiredInputs) => {
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' delete pending member queue ';
        logObj.target = `pending member queue ${requiredInputs.queue.value._id}`;
        logObj.logLevel = 'ADMIN';
        const response = {};

        await Admin.PendingQueue.findById(requiredInputs.queue.value._id).then(
            found => {
                const newNote = {
                    id: req.user._id.toString(),
                    timeStamp: Date.now(),
                    note: requiredInputs.note.value
                }
                if (utils.returnBoolByPath(utils.objectify(found), 'notes')) {
                    found.notes.push(newNote);
                } else {
                    found.notes = [newNote];
                }
                found.markModified('notes');
                found.save().then(
                    saved => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Note updated', null, saved, null, logObj);
                    },
                    err => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Failed to save note to queue', err, null, null, logObj)
                    }
                )
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Failed to add note', err, null, null, logObj)
            }
        );

        return response;
    });


});

router.get('/pendingAvatarQueue', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/pendingAvatarQueue';
    commonResponseHandler(req, res, [], [], async() => {
        const response = {};
        const query = Admin.PendingAvatarQueue.find();
        query.sort('-timestamp');
        query.limit(20);
        await query.exec().then((reply) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found queues', false, reply)
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Couldn\'t get the queues', err)
        })
        return response;
    });
});

router.get('/pendingRankQueues', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/pendingRankQueues';

    commonResponseHandler(req, res, [], [], async() => {
        const response = {};
        const query = Admin.PendingRankQueue.find();
        query.sort('-timestamp');
        query.limit(20);
        await query.exec().then((reply) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found queues', false, reply)
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(path, 'Couldn\'t get the queues', err)
        });
        return response;
    })


});

router.get('/pendingRankQueuesCount', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/pendingRankQueuesCount';

    commonResponseHandler(req, res, [], [], async() => {
        const response = {};
        const query = Admin.PendingRankQueue.estimatedDocumentCount();
        await query.exec().then((reply) => {
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found queues', false, { queueCount: reply })
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(path, 'Couldn\'t get the queues', err)
        });
        return response;
    })


});

//removes the supplied member from the supplied team
router.post('/team/removeMember', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/team/removeMember';
    const requiredParameters = [{
            name: 'teamName',
            type: 'string'
        },
        {
            name: 'removeUser',
            type: 'stringOrArrayOfStrings'
        }
    ]
    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {

        const removeTeamMembers = require('../methods/team/removeMemebers').removeTeamMembers;

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'remove user from team ';
        logObj.target = requiredParameters.teamName.value + ' : ' + requiredParameters.removeUser.value;
        logObj.logLevel = 'ADMIN';

        const response = {};

        requiredParameters.teamName.value = requiredParameters.teamName.value.toLowerCase();

        await removeTeamMembers(requiredParameters.teamName.value, requiredParameters.removeUser.value, false).then(
            success => {

                let message = 'Default success.';

                if (success.message) {
                    message = success.message;
                }

                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, message, false, success.foundTeam, null, logObj)

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

                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, message, false, null, null, logObj)
            }
        );

        return response;

    })


});

//removes the supplied member from the invited array of team
router.post('/team/removeInvitedMember', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/team/removeInvitedMember';
    let teamName = req.body.teamName;
    let payloadUser = req.body.removeUser;

    const requiredParameters = [
        { name: 'teamName', type: 'string' },
        { name: 'removeUser', type: 'string' }
    ]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        const removeTeamMembers = require('../methods/team/removeInvitedMemebers').removeInvitedMembers;
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'remove invited user from team ';
        logObj.target = requiredParameters.teamName.value + ' : ' + requiredParameters.removeUser.value;
        logObj.logLevel = 'ADMIN';

        await removeTeamMembers(requiredParameters.teamName.value, requiredParameters.removeUser.value, false).then(
            success => {

                let message = 'Default success.';

                if (success.message) {
                    message = success.message;
                }
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, message, false, success.foundTeam, null, logObj)

            },
            fail => {
                let message = 'Default error message';
                if (fail.error) {
                    logObj.error = fail.error;
                    message = fail.error;
                }
                if (fail.logLevel) {
                    logObj.logLevel = fail.logLevel;
                }

                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, message, false, null, null, logObj)

            }
        );

        return response;
    });

});



//reassigns captain from the supplied team to the supplied teammember
router.post('/reassignCaptain', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/reassignCaptain';

    const requiredParameters = [
        { name: 'teamName', type: 'string' },
        { name: 'userName', type: 'string' }
    ];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredInputs) => {

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'reassign team captain ';
        logObj.target = requiredInputs.teamName.value + ' : ' + requiredInputs.userName.value;
        logObj.logLevel = 'ADMIN';

        const assignNewCaptain = require('../methods/team/assignCaptain').assignNewCaptain;

        const response = {};

        await assignNewCaptain(requiredInputs.teamName.value, requiredInputs.userName.value).then(
            success => {
                let message = 'Default success.';

                if (success.message) {
                    message = success.message;
                }

                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, message, false, success.foundTeam, null, logObj)
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

                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, message, fail.error, null, null, logObj)
            });

        return response;

    })

});

//approves a pending team member queue, removes the item from the queue and adds the member to the team
//updates the members profile to now be part of the team
router.post('/approveMemberAdd', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, async(req, res) => {
    const path = '/admin/approveMemberAdd';

    const requiredParameters = [
        { name: 'teamId', type: 'string' },
        { name: 'memberId', type: 'string' },
        { name: 'approved', type: 'boolean' }
    ]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let seasonNum = currentSeasonInfo.value;

        const response = {};

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'pending team member approval';
        logObj.logLevel = 'ADMIN';

        let msg = {};
        msg.sender = req.user._id;
        msg.subject = 'Team Join Approval';
        msg.timeStamp = new Date().getTime()
        if (requiredParameters.approved.value) {
            msg.content = 'Your team join has been approved!';
        } else {
            msg.content = 'Your team join has been denied!';
        }

        msg.notSeen = true;

        //find team matching the team in question
        await handleMemberQueue(requiredParameters.teamId.value, requiredParameters.memberId.value, logObj, requiredParameters.approved.value, seasonNum, req.originalUrl).then(
            success => {
                if (success.user) {
                    msg.recipient = success.user._id.toString();
                    //sending message to user
                    messageSub(msg);
                }
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Member added to team successfully.', false, success.team, success.user, logObj)

            },
            fail => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, fail.message, fail, null, null, logObj);
            }
        );
        return response;
    });

});


//deletes the supplied team,
//removes all team information from users profiles
router.post('/delete/team', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/delete/team';

    const requiredInputs = [
        { name: 'teamName', type: 'string' }
    ]

    commonResponseHandler(req, res, requiredInputs, [], async(req, res, requiredInputs) => {
        const response = {};
        //log object
        let team = requiredInputs.teamName.value.toLowerCase();
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'team deletion';
        logObj.target = team;
        logObj.logLevel = 'ADMIN';

        await Team.findOneAndDelete({
            teamName_lower: team
        }).then((deleted) => {
            if (deleted) {
                //TODO: Delete any dangling invited users!
                UserSub.clearUsersTeam(deleted.teamMembers);
                teamSub.markTeamWithdrawnInMatches(deleted.toObject());
                DivSub.updateTeamNameDivision(deleted.teamName, deleted.teamName + ' (withdrawn)');
                notesMethods.deleteAllNotesWhere(deleted._id.toString());
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Team deleted', false, deleted, null, logObj)
            } else {
                response.status = 500
                response.message = utils.returnMessaging(req.originalUrl, 'Error deleting team', false, null, null, logObj)
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error deleting team', err, null, null, logObj)
        })
        return response;
    });

});

//forfeits the team matches ... will be used for withdrawl or removed teams
router.post('/forfeit/team', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/forfeit/team';

    const requiredParameters = [
        { name: 'teamName', type: 'string' }
    ];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        const forfeitTeamsMatches = require('../methods/matches/forfeitTeamsMatches');
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'team deletion';
        logObj.target = requiredParameters.teamName.value;
        logObj.logLevel = 'ADMIN';

        await forfeitTeamsMatches.forfietTeam(requiredParameters.teamName.value.toLowerCase()).then(
            success => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Forfeited matches', false, success, null, logObj)
            },
            fail => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error forfeiting matches', fail, null, null, logObj)
            }
        );
        return response;
    })

});

//Saves a supplied team
router.post('/teamSave', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/teamSave';

    const requiredParameters = [{
            name: 'teamName',
            type: 'string'
        },
        {
            name: 'teamObj',
            type: 'object'
        }
    ];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let payload = requiredParameters.teamObj.value;
        let team = requiredParameters.teamName.value.toLowerCase();


        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'team edit';
        logObj.target = team;
        logObj.logLevel = 'ADMIN';
        let teamLower = team.toLowerCase();
        teamLower = teamLower.trim();
        payload.teamName_lower = payload.teamName_lower.trim();
        payload.teamName = payload.teamName.trim();

        //check if the team was renamed at the client
        if (teamLower != payload.teamName_lower) {
            //team was renamed
            //double check the new name doesn't exist all ready
            return Team.findOne({
                    teamName_lower: payload.teamName_lower
                }).then((foundTeam) => {
                    if (foundTeam) {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'team name was taken';
                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, 'This team name was all ready taken, can not complete request!', false, null, null, logObj)
                    } else {
                        //this might be a candidate for refactoring all the team saves into one single sub component - but not until I have a warm fuzzy about including teamName changes into the base sub, which I dont.
                        //team name was not modified; edit the properties we received.
                        return Team.findOne({
                            teamName_lower: teamLower
                        }).then((originalTeam) => {
                            if (originalTeam) {
                                let originalTeamName = originalTeam.teamName

                                //update the team name and teamname lower
                                originalTeam.teamName = payload.teamName;
                                originalTeam.teamName_lower = payload.teamName.toLowerCase();

                                // check the paylaod and update the found team if the originalTeam property if it existed on the payload
                                if (utils.returnBoolByPath(payload, 'lookingForMore')) {
                                    originalTeam.lookingForMore = payload.lookingForMore;
                                    originalTeam.markModified('lookingForMore');
                                }

                                if (utils.returnBoolByPath(payload, 'availability')) {
                                    originalTeam.availability = {};
                                    originalTeam.availability = payload.availability;
                                    originalTeam.markModified('availability');
                                }

                                if (utils.returnBoolByPath(payload, 'competitiveLevel')) {
                                    originalTeam.competitiveLevel = payload.competitiveLevel;
                                }

                                if (utils.returnBoolByPath(payload, 'descriptionOfTeam')) {
                                    originalTeam.descriptionOfTeam = payload.descriptionOfTeam;
                                }

                                if (utils.returnBoolByPath(payload, 'rolesNeeded')) {
                                    originalTeam.rolesNeeded = {};
                                    originalTeam.rolesNeeded = payload.rolesNeeded;
                                }

                                if (utils.returnBoolByPath(payload, 'timeZone')) {
                                    originalTeam.timeZone = payload.timeZone;
                                }

                                if (utils.returnBoolByPath(payload, 'twitch')) {
                                    originalTeam.twitch = payload.twitch;
                                }
                                if (utils.returnBoolByPath(payload, 'twitter')) {
                                    originalTeam.twitter = payload.twitter;
                                }
                                if (utils.returnBoolByPath(payload, 'youtube')) {
                                    originalTeam.youtube = payload.youtube;
                                }

                                if (utils.returnBoolByPath(payload, 'ticker')) {
                                    originalTeam.ticker = payload.ticker;
                                    originalTeam.ticker_lower = payload.ticker.toLowerCase();
                                }

                                if (utils.returnBoolByPath(payload, 'questionnaire')) {
                                    originalTeam.questionnaire = {};
                                    originalTeam.questionnaire = payload.questionnaire;
                                    originalTeam.markModified('questionnaire');
                                }

                                return originalTeam.save().then((savedTeam) => {
                                    var message = "";
                                    message += "Team updated";
                                    response.status = 200;
                                    response.message = utils.returnMessaging(req.originalUrl, message, false, savedTeam, null, logObj)

                                    //now we need subs to remove all instances of the old team name and replace it with
                                    //this new team name
                                    DivSub.updateTeamNameDivision(originalTeamName, savedTeam.teamName);
                                    OutreachSub.updateOutreachTeamname(originalTeamName, savedTeam.teamName);
                                    // QueueSub.updatePendingMembersTeamNameChange(originalTeamName, savedTeam.teamName_lower);
                                    //matches ... not existing yet
                                    UserSub.upsertUsersTeamName(savedTeam.teamMembers, savedTeam.teamName, savedTeam._id.toString());

                                    return response;

                                }, (err) => {

                                    response.status = 400;
                                    response.message = utils.returnMessaging(path, 'Error saving team information', err, null, null, logObj);

                                    return response;

                                });
                            } else {

                                logObj.logLevel = 'ERROR';
                                logObj.error = 'Team not found';

                                response.status = 400;
                                response.message = utils.returnMessaging(req.originalUrl, "Team not found", null, null, null, logObj)

                                return response;

                            }
                        }, (err) => {

                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error finding team', err, null, null, logObj)

                            return response;

                        })
                    }
                }, (err) => {

                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error querying teams!', err, null, null, logObj)

                    return response;

                })
                //delete old team???
                //save a new instance of the renamed team
        } else {
            //team name was not modified; edit the properties we received.
            return Team.findOne({
                teamName_lower: team
            }).then((foundTeam) => {
                if (foundTeam) {

                    // check the paylaod and update the found team if the foundTeam property if it existed on the payload
                    if (utils.returnBoolByPath(payload, 'lookingForMore')) {
                        foundTeam.lookingForMore = payload.lookingForMore;
                    }

                    if (utils.returnBoolByPath(payload, 'availability')) {

                        foundTeam.availability = {};

                        foundTeam.availability = payload.availability;
                    }

                    if (utils.returnBoolByPath(payload, 'competitiveLevel')) {
                        foundTeam.competitiveLevel = payload.competitiveLevel;
                    }

                    if (utils.returnBoolByPath(payload, 'descriptionOfTeam')) {
                        foundTeam.descriptionOfTeam = payload.descriptionOfTeam;
                    }

                    if (utils.returnBoolByPath(payload, 'rolesNeeded')) {
                        foundTeam.rolesNeeded = {};
                        foundTeam.rolesNeeded = payload.rolesNeeded;
                    }

                    if (utils.returnBoolByPath(payload, 'timeZone')) {
                        foundTeam.timeZone = payload.timeZone;
                    }

                    if (utils.returnBoolByPath(payload, 'twitch')) {
                        foundTeam.twitch = payload.twitch;
                    }
                    if (utils.returnBoolByPath(payload, 'twitter')) {
                        foundTeam.twitter = payload.twitter;
                    }
                    if (utils.returnBoolByPath(payload, 'youtube')) {
                        foundTeam.youtube = payload.youtube;
                    }

                    if (utils.returnBoolByPath(payload, 'ticker')) {
                        foundTeam.ticker = payload.ticker;
                        foundTeam.ticker = payload.ticker.toLowerCase();
                    }
                    if (utils.returnBoolByPath(payload, 'questionnaire')) {
                        foundTeam.questionnaire = {};
                        foundTeam.questionnaire = payload.questionnaire;
                        foundTeam.markModified('questionnaire');
                    }

                    return foundTeam.save().then((savedTeam) => {
                        var message = "";
                        message += "Team updated!";

                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, message, false, savedTeam, null, logObj)

                        return response;
                    }, (err) => {

                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, 'Error saving team information', err, null, null, logObj)

                        return response;

                    });
                } else {

                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Team not found';

                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, "Team not found", null, null, null, logObj)

                    return response;

                }
            }, (err) => {

                response.status = 400
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding team', err, null, null, logObj)

                return response;

            })

        }

    })


});


//calculates the resultant MMR from a pending member add for suplied memebers MMR and supplied team
router.post('/resultantmmr', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = '/admin/resultantmmr'


    const requiredParameters = [{
            name: 'userMmr',
            type: 'number'
        },
        {
            name: 'teamName',
            type: 'string'
        },
        {
            name: 'displayName',
            type: 'string'
        }
    ]
    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let newPlayerdDsplayName = requiredParameters.displayName.value;
        let teamName = requiredParameters.teamName.value;
        let userMmr = requiredParameters.userMmr.value;

        return Team.findOne({
            teamName_lower: teamName.toLowerCase()
        }).then((foundTeam) => {
            if (foundTeam) {
                let members = [];
                foundTeam.teamMembers.forEach(element => {
                    members.push(element.displayName);
                });
                return teamSub.resultantMMR(userMmr, members, newPlayerdDsplayName).then((processed) => {
                    if (processed) {

                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, "Team MMR calculated.", false, {
                            resultantMmr: processed
                        })

                        return response;

                    } else {

                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, "Team MMR not calculated.")

                        return response;
                    }
                }, (err) => {

                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, "Team MMR not calculated.", err)

                    return response;

                })
            } else {

                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, "Team MMR not calculated.")
                utils.errLogger(path, err, '784');

                return response;
            }
        }, (err) => {

            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding team', err)
            utils.errLogger(path, err, '789');

            return response;
        });

    });

});


//refreshes the MMR of a supplied team, in case the team mmr may need to be updated
router.post('/team/refreshMmr', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = 'admin/team/refreshMmr';

    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }]
    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        return Team.findOne({
            teamName_lower: requiredParameters.teamName.value.toLowerCase()
        }).then(
            (foundTeam) => {
                let members = [];
                foundTeam.teamMembers.forEach(member => {
                    members.push(member.displayName);
                })
                return teamSub.returnTeamMMR(members).then(
                    (processed) => {
                        if (processed) {
                            // playerRanksMethods.teamRankAverage(members).then(
                            //     rankAvg => {
                            foundTeam.stormRankAvg = processed.stormRankAvg;
                            foundTeam.teamMMRAvg = processed.averageMmr;
                            foundTeam.hpMmrAvg = processed.heroesProfileAvgMmr;
                            foundTeam.ngsMmrAvg = processed.ngsAvgMmr;
                            return foundTeam.save().then(
                                (saved) => {
                                    response.status = 200;
                                    response.message = utils.returnMessaging(req.originalUrl, 'Recalculated Team', false, {
                                        newMMR: processed
                                    });
                                    return response;
                                },
                                (err) => {
                                    response.status = 500;
                                    response.message = utils.returnMessaging(req.originalUrl, 'Error saving team', err)
                                    return response;
                                }
                            )

                        } else {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error processing mmr team')
                            return response;
                        }
                    },
                    (err) => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Error processing team mmr', err)
                        return response;
                    }
                )
            },
            (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding team', err)
                return response;
            });
    });

});


//returns a list of all teams!
router.get('/get/teams/all', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    const path = 'admin/get/teams/all';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        let response = {};
        await Team.find().then(
            (foundTeams) => {
                response.status = 200;
                if (!foundTeams) {
                    foundTeams = [];
                }
                response.message = utils.returnMessaging(req.originalUrl, 'Found teams', false, foundTeams);
                return response;
            },
            (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding teams', err);
                return response;
            });
        return response;
    });

});

//returns a list of all teams!
router.get('/test', (req, res) => {
    const path = 'admin/get/teams/all';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        let response = {};
        await Team.find().then(
            (foundTeams) => {
                response.status = 200;
                if (!foundTeams) {
                    foundTeams = [];
                }
                response.message = utils.returnMessaging(req.originalUrl, 'Found teams', false, foundTeams);
            },
            (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding teams', err);
            });
        return response;
    });

});

router.post('/team/memberAdd',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.teamLevel, utils.appendResHeader, async(req, res) => {

        const path = 'admin/team/memberAdd';

        const requiredParameters = [{
            name: 'user',
            type: 'string'
        }, {
            name: 'teamName',
            type: 'string'
        }]

        commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
            const response = {};

            let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
            let seasonNum = currentSeasonInfo.value;

            let user = requiredParameters.user.value;
            let team = requiredParameters.teamName.value;

            //log object
            let logObj = {};
            logObj.actor = req.user.displayName;
            logObj.action = ' manual add user to team ';
            logObj.target = team + ' : ' + user;
            logObj.logLevel = 'ADMIN';

            return Team.findOne({
                teamName_lower: team.toLowerCase()
            }).then(
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

                            return found.save().then(
                                saved => {
                                    UserSub.upsertUsersTeamName([{
                                        displayName: user
                                    }], found.teamName, found._id.toString());
                                    response.status = 200;
                                    response.message = utils.returnMessaging(req.originalUrl, 'User Added To Team', false, saved, null, logObj)
                                    return response;
                                },
                                err => {
                                    response.status = 500;
                                    response.message = utils.returnMessaging(req.originalUrl, 'Error saving team', err, false, null, logObj)
                                    return response;
                                }
                            )

                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'User Existed On Team All Ready';
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'User Existed On Team All Ready', false, found, null, logObj)
                            return response;
                        }

                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'team not found'
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Team not found', false, false, null, logObj)
                        return response;
                    }
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error finding team', err, false, null, logObj)
                    return response;
                }
            )

        });
    });

//returns a list of all teams!
router.post('/team/uploadLogo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {
    //TODO - replace this with direct to s3 method?
    const path = '/admin/team/uploadLogo';




    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }, {
        name: 'logo',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let uploadedFileName = "";
        let teamName = requiredParameters.teamName.value;
        let dataURI = requiredParameters.logo.value;
        //construct log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'upload team logo ';
        logObj.target = teamName;
        logObj.logLevel = 'STD';
        await uploadTeamLogo(dataURI, teamName).then(rep => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Image Uploaded.", false, null, rep.eo, logObj)
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, "err.message", err.message, null, null, logObj)
            });
        return response;
    })

});

router.post('/team/removeLogo', passport.authenticate('jwt', {
    session: false
}), levelRestrict.teamLevel, utils.appendResHeader, (req, res) => {

    const path = '/admin/team/removeLogo';

    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let teamName = requiredParameters.teamName.value;

        //construct log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'remove team logo ';
        logObj.target = teamName;
        logObj.logLevel = 'STD';

        return Team.findOne({
            teamName: teamName
        }).then(
            found => {
                if (found) {
                    if (found.logo) {
                        let path = found.logo;
                        found.logo = null;
                        teamLogoDelete(path);
                        return found.save().then(
                            saved => {
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'Logo removed.', null, null, saved, logObj)
                                return response;
                            },
                            err => {
                                response.status = 500;
                                response.message = utils.returnMessaging(req.originalUrl, 'Team save error.', err, null, null, logObj)
                                return response;
                            }
                        )
                    } else {
                        logObj.logLevel = "ERROR";
                        logObj.error = 'Team had no logo';
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Team had no logo', null, null, null, logObj)
                        return response;
                    }
                } else {
                    logObj.logLevel = "ERROR";
                    logObj.error = 'Team not found.';
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Team not found.', null, null, null, logObj)
                    return response;
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Team query error.', err, null, null, logObj)
                return response;
            }
        );

    });

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
        utils.errLogger('handleMemberQueue - teamFind', err);
        return null;
    });

    //grab the user associated with this
    let userMong = await User.findOne({
        _id: member
    }).then((foundUser) => {
        return foundUser;
    }, (err) => {
        utils.errLogger('handleMemberQueue - userFind', err);
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
                teamMong.markModified('pendingMembers');
                //save the team and the user
                let teamSavedMong = teamMong.save().then((savedTeam) => {
                    teamSub.updateTeamMmrAsynch(savedTeam);
                    return savedTeam;
                }, (teamSaveErr) => {
                    utils.errLogger('handleMemberQueue - teamSave', teamSaveErr);
                    return null;
                });
                let userSavedMong = await userMong.save().then((savedUser) => {
                    return savedUser;
                }, (userSaveErr) => {
                    utils.errLogger('handleMemberQueue - userSave', userSaveErr);
                    return null;
                });
                //add this to the return object for sending back to caller;
                returnObject.team = teamSavedMong;
                returnObject.user = userSavedMong;
                //this should fire whether the user was approved or denied, clean this item from the queue
                QueueSub.removePendingByTeamAndUser(utils.returnIdString(teamMong._id), teamMong.teamName_lower, utils.returnIdString(userMong._id), userMong.displayName);
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
        utils.errLogger('handleMemberQueue - teamFind', err);
        return null;
    });

    //grab the user associated with this
    let userMong = await User.findOne({
        _id: queue.userId
    }).then((foundUser) => {
        return foundUser;
    }, (err) => {
        utils.errLogger('handleMemberQueue - userFind', err);
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
            teamSub.updateTeamMmrAsynch(savedTeam);
            return savedTeam;
        }, (teamSaveErr) => {
            utils.errLogger('cleanUp - teamSave', teamSaveErr);
            return null;
        });
        returnObject.team = teamSavedMong;
    }
    if (userMong) {
        let userSavedMong = await userMong.save().then((savedUser) => {
            return savedUser;
        }, (userSaveErr) => {
            utils.errLogger('cleanUp - userSave', userSaveErr);
            return null;
        });
        //add this to the return object for sending back to caller;
        returnObject.user = userSavedMong;
    }

    return QueueSub.removePendingQueue(queue);

}