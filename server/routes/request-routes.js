const {
    confirmCaptain
} = require("../methods/confirmCaptain");
const utils = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const QueueSub = require('../subroutines/queue-subs');
const UserSub = require('../subroutines/user-subs');
const Team = require("../models/team-models");
const passport = require("passport");
const messageSub = require('../subroutines/message-subs');
const Message = require('../models/message-models');
const { returnIdFromDisplayName } = require('../methods/profileMethods');
const { commonResponseHandler } = require('./../commonResponseHandler');


router.post('/team/join', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/request/team/join';


    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let payloadyTeamName = requiredParameters.teamName.value;
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' request team join ';
        logObj.target = payloadyTeamName;
        logObj.logLevel = 'STD';
        logObj.timeStamp = new Date().getTime();

        payloadyTeamName = payloadyTeamName.toLowerCase();

        return Team.findOne({
            teamName_lower: payloadyTeamName
        }).then(
            found => {
                if (found) {

                    return returnIdFromDisplayName(found.captain).then(
                        foundCaptain => {
                            if (foundCaptain) {
                                let msg = {};
                                msg.sender = req.user._id;
                                msg.recipient = foundCaptain;
                                msg.subject = 'Team join request';
                                msg.content = req.user.displayName + ' requests to join your team.';
                                msg.notSeen = true;
                                msg.request = {
                                    instance: 'team',
                                    action: 'join',
                                    target: found.teamName_lower,
                                    requester: req.user.displayName
                                }
                                msg.timeStamp = new Date().getTime();

                                messageSub(msg);
                                response.status = 200;
                                response.message = utils.returnMessaging(path, 'Message sent', null, null, null, logObj)
                                return response;

                            } else {
                                logObj.logLevel = 'ERROR';
                                logObj.error = 'captain info was not found'
                                response.status = 400;
                                response.message = utils.returnMessaging(path, 'There was an error getting cpt info', null, null, null, logObj)
                                return response;
                            }
                        },
                        err => {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'captain info was not found'
                            response.status = 500;
                            response.message = utils.returnMessaging(path, 'There was an error getting team info', err, null, null, logObj);
                            return response;
                        }
                    )

                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Team was not found'
                    response.status = 400;
                    response.message = utils.returnMessaging(path, 'There was an error finding the team', null, null, null, logObj);
                    return response;
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(path, 'There was an error finding the team', err, null, null, logObj)
                return response;
            }
        )

    })


});

router.post('/team/join/response', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    let path = '/request/team/join/response';



    const requiredParameters = [{
            name: 'teamName',
            type: 'string'
        },
        {
            name: 'addMember',
            type: 'string'
        }, {
            name: 'messageId',
            type: 'string'
        }, {
            name: 'approval',
            type: 'boolean'
        }
    ]


    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        var payloadTeamName = requiredParameters.teamName.value;
        var payloadMemberToAdd = requiredParameters.addMember.value;
        var messageId = requiredParameters.messageId.value;
        var approval = requiredParameters.approval.value;
        payloadTeamName = payloadTeamName.toLowerCase();

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' accept team join request ';
        logObj.target = payloadTeamName + ' ' + payloadMemberToAdd;
        logObj.logLevel = 'STD';

        //if the approval was true IE accepted, 
        //join this user into the pending members, 
        //set their pending member, 
        //and send them a confirmation
        //delete any outstanding messages from the user
        if (approval) {
            //grab the team
            return Team.findOne({
                teamName_lower: payloadTeamName
            }).then((foundTeam) => {
                if (foundTeam) {
                    var cont = true;
                    let pendingMembers = utils.returnByPath(foundTeam, 'pendingMembers')
                    if (pendingMembers && cont) {
                        pendingMembers.forEach(function(member) {
                            if (member.displayName == payloadMemberToAdd) {
                                cont = false;
                                logObj.error = 'User was all ready pending team member';
                                response.status = 403;
                                response.message = utils.returnMessaging(path, "User " + payloadMemberToAdd + " exists in pending members currently", false, null, null, logObj);
                                return response;
                            }
                        });
                    }
                    let currentMembers = utils.returnByPath(foundTeam, 'teamMembers');
                    if (currentMembers && cont) { //current members
                        currentMembers.forEach(function(member) {
                            if (member.displayName == payloadMemberToAdd) {
                                cont = false;
                                logObj.error = 'User was all ready team member';
                                response.status = 403;
                                response.message = utils.returnMessaging(path, "User " + payloadMemberToAdd + " exists in members currently", false, null, null, logObj);
                                return response;
                            }
                        });
                    }
                    if (cont) {
                        return User.findOne({
                            displayName: payloadMemberToAdd
                        }).then((foundUser) => {
                            if (foundUser) {
                                //double check that the user has not been added to another team in the mean time
                                if (foundUser.pendingTeam || !utils.isNullorUndefined(foundUser.teamName) || !utils.isNullorUndefined(foundUser.teamId)) {
                                    logObj.logLevel = "ERROR";
                                    logObj.error = 'User was all ready on a team or pending team'
                                    response.status = 400;
                                    response.message = utils.returnMessaging(path, "User was all ready on a team or pending team", false, foundUser, null, logObj);
                                    return response;
                                } else {
                                    if (!utils.returnBoolByPath(foundTeam.toObject(), 'pendingMembers')) {
                                        foundTeam.pendingMembers = [];
                                    }
                                    let fuid = foundUser._id.toString();
                                    foundTeam.pendingMembers.push({
                                        "id": fuid,
                                        "displayName": foundUser.displayName
                                    });

                                    return foundTeam.save().then((saveOK) => {

                                        deleteOutstandingRequests(foundUser._id);
                                        UserSub.togglePendingTeam(foundUser.displayName);
                                        QueueSub.addToPendingTeamMemberQueue(utils.returnIdString(foundTeam._id), foundTeam.teamName_lower, utils.returnIdString(foundUser._id), foundUser.displayName);

                                        let msg = {};
                                        msg.sender = req.user._id;
                                        msg.recipient = foundUser._id;
                                        msg.subject = 'Team join request';
                                        msg.content = req.user.displayName + ' accepted your request to join the team!  The request has been added to the approval queue for the admins.';
                                        msg.notSeen = true;
                                        msg.timeStamp = new Date().getTime();

                                        messageSub(msg);

                                        response.status = 200;
                                        response.message = utils.returnMessaging(path, "User added to pending members", false, saveOK, null, logObj)
                                        return response;

                                    }, (teamSaveErr) => {
                                        logObj.logLevel = 'ERROR';
                                        response.status = 500;
                                        response.message = path, "error adding user to team", teamSaveErr, null, null, logObj
                                        return response;
                                    });
                                }

                            }
                        }, (err) => {
                            response.status = 500;
                            response.message = utils.returnMessaging(path, "error finding user", err, null, null, logObj);
                            return response;
                        })
                    }

                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'team was not found'
                    response.status = 500;
                    response.message = utils.returnMessaging(path, "team was not found!", false, null, null, logObj);
                    return response;
                }
            });
        } else {

            return Message.findByIdAndDelete(messageId).then(
                msgDel => {
                    logObj.action = 'Team request denied by cpt';
                    response.status = 200;
                    response.message = utils.returnMessaging(path, "Team request denied by cpt", false, msgDel, null, logObj)
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(path, "Error deleting message", err, null, null, logObj);
                    return response;
                }
            )

        }
    });

});

router.post('/user/join', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/request/user/join';

    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }, {
        name: 'userName',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let payloadyTeamName = requiredParameters.teamName.value;
        let payloadUserName = requiredParameters.userName.value;

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' invite user to join team ' + payloadyTeamName;
        logObj.target = payloadUserName;
        logObj.logLevel = 'STD';
        logObj.timeStamp = new Date().getTime();

        let teamName_lower = payloadyTeamName.toLowerCase();

        //do some spot checking on the team to make sure it has not exceeded the maximum team members
        return Team.findOne({
            teamName_lower: teamName_lower
        }).then(
            foundTeam => {
                let teamObj = utils.objectify(foundTeam);
                let memberCount = 0;
                if (utils.returnBoolByPath(teamObj, 'pendingMembers')) {
                    memberCount += teamObj.pendingMembers.length;
                }
                if (memberCount >= 9) {
                    logObj.logLevel = "ERROR";
                    logObj.error = 'Too many members on team to invite members';
                    response.status = 400;
                    response.message = utils.returnMessaging(path, 'This team has too many members', null, null, null, logObj);
                    return response;
                } else {
                    return User.findOne({
                        displayName: payloadUserName
                    }).then(
                        foundUser => {
                            if (foundUser) {
                                // send message to the particular user.
                                let msg = {};
                                msg.sender = req.user._id;
                                msg.recipient = foundUser._id;
                                msg.subject = 'Team invite';
                                msg.content = req.user.displayName + ' has invited you to join their team, ' + payloadyTeamName + '!';
                                msg.notSeen = true;
                                msg.request = {
                                    instance: 'user',
                                    action: 'invite',
                                    target: foundUser.displayName,
                                    requester: payloadyTeamName
                                }
                                msg.timeStamp = new Date().getTime();

                                messageSub(msg);

                                if (foundTeam.invitedUsers) {
                                    foundTeam.invitedUsers.push(payloadUserName);
                                } else {
                                    foundTeam.invitedUsers = [payloadUserName];
                                }
                                foundTeam.save().then(
                                    saved => {
                                        // empty return from promise
                                    },
                                    err => {
                                        //empty return from promise
                                    }
                                )

                                response.status = 200;
                                response.message = utils.returnMessaging(path, 'Invite sent, this user must accept the invite!', null, null, null, logObj);
                                return response;

                            } else {
                                logObj.logLevel = 'ERROR';
                                logObj.error = 'User was not found';
                                response.status = 400;
                                response.message = utils.returnMessaging(path, 'There was an error finding the user info', null, null, null, logObj);
                                return response;
                            }
                        },
                        err => {
                            response.status = 500;
                            response.message = utils.returnMessaging(path, 'There was an error finding the user', err, null, null, logObj);
                            return response;
                        }
                    )
                }

            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(path, 'There was an error getting team info', err, null, null, logObj);
                return response;
            }
        )
    })



});

router.post('/user/join/response', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/request/user/join/response';

    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }, {
        name: 'addMember',
        type: 'string'
    }, {
        name: 'messageId',
        type: 'string'
    }, {
        name: 'approval',
        type: 'boolean'
    }]

    const start = Date.now();
    console.log(`${path} starting..`);
    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        var payloadTeamName = requiredParameters.teamName.value;
        var payloadMemberToAdd = requiredParameters.addMember.value;
        var messageId = requiredParameters.messageId.value;
        var approval = requiredParameters.approval.value;
        payloadTeamName = payloadTeamName.toLowerCase();

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' accept team join request ';
        logObj.target = payloadTeamName + ' ' + payloadMemberToAdd;
        logObj.logLevel = 'STD';

        //if the approval was true IE accepted, 
        //join this user into the pending members, 
        //set their pending member, 
        //and send them a confirmation
        //delete any outstanding messages from the user
        console.log(`${path} beginning work.. ${start - Date.now()} ms`);
        if (approval) {
            //grab the team
            return Team.findOne({
                teamName_lower: payloadTeamName
            }).then((foundTeam) => {
                if (foundTeam) {
                    var cont = true;
                    let pendingMembers = utils.returnByPath(foundTeam, 'pendingMembers')
                    if (pendingMembers && cont) {
                        pendingMembers.forEach(function(member) {
                            if (member.displayName == payloadMemberToAdd) {
                                console.log(`${path} finishing work A.. ${start - Date.now()} ms`);
                                cont = false;
                                logObj.error = 'User was all ready pending team member';
                                response.status = 403;
                                response.message = utils.returnMessaging(path, "User " + payloadMemberToAdd + " exists in pending members currently", false, null, null, logObj);
                                return response;
                            }
                        });
                    }
                    let currentMembers = utils.returnByPath(foundTeam, 'teamMembers');
                    if (currentMembers && cont) { //current members
                        currentMembers.forEach(function(member) {
                            if (member.displayName == payloadMemberToAdd) {
                                console.log(`${path} finishing work B.. ${start - Date.now()} ms`);
                                cont = false;
                                logObj.error = 'User was all ready team member';
                                response.status = 403;
                                response.message = utils.returnMessaging(path, "User " + payloadMemberToAdd + " exists in members currently", false, null, null, logObj);
                                return response;
                            }
                        });
                    }
                    if (cont) {
                        return User.findOne({
                            displayName: payloadMemberToAdd
                        }).then((foundUser) => {
                            if (foundUser) {
                                //double check that the user has not been added to another team in the mean time
                                if (foundUser.pendingTeam || !utils.isNullorUndefined(foundUser.teamName) || !utils.isNullorUndefined(foundUser.teamId)) {
                                    console.log(`${path} finishing work C.. ${start - Date.now()} ms`);
                                    logObj.logLevel = "ERROR";
                                    logObj.error = 'User was all ready on a team or pending team'
                                    response.status = 400;
                                    response.message = utils.returnMessaging(path, "User was all ready on a team or pending team", false, foundUser, null, logObj);
                                    return response;
                                } else {
                                    if (!utils.returnBoolByPath(foundTeam.toObject(), 'pendingMembers')) {
                                        foundTeam.pendingMembers = [];
                                    }

                                    let fuid = foundUser._id.toString()
                                    foundTeam.pendingMembers.push({
                                        "id": fuid,
                                        "displayName": foundUser.displayName
                                    });

                                    //remove user from invited user as they are now pending member
                                    foundTeam.invitedUsers.splice(foundTeam.invitedUsers.indexOf(foundUser.displayName), 1);

                                    return foundTeam.save().then((saveOK) => {


                                        deleteOutstandingRequests(foundUser._id);
                                        UserSub.togglePendingTeam(foundUser.displayName);
                                        QueueSub.addToPendingTeamMemberQueue(utils.returnIdString(foundTeam._id), foundTeam.teamName_lower, utils.returnIdString(foundUser._id), foundUser.displayName);

                                        returnIdFromDisplayName(foundTeam.captain).then(
                                            cptId => {
                                                let msg = {};
                                                msg.sender = foundUser._id;
                                                msg.recipient = cptId;
                                                msg.subject = 'Team invite response';
                                                msg.content = req.user.displayName + ' accepted your request to join the team!  The request has been added to the approval queue for the admins.';
                                                msg.notSeen = true;
                                                msg.timeStamp = new Date().getTime();

                                                messageSub(msg);

                                            },
                                            err => {

                                            }
                                        );
                                        Message.findByIdAndDelete(messageId);
                                        console.log(`${path} finishing work D.. ${start - Date.now()} ms`);
                                        response.status = 200;
                                        response.message = utils.returnMessaging(path, "Team invite accepted!", false, saveOK, null, logObj)
                                        return response;
                                    }, (teamSaveErr) => {
                                        console.log(`${path} finishing work E.. ${start - Date.now()} ms`);
                                        logObj.logLevel = 'ERROR';
                                        response.status = 500;
                                        response.message = utils.returnMessaging(path, "error adding user to team", teamSaveErr, null, null, logObj);
                                        return response;
                                    });
                                }

                            }
                        }, (err) => {
                            console.log(`${path} finishing work F.. ${start - Date.now()} ms`);
                            response.status = 500;
                            response.message = utils.returnMessaging(path, "error finding user", err, null, null, logObj);
                            return response;
                        })
                    }

                } else {
                    console.log(`${path} finishing work G.. ${start - Date.now()} ms`);
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'team was not found';
                    response.status = 500;
                    response.message = utils.returnMessaging(path, "team was not found!", false, null, null, logObj);
                    return response;
                }
            });
        } else {
            Team.findOne({
                teamName_lower: payloadTeamName
            }).then(
                team => {
                    if (team) {
                        if (team.invitedUsers) {
                            team.invitedUsers.splice(team.invitedUsers.indexOf(payloadMemberToAdd), 1);
                        }
                        team.markModified('invitedUsers')
                        team.save().then();
                    }
                },
                err => {
                    utils.errLogger(path, err);
                }
            )
            return Message.findByIdAndDelete(messageId).then(
                msgDel => {
                    console.log(`${path} finishing work H.. ${start - Date.now()} ms`);
                    logObj.action = 'Invite declined by player';
                    response.status = 200;
                    response.message = utils.returnMessaging(path, "Team invite declined!", false, msgDel, null, logObj)
                    return response;
                },
                err => {
                    console.log(`${path} finishing work I.. ${start - Date.now()} ms`);
                    response.status = 500;
                    response.message = utils.returnMessaging(path, "Error deleting message", err, null, null, logObj)
                    return response;
                }
            )

        }

    })



});

module.exports = router;

function deleteOutstandingRequests(user) {
    Message.find({ sender: user }).then(
        found => {
            found.forEach(msg => {
                Message.findByIdAndDelete(msg._id).exec();
            });
        },
        err => {
            utils.errLogger('request-routes', err, 'deleteOutstandingRequests');
        }
    )
}