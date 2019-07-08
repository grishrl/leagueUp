const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const TeamSub = require('../subroutines/team-subs');
const System = require('../models/system-models').system;
const passport = require("passport");
const mmrMethods = require('../methods/mmrMethods');
const Stats = require('../models/stats-model');
const Avatar = require('../methods/avatarUpload');
const PendingAvatarQueue = require('../models/admin-models').PendingAvatarQueue;
const archiveUser = require('../methods/archivalMethods').archiveUser;
const Schedule = require('../models/schedule-models');
const axios = require('axios');

router.get('/seasons', (req, res) => {

    const path = '/history/seasons';
    let query = {
        type: { $exists: false }
    }
    Schedule.find(query).then(
        found => {
            res.status(200).send(util.returnMessaging(path, 'Found seasons:', false, found));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error finding seasons:', err));
        }
    );
});

module.exports = router;