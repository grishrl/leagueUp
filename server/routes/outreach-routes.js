const nodemailer = require('nodemailer');
const Outreach = require('../models/outreach-model');
const Team = require('../models/team-models');
const router = require('express').Router();
const passport = require("passport");
const util = require('../utils');
const UserSubs = require('../subroutines/user-subs');
const QueueSub = require('../subroutines/queue-subs');
const User = require('../models/user-models');
const message = require('../subroutines/message-subs');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

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
        partialsDir: path.resolve(__dirname, "outreach-template"),
        defaultLayout: false // <-----   added this
    },
    viewPath: path.resolve(__dirname, "outreach-template"),
    extName: ".handlebars"
};

transporter.use('compile', hbs(hbsOptions));

router.post('/invite', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/outreach/invite';
    let stamp = Date.now();
    stamp = stamp.toString();
    stamp = stamp.slice(stamp.length / 2, stamp.length);
    stamp += req.user.displayName;

    var data = encrypt(stamp);

    let callback = process.env.outreachCallback;
    let userEmail = req.body.userEmail.split('@');
    userEmail = obfuscate(userEmail[0]);


    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'email invite';
    logObj.target = userEmail + "@protectedemail";
    logObj.logLevel = 'SYS';

    var mailOptions = {
        from: 'Nexus Gaming Series',
        to: req.body.userEmail,
        subject: "A friend has invited you to join NGS!",
        text: "Hello \n Your friend " + req.user.displayName + " has invited you to join his team and us at the Nexus Gaming Series, amatuer Heroes of the Storm Leuage! \n" +
            "Please join us by clicking this link and creating an account! \n " + callback + "/email/invite/" + data + "",
        template: 'invitation',
        context: {
            username: req.user.displayName,
            link: callback + "/email/invite/" + data
        }
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
            res.status(500).send(util.returnMessaging(path, 'We encountered an error, try again later or contact an admin.', err, null, null, logObj));
        } else {
            new Outreach({
                key: data,
                teamName: req.user.teamName
            }).save().then((saved) => {
                res.status(200).send(util.returnMessaging(path, 'This user has been successfully invited, let them to know to be looking for an email from NGS! Check the spam filter!', false, saved, null, logObj));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'We encountered an error, try again later or contact an admin.', err, null, null, logObj));
            })
        }
    })

});

router.post('/inviteResponseComplete', passport.authenticate('jwt', {
    session: false
}), util.appendResHeader, (req, res) => {
    const path = '/outreach/inviteResponseComplete'
    let refToken = req.body.referral;
    let user = req.body.user;

    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'email invite response';
    logObj.target = user;
    logObj.logLevel = 'STD';

    Outreach.findOneAndDelete({
        key: refToken
    }).then((deletedRef) => {
        if (!deletedRef) {
            logObj.logLevel = "ERROR";
            logObj.error = 'Reference not found in ref table.';
            res.status(404).send(util.returnMessaging(path, "Reference not found in ref table.", null, null, null, logObj));
        } else {
            User.findOne({ displayName: user }).then(
                foundUser => {
                    if (foundUser) {
                        let foundObj = foundUser.toObject();
                        if (!util.returnBoolByPath(foundObj, 'teamName') && !util.returnBoolByPath(foundObj, 'teamId')) {
                            let lower = deletedRef.teamName.toLowerCase();
                            Team.findOne({
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

                                QueueSub.addToPendingTeamMemberQueue(util.returnIdString(foundTeam._id), foundTeam.teamName_lower, util.returnIdString(foundUser._id), foundUser.displayName);
                                foundTeam.save().then(
                                    saved => {
                                        res.status(200).send(util.returnMessaging(path, "We added the user to pending members", false, null, null, logObj));
                                    },
                                    err => {
                                        res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err, null, null, logObj));
                                    }
                                )
                            }, (err) => {
                                res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err, null, null, logObj));
                            });
                        } else {
                            res.status(500).send(util.returnMessaging(path, "User was all ready a member of the team", null, null, null, logObj));
                            message(foundUser._id.toString(), 'Email Invite', 'Your email invite was processed properly but you were all ready on a team.', 'SYSTEM');
                        }



                    } else {
                        res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err, null, null, logObj));
                    }
                },
                err => {
                    res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err, null, null, logObj));
                }
            )
        }

    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err, null, null, logObj));
    })

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