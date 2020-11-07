const nodemailer = require('nodemailer');
const Outreach = require('../models/outreach-model');
const Team = require('../models/team-models');
const router = require('express').Router();
const passport = require("passport");
const utils = require('../utils');
const UserSubs = require('../subroutines/user-subs');
const QueueSub = require('../subroutines/queue-subs');
const User = require('../models/user-models');
const messageSub = require('../subroutines/message-subs');
const hbs = require('nodemailer-express-handlebars');
const _path = require('path');
const { commonResponseHandler } = require('./../commonResponseHandler');

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.outreachEmail, //update with env var
        pass: process.env.outreachPw //update with env var
    }
});

const hbsOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: _path.resolve(__dirname, "outreach-template"),
        defaultLayout: false // <-----   added this
    },
    viewPath: _path.resolve(__dirname, "outreach-template"),
    extName: ".handlebars"
};

transporter.use('compile', hbs(hbsOptions));

router.post('/invite', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = '/outreach/invite';

    const requiredParameters = [{
        name: 'userEmail',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let stamp = Date.now();
        stamp = stamp.toString();
        stamp = stamp.slice(stamp.length / 2, stamp.length);
        stamp += req.user.displayName;

        var data = encrypt(stamp);

        let callback = process.env.outreachCallback;
        let userEmail = requiredParameters.userEmail.value.split('@');
        userEmail = obfuscate(userEmail[0]);

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'email invite';
        logObj.target = userEmail + "@protectedemail";
        logObj.logLevel = 'SYS';

        var mailOptions = {
            from: 'Nexus Gaming Series',
            to: requiredParameters.userEmail.value,
            subject: "A friend has invited you to join NGS!",
            text: "Hello \n Your friend " + req.user.displayName + " has invited you to join his team and us at the Nexus Gaming Series, amatuer Heroes of the Storm Leuage! \n" +
                "Please join us by clicking this link and creating an account! \n " + callback + "/email/invite/" + data + "",
            template: 'invitation',
            context: {
                username: req.user.displayName,
                link: callback + "/email/invite/" + data
            }
        }

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function(err, info) {
                if (err) {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'We encountered an error, try again later or contact an admin.', err, null, null, logObj);
                    resolve(response);
                } else {
                    return new Outreach({
                        key: data,
                        teamName: req.user.teamName
                    }).save().then((saved) => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'This user has been successfully invited, let them to know to be looking for an email from NGS! Check the spam filter!', false, saved, null, logObj);
                        resolve(response);
                    }, (err) => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'We encountered an error, try again later or contact an admin.', err, null, null, logObj);
                        resolve(response);
                    })
                }
            });
        });
    })

});

router.post('/inviteResponseComplete', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = '/outreach/inviteResponseComplete'

    const requiredParameters = [{
        name: 'referral',
        type: 'string'
    }, {
        name: 'user',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let refToken = requiredParameters.referral.value;
        let user = requiredParameters.user.value;

        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'email invite response';
        logObj.target = user;
        logObj.logLevel = 'STD';

        return Outreach.findOneAndDelete({
            key: refToken
        }).then((deletedRef) => {
            if (!deletedRef) {
                logObj.logLevel = "ERROR";
                logObj.error = 'Reference not found in ref table.';
                response.status = 404;
                response.message = utils.returnMessaging(req.originalUrl, "Reference not found in ref table.", null, null, null, logObj);
                return response;
            } else {
                return User.findOne({
                    displayName: user
                }).then(
                    foundUser => {
                        if (foundUser) {
                            let foundObj = foundUser.toObject();
                            if (!utils.returnBoolByPath(foundObj, 'teamName') && !utils.returnBoolByPath(foundObj, 'teamId')) {
                                let lower = deletedRef.teamName.toLowerCase();
                                return Team.findOne({
                                    teamName_lower: lower
                                }).then((foundTeam) => {
                                    let fuid = foundUser._id.toString();
                                    let pendingObj = {
                                        "id": fuid,
                                        "displayName": foundUser.displayName
                                    }
                                    if (foundTeam.pendingMembers) {
                                        foundTeam.pendingMembers.push(pendingObj);
                                    } else {
                                        foundTeam.pendingMembers = [pendingObj];
                                    }
                                    UserSubs.togglePendingTeam(foundUser.displayName);

                                    QueueSub.addToPendingTeamMemberQueue(utils.returnIdString(foundTeam._id), foundTeam.teamName_lower, utils.returnIdString(foundUser._id), foundUser.displayName);
                                    return foundTeam.save().then(
                                        saved => {
                                            response.status = 200;
                                            response.message = utils.returnMessaging(req.originalUrl, "We added the user to pending members", false, null, null, logObj);
                                            return response;
                                        },
                                        err => {
                                            response.status = 500;
                                            response.message = utils.returnMessaging(req.originalUrl, "We encountered an error completing the email response", err, null, null, logObj);
                                            return response;
                                        }
                                    )
                                }, (err) => {
                                    response.status = 500;
                                    response.message = utils.returnMessaging(req.originalUrl, "We encountered an error completing the email response", err, null, null, logObj);
                                    return response;
                                });
                            } else {
                                messageSub(foundUser._id.toString(), 'Email Invite', 'Your email invite was processed properly but you were all ready on a team.', 'SYSTEM');
                                response.status = 500;
                                response.message = utils.returnMessaging(req.originalUrl, "User was all ready a member of the team", null, null, null, logObj);
                                return response;
                            }
                        } else {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, "We encountered an error completing the email response", err, null, null, logObj);
                            return response;
                        }
                    },
                    err => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, "We encountered an error completing the email response", err, null, null, logObj)
                        return response;
                    }
                )
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, "We encountered an error completing the email response", err, null, null, logObj);
            return response;
        })
    });

});

function obfuscate(str) {
    let ln = str.length;
    let halfLn = str.length / 2;
    str = str.substring(0, str.length / 2);

    for (var i = halfLn; i < ln; i++) {
        str += '*';
    }

    return str
}

module.exports = router;