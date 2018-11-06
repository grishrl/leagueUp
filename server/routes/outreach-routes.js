const nodemailer = require('nodemailer');
const Outreach = require('../models/outreach-model');
const Team = require('../models/team-models');
const router = require('express').Router();
const keys = require('../configs/keys');
const passport = require("passport");
const util = require('../utils');

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
        user: keys.mailer.user,
        pass: keys.mailer.pass
    }
});

router.post('/invite', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/outreach/invite';
    let stamp = Date.now();
    stamp = stamp.toString();
    stamp = stamp.slice(stamp.length / 2, stamp.length);
    stamp += req.user.displayName;

    var data = encrypt(stamp);


    var mailOptions = {
        from: keys.mailer.user,
        to: req.body.userEmail,
        subject: "A friend has invited you to join NGS!",
        text: "Hello \n Your friend " + req.user.displayName + " has invited you to join his team and us at the Nexus Gaming Series, amatuer Heroes of the Storm Leuage! \n" +
            "Please join us by clicking this link and creating an account! \n" + " https://localhost:3443/email/invite/" + data
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
            res.status(500).send(util.returnMessaging(path, 'We encountered an error, try again later or contact an admin.', err));
        } else {
            new Outreach({
                key: data,
                teamName: req.user.teamInfo.teamName
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
}), (req, res) => {
    const path = '/outreach/inviteResponseComplete'
    let refToken = req.body.referral;
    Outreach.findOneAndDelete({
        key: refToken
    }).then((deletedRef) => {
        if (!deletedRef) {
            res.status(404).send(util.returnMessaging(path, "Reference not found in ref table."));
        } else {
            console.log('del', deletedRef);
            let lower = deletedRef.teamName.toLowerCase();
            Team.findOne({
                teamName_lower: lower
            }).then((foundTeam) => {
                res.status(200).send(util.returnMessaging(path, "We added the user to pending members"));
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err));
            })
        }

    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "We encountered an error completing the email response", err));
    })

});

module.exports = router;