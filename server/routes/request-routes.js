const {
    confirmCaptain
} = require("../methods/confirmCaptain");
const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const QueueSub = require('../subroutines/queue-subs');
const UserSub = require('../subroutines/user-subs');
const Team = require("../models/team-models");
const passport = require("passport");
const logger = require('../subroutines/sys-logging-subs').logger;
const messageSub = require('../subroutines/message-subs');
const Message = require('../models/message-models');


router.post('/team/join', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/request/team/join';
    let payloadyTeamName = req.body.teamName;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' request team join ';
    logObj.target = payloadyTeamName;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    payloadyTeamName = payloadyTeamName.toLowerCase();

    Team.findOne({
        teamName_lower: payloadyTeamName
    }).then(
        found => {
            if (found) {

                getCptId(found.captain).then(
                    foundCaptain => {
                        if (foundCaptain) {
                            let msg = {};
                            msg.sender = req.user._id;
                            msg.recipient = foundCaptain._id;
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
                            res.status(200).send(util.returnMessaging(path, 'Message sent', null, null, null, logObj));

                            // new Message(msg).save().then(
                            //     (newmsg) => {
                            //         dispatchMessage(msg.recipient)

                            //     }, (err) => {
                            //         res.status(500).send(util.returnMessaging(path, 'There was an error sending request', err, null, null, logObj));
                            //     }
                            // )

                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'captain info was not found'
                            res.status(400).send(util.returnMessaging(path, 'There was an error getting cpt info', null, null, null, logObj));
                        }
                    },
                    err => {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'captain info was not found'
                        res.status(500).send(util.returnMessaging(path, 'There was an error getting team info', err, null, null, logObj));
                    }
                )

            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Team was not found'
                res.status(400).send(util.returnMessaging(path, 'There was an error finding the team', null, null, null, logObj));
            }
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'There was an error finding the team', err, null, null, logObj));
        }
    )

});

router.post('/team/join/response', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    let path = '/request/team/join/response';

    var payloadTeamName = req.body.teamName;
    var payloadMemberToAdd = req.body.addMember;
    var messageId = req.body.messageId;
    var approval = req.body.approval;
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
        Team.findOne({
            teamName_lower: payloadTeamName
        }).then((foundTeam) => {
            if (foundTeam) {
                var cont = true;
                let pendingMembers = util.returnByPath(foundTeam, 'pendingMembers')
                if (pendingMembers && cont) {
                    pendingMembers.forEach(function(member) {
                        if (member.displayName == payloadMemberToAdd) {
                            cont = false;
                            logObj.error = 'User was all ready pending team member';
                            res.status(403).send(
                                util.returnMessaging(path, "User " + payloadMemberToAdd + " exists in pending members currently", false, null, null, logObj)
                            );
                        }
                    });
                }
                let currentMembers = util.returnByPath(foundTeam, 'teamMembers');
                if (currentMembers && cont) { //current members
                    currentMembers.forEach(function(member) {
                        if (member.displayName == payloadMemberToAdd) {
                            cont = false;
                            logObj.error = 'User was all ready team member';
                            res.status(403).send(
                                util.returnMessaging(path, "User " + payloadMemberToAdd + " exists in members currently", false, null, null, logObj)
                            );
                        }
                    });
                }
                if (cont) {
                    User.findOne({
                        displayName: payloadMemberToAdd
                    }).then((foundUser) => {
                        if (foundUser) {
                            //double check that the user has not been added to another team in the mean time
                            if (foundUser.pendingTeam || !util.isNullorUndefined(foundUser.teamName) || !util.isNullorUndefined(foundUser.teamId)) {
                                logObj.logLevel = "ERROR";
                                logObj.error = 'User was all ready on a team or pending team'
                                res.status(400).send(util.returnMessaging(path, "User was all ready on a team or pending team", false, foundUser, null, logObj))
                            } else {
                                if (!util.returnBoolByPath(foundTeam.toObject(), 'pendingMembers')) {
                                    foundTeam.pendingMembers = [];
                                }
                                let fuid = foundUser._id.toString();
                                foundTeam.pendingMembers.push({
                                    "id": fuid,
                                    "displayName": foundUser.displayName
                                });

                                foundTeam.save().then((saveOK) => {

                                    res.status(200).send(util.returnMessaging(path, "User added to pending members", false, saveOK, null, logObj));
                                    deleteOutstandingRequests(foundUser._id);
                                    UserSub.togglePendingTeam(foundUser.displayName);
                                    QueueSub.addToPendingTeamMemberQueue(util.returnIdString(foundTeam._id), foundTeam.teamName_lower, util.returnIdString(foundUser._id), foundUser.displayName);

                                    let msg = {};
                                    msg.sender = req.user._id;
                                    msg.recipient = foundUser._id;
                                    msg.subject = 'Team join request';
                                    msg.content = req.user.displayName + ' accepted your request to join the team!  The request has been added to the approval queue for the admins.';
                                    msg.notSeen = true;
                                    msg.timeStamp = new Date().getTime();

                                    messageSub(msg);
                                    // new Message(msg).save().then(
                                    //     (newmsg) => {
                                    //         dispatchMessage(msg.recipient)
                                    //             //log or nah?
                                    //     }, (err) => {
                                    //         //log or nah?
                                    //     }
                                    // )

                                }, (teamSaveErr) => {
                                    logObj.logLevel = 'ERROR';
                                    res.status(500).send(
                                        util.returnMessaging(path, "error adding user to team", teamSaveErr, null, null, logObj)
                                    );
                                });
                            }

                        }
                    }, (err) => {
                        res.status(500).send(
                            util.returnMessaging(path, "error finding user", err, null, null, logObj)
                        );
                    })
                }

            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'team was not found'
                res.status(500).send(
                    util.returnMessaging(path, "team was not found!", false, null, null, logObj)
                );
            }
        });
    } else {

        Message.findByIdAndDelete(messageId).then(
            msgDel => {
                logObj.action = 'Team request denied by cpt';
                res.status(200).send(util.returnMessaging(path, "Team request denied by cpt", false, msgDel, null, logObj));
            },
            err => {
                res.status(500).send(
                    util.returnMessaging(path, "Error deleting message", err, null, null, logObj)
                );
            }
        )


    }

});

router.post('/user/join', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/request/user/join';
    let payloadyTeamName = req.body.teamName;
    let payloadUserName = req.body.userName;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' invite user to join team ' + payloadyTeamName;
    logObj.target = payloadUserName;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    let teamName_lower = payloadyTeamName.toLowerCase();

    //do some spot checking on the team to make sure it has not exceeded the maximum team members
    Team.findOne({ teamName_lower: teamName_lower }).then(
        foundTeam => {
            let teamObj = util.objectify(foundTeam);
            let memberCount = 0;
            if (util.returnBoolByPath(teamObj, 'pendingMembers')) {
                memberCount += teamObj.pendingMembers.length;
            }
            if (memberCount >= 9) {
                logObj.logLevel = "ERROR";
                logObj.error = 'Too many members on team to invite members';
                res.status(400).send(util.returnMessaging(path, 'This team has too many members', null, null, null, logObj))
            } else {
                User.findOne({
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
                            res.status(200).send(util.returnMessaging(path, 'Invite sent, this user must accept the invite!', null, null, null, logObj));
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

                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'User was not found'
                            res.status(400).send(util.returnMessaging(path, 'There was an error finding the user info', null, null, null, logObj));
                        }
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, 'There was an error finding the user', err, null, null, logObj));
                    }
                )
            }

        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'There was an error getting team info', err, null, null, logObj));
        }
    )

});

router.post('/user/join/response', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/request/user/join/response';

    var payloadTeamName = req.body.teamName;
    var payloadMemberToAdd = req.body.addMember;
    var messageId = req.body.messageId;
    var approval = req.body.approval;
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
        Team.findOne({
            teamName_lower: payloadTeamName
        }).then((foundTeam) => {
            if (foundTeam) {
                var cont = true;
                let pendingMembers = util.returnByPath(foundTeam, 'pendingMembers')
                if (pendingMembers && cont) {
                    pendingMembers.forEach(function(member) {
                        if (member.displayName == payloadMemberToAdd) {
                            cont = false;
                            logObj.error = 'User was all ready pending team member';
                            res.status(403).send(
                                util.returnMessaging(path, "User " + payloadMemberToAdd + " exists in pending members currently", false, null, null, logObj)
                            );
                        }
                    });
                }
                let currentMembers = util.returnByPath(foundTeam, 'teamMembers');
                if (currentMembers && cont) { //current members
                    currentMembers.forEach(function(member) {
                        if (member.displayName == payloadMemberToAdd) {
                            cont = false;
                            logObj.error = 'User was all ready team member';
                            res.status(403).send(
                                util.returnMessaging(path, "User " + payloadMemberToAdd + " exists in members currently", false, null, null, logObj)
                            );
                        }
                    });
                }
                if (cont) {
                    User.findOne({
                        displayName: payloadMemberToAdd
                    }).then((foundUser) => {
                        if (foundUser) {
                            //double check that the user has not been added to another team in the mean time
                            if (foundUser.pendingTeam || !util.isNullorUndefined(foundUser.teamName) || !util.isNullorUndefined(foundUser.teamId)) {
                                logObj.logLevel = "ERROR";
                                logObj.error = 'User was all ready on a team or pending team'
                                res.status(400).send(util.returnMessaging(path, "User was all ready on a team or pending team", false, foundUser, null, logObj))
                            } else {
                                if (!util.returnBoolByPath(foundTeam.toObject(), 'pendingMembers')) {
                                    foundTeam.pendingMembers = [];
                                }

                                let fuid = foundUser._id.toString()
                                foundTeam.pendingMembers.push({
                                    "id": fuid,
                                    "displayName": foundUser.displayName
                                });

                                //remove user from invited user as they are now pending member
                                foundTeam.invitedUsers.splice(foundTeam.invitedUsers.indexOf(foundUser.displayName), 1);

                                foundTeam.save().then((saveOK) => {

                                    res.status(200).send(util.returnMessaging(path, "Team invite accepted!", false, saveOK, null, logObj));
                                    deleteOutstandingRequests(foundUser._id);
                                    UserSub.togglePendingTeam(foundUser.displayName);
                                    QueueSub.addToPendingTeamMemberQueue(util.returnIdString(foundTeam._id), foundTeam.teamName_lower, util.returnIdString(foundUser._id), foundUser.displayName);

                                    getCptId(foundTeam.captain).then(
                                        cpt => {
                                            let msg = {};
                                            msg.sender = foundUser._id;
                                            msg.recipient = cpt._id;
                                            msg.subject = 'Team invite response';
                                            msg.content = req.user.displayName + ' accepted your request to join the team!  The request has been added to the approval queue for the admins.';
                                            msg.notSeen = true;
                                            msg.timeStamp = new Date().getTime();

                                            messageSub(msg);
                                            // new Message(msg).save().then(
                                            //     (newmsg) => {
                                            //         dispatchMessage(msg.recipient);
                                            //         //log or nah?
                                            //     }, (err) => {
                                            //         //log or nah?
                                            //     }
                                            // )
                                        },
                                        err => {

                                        }
                                    );
                                    Message.findByIdAndDelete(messageId).then(
                                        msgDel => {

                                        },
                                        err => {

                                        }
                                    )


                                }, (teamSaveErr) => {
                                    logObj.logLevel = 'ERROR';
                                    res.status(500).send(
                                        util.returnMessaging(path, "error adding user to team", teamSaveErr, null, null, logObj)
                                    );
                                });
                            }

                        }
                    }, (err) => {
                        res.status(500).send(
                            util.returnMessaging(path, "error finding user", err, null, null, logObj)
                        );
                    })
                }

            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'team was not found'
                res.status(500).send(
                    util.returnMessaging(path, "team was not found!", false, null, null, logObj)
                );
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
                util.errLogger(path, err);
            }
        )
        Message.findByIdAndDelete(messageId).then(
            msgDel => {
                logObj.action = 'Invite declined by player';
                res.status(200).send(util.returnMessaging(path, "Team invite declined!", false, msgDel, null, logObj));
            },
            err => {
                res.status(500).send(
                    util.returnMessaging(path, "Error deleting message", err, null, null, logObj)
                );
            }
        )


    }

});

module.exports = router;

async function getCptId(cptName) {
    let cptID = await User.findOne({ displayName: cptName }).then(
        res => { return res; },
        err => { return err; }
    );
    return cptID;
}

function deleteOutstandingRequests(user) {
    Message.find({ sender: user }).then(
        found => {
            found.forEach(msg => {
                Message.findByIdAndDelete(msg._id).exec();
            });
        },
        err => {
            util.errLogger('request-routes', err, 'deleteOutstandingRequests');
        }
    )
}