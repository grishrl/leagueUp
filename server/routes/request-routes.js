const {
    confirmCaptain
} = require("./confirmCaptain");
const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Admin = require('../models/admin-models');
const QueueSub = require('../subroutines/queue-subs');
const TeamSub = require('../subroutines/team-subs');
const UserSub = require('../subroutines/user-subs');
const Team = require("../models/team-models");
const passport = require("passport");
const fs = require('fs');
const imageDataURI = require('image-data-uri');
const AWS = require('aws-sdk');
const sysModels = require('../models/system-models');
const logger = require('../subroutines/sys-logging-subs');
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

                            new Message(msg).save().then(
                                (newmsg) => {
                                    res.status(200).send(util.returnMessaging(path, 'Message sent', null, null, null, logObj))
                                }, (err) => {
                                    res.status(500).send(util.returnMessaging(path, 'There was an error sending request', err, null, null, logObj));
                                }
                            )

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
    // var messageId = 
    payloadTeamName = payloadTeamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' accept team join request ';
    logObj.target = payloadTeamName + ' ' + payloadMemberToAdd;
    logObj.logLevel = 'STD';

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

                            foundTeam.pendingMembers.push({
                                "displayName": foundUser.displayName
                            });

                            foundTeam.save().then((saveOK) => {

                                res.status(200).send(util.returnMessaging(path, "User added to pending members", false, saveOK, null, logObj));
                                deleteOutstandingRequests(foundUser._id);
                                UserSub.togglePendingTeam(foundUser.displayName);
                                QueueSub.addToPendingTeamMemberQueue(foundTeam.teamName_lower, foundUser.displayName);

                                let msg = {};
                                msg.sender = req.user._id;
                                msg.recipient = foundUser._id;
                                msg.subject = 'Team join request';
                                msg.content = req.user.displayName + ' accepted your request to join the team!  The request has been added to the approval queue for the admins.';
                                msg.notSeen = true;
                                msg.timeStamp = new Date().getTime();

                                new Message(msg).save().then(
                                    (newmsg) => {
                                        //log or nah?
                                    }, (err) => {
                                        //log or nah?
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
    //todo add logging
    Message.find({ sender: user }).then(
        found => {
            found.forEach(msg => {
                Message.findByIdAndDelete(msg._id).exec();
            });

        },
        err => {
            console.log(err);
        }
    )
}