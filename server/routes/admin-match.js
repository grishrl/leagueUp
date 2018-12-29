const util = require('../utils');
const router = require('express').Router();
// const User = require("../models/user-models");
// const Team = require("../models/team-models");
// const Admin = require("../models/admin-models");
// const teamSub = require('../subroutines/team-subs');
// const DivSub = require('../subroutines/division-subs');
// const OutreachSub = require('../subroutines/outreach-subs');
// const QueueSub = require('../subroutines/queue-subs');
// const UserSub = require('../subroutines/user-subs');
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const Match = require('../models/match-model');

router.post('/match/update', passport.authenticate('jwt', {
    session: false
}), levelRestrict.matchLevel, (req, res) => {
    const path = 'admin/match/update'
    if (req.body.match) {
        let match = req.body.match;
        Match.findOne({ matchId: match.matchId }).then(
            (found) => {
                if (found) {
                    // found = match;
                    let keys = Object.keys(match);
                    keys.forEach(key => {
                        found[key] = match[key];
                    });
                    found.save().then(
                        (saved) => {
                            res.status(200).send(util.returnMessaging(path, 'Match Saved', false, saved));
                        },
                        (err) => {
                            res.status(500).send(util.returnMessaging(path, 'Error saving match', err));
                        }
                    )
                } else {
                    res.status(400).send(util.returnMessaging(path, 'Proper info not sent', false));
                }
            },
            (err) => {
                res.status(500).send(util.returnMessaging(path, 'Error getting match', err));
            }
        )

    } else {
        res.status(400).send(util.returnMessaging(path, 'Proper info not sent', false));
    }
})

module.exports = router;