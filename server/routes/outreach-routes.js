const nodemailer = require('nodemailer');
const Outreach = require('../models/outreach-model');
const Team = require('../models/team-models');
const router = require('express').Router();
const passport = require("passport");
const util = require('../utils');
const UserSubs = require('../subroutines/user-subs');
const QueueSub = require('../subroutines/queue-subs');

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

    var mailOptions = {
        from: 'Nexus Gaming Series',
        to: req.body.userEmail,
        subject: "A friend has invited you to join NGS!",
        text: "Hello \n Your friend " + req.user.displayName + " has invited you to join his team and us at the Nexus Gaming Series, amatuer Heroes of the Storm Leuage! \n" +
            "Please join us by clicking this link and creating an account! \n " + callback + "/email/invite/" + data + ""
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err); //replace with static logs?
            res.status(500).send(util.returnMessaging(path, 'We encountered an error, try again later or contact an admin.', err));
        } else {
            new Outreach({
                key: data,
                teamName: req.user.teamName
            }).save().then((saved) => {
                res.status(200).send(util.returnMessaging(path, 'This user has been successfully invited, let them to know to be looking for an email from NGS!', false, saved));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, 'We encountered an error, try again later or contact an admin.', err));
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
    Outreach.findOneAndDelete({
        key: refToken
    }).then((deletedRef) => {
        if (!deletedRef) {
            res.status(404).send(util.returnMessaging(path, "Reference not found in ref table."));
        } else {
            console.log('del', deletedRef); //replace with static log?
            let lower = deletedRef.teamName.toLowerCase();
            Team.findOne({
                teamName_lower: lower
            }).then((foundTeam) => {
                if (foundTeam.pendingMembers) {
                    foundTeam.pendingMembers.push({
                        "displayName": user
                    });
                } else {
                    foundTeam.pendingMembers = [{ "displayName": user }];
                }
                UserSubs.togglePendingTeam(user);
                QueueSub.addToPendingTeamMemberQueue(foundTeam.teamName_lower, user);
                console.log(foundTeam);
                foundTeam.save().then(
                    saved => {
                        res.status(200).send(util.returnMessaging(path, "We added the user to pending members"));
                    },
                    err => {
                        res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err));
                    }
                )
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err));
            })
        }

    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err));
    })

});

module.exports = router;