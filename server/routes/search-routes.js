const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Team = require('../models/team-models');
const passport = require("passport");

router.post('/user', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user';
    let payload = req.body.userName;
    let regEx = new RegExp(payload, "i");
    User.find({ displayName: regEx }).exec().then((foundUsers) => {
        if (foundUsers && foundUsers.length > 0) {
            let ret = [];
            foundUsers.forEach(function(user) {
                ret.push(user.displayName);
            })
            res.status(200).send(util.returnMessaging(path, "Found Users", false, ret));
        } else {
            res.status(200).send(util.returnMessaging(path, "Found Users", false, foundUsers));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "Error finding users", err));
    })
});

router.post('/user/unteamed', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/unteamed';
    let payload = req.body.userName;
    let regEx = new RegExp(payload, "i");
    User.find({
        $and: [{
                displayName: regEx
            },
            {
                $or: [
                    { teamName: null },
                    { teamName: undefined },
                    { teamId: null },
                    { teamId: undefined }
                ]
            },
            {
                $or: [
                    { pendingTeam: null },
                    { pendingTeam: false }
                ]
            }

        ]
    }).exec().then((foundUsers) => {
        if (foundUsers && foundUsers.length > 0) {
            let ret = [];
            foundUsers.forEach(function(user) {
                ret.push(user.displayName);
            })
            res.status(200).send(util.returnMessaging(path, "Found Users", false, ret));
        } else {
            res.status(200).send(util.returnMessaging(path, "Found Users", false, foundUsers));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "Error finding users", err));
    })
});


router.post('/team', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/team';
    let payload = req.body.teamName.toLowerCase();
    let regEx = new RegExp(payload, "i");
    Team.find({
        teamName_lower: regEx
    }).exec().then((foundTeams) => {
        if (foundTeams && foundTeams.length > 0) {
            let ret = [];
            foundTeams.forEach(function(team) {
                ret.push(team.teamName);
            })
            res.status(200).send(util.returnMessaging(path, "Found Teams", false, ret));
        } else {
            res.status(200).send(util.returnMessaging(path, "Found Teams", false, foundTeams));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
    });
});

/*
user query
{
    $and:{
        {
            $or:[
                {
                    "teamId":null
                },{
                    "teamId":{$exists:false}
                }
            ]
        },
        {
            $or: [{
                "teamName": null
            }, {
                "teamName": {
                    $exists: false
                }
            }]
        },
        {
            $or: [
                {
                    "pendingTeam": null
                }, 
                {
                    "pendingTeam": {
                        $exists: false
                    }
                },
                {
                "pendingTeam":false
                }
            ]
        },
        {
            "lookingForGroup":true
        },
        {
            $or:[
                {
                    "hlRankMetal":metal
                },
                {
                    "hlRankMetal": metal
                }
            ]
        },
        {
            $or: [{
                    "hlRankDivision": {$gte:num}
                },
                {
                    "hlRankDivision": metal
                }
            ]
        },
        {
            "competitiveLevel":level
        },
        {
            $or: [{
                    "rolesNeeded.tank": true
                },
                {
                    "rolesNeeded.meleeassassin": true
                },
                {
                    "rolesNeeded.rangedassassin": true
                },
                {
                    "rolesNeeded.support": true
                },
                {
                    "rolesNeeded.offlane": true
                },
                {
                    "rolesNeeded.flex: true"
                }
            ]

        },
        {
            $or:[
                {
                    "averageMmr":{$gte:lowerNum}
                },
                {
                    "averageMmr":{$lte:upperNum}
                }
            ]
        },
        {
            "timeZone":timezone
        }

    }
}
*/

router.post('/user/market', (req, res) => {
    const path = '/search/user/market';

    let payload = req.body;

    User.find(payload).then(
        (found) => {
            res.status(200).send(util.returnMessaging(path, "Found these users", null, found));
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error finding users", err));
        }
    );

});


/*

        "tank": true,
        "meleeassassin": true,
        "rangedassassin": true,
        "support": false,
        "offlane": false,
        "flex": true

team query
{
    $and: [
        {
            $or: [{
                    "divisionConcat": "divisionName"
                },
                {
                    "divisionConcat": "divisionName"
                }
            ]

        },
        {
            $and:[
                {
                    teamMMRAvg:{
                        $gte:LowerNumber
                    }
                },
                {
                    teamMMRAvg: {
                        $lte: UpperNumber
                    }
                }
            ]
        },
        {
            "lookingForMore":true
        },
        {
            "competitiveLevel":0,2,3
        },
        {
            $or:[
                {
                    "rolesNeeded.tank":true
                },
                {
                    "rolesNeeded.meleeassassin": true
                },
                {
                    "rolesNeeded.rangedassassin": true
                },
                {
                    "rolesNeeded.support": true
                }, 
                {
                    "rolesNeeded.offlane": true
                }, 
                {
                    "rolesNeeded.flex: true"
                }
            ]

        },
        {
            "availability.monday.startTimeNumber": {
                $gte: 2000
            }
        }, 
        {
            "availability.monday.endTimeNumber": {
                $lte: 2400
            }
        },
        {
            "timeZone": "-6"
        }
    ]
}
*/
router.post('/team/market', (req, res) => {
    const path = '/search/team/market';

    let payload = req.body;

    User.find(payload).then(
        (found) => {
            res.status(200).send(util.returnMessaging(path, "Found these users", null, found));
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error finding users", err));
        }
    );

});

module.exports = router;