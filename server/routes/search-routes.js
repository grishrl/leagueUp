const util = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Team = require('../models/team-models');
const passport = require("passport");
const lodash = require('lodash');

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

router.post('/user/market', (req, res) => {
    const path = '/search/user/market';

    let payload = req.body.searchObj;
    let formedSearchObject = createUserSearchObject(payload, req.user);

    // res.status(200).send(util.returnMessaging(path, "formed search object", null, formedSearchObject))
    User.find(formedSearchObject).then(
        (found) => {
            res.status(200).send(util.returnMessaging(path, "Found these users", null, found));
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error finding users", err));
        }
    );

});



router.post('/team/market', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/team/market';

    let payload = req.body.searchObj;
    let formedSearchObject = createTeamSearchObject(payload, req.user);
    // res.status(200).send(util.returnMessaging(path, "Testing", null, formedSearchObject));
    Team.find(formedSearchObject).then(
        (found) => {
            res.status(200).send(util.returnMessaging(path, "Found these teams", null, found));
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
        }
    );

});


//get users total number this returns all unteamed users
router.get('/users/filtered/total', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/users/filtered/total';
    let teamName = req.user.teamName;
    let myFilterObj = userUnteamed();
    if (teamName) {
        teamName = teamName.toLowerCase();
        Team.findOne({
            teamName_lower: teamName
        }).then(
            foundTeam => {
                if (foundTeam) {
                    if (foundTeam.invitedUsers.length > 0) {
                        myFilterObj.$and.push({
                            "displayName": {
                                $not: {
                                    $in: foundTeam.invitedUsers
                                }
                            }
                        })
                    }
                    queryUsersAndReturn();
                } else {
                    queryUsersAndReturn();
                }
            }, err => {
                res.status(500).send(util.returnMessaging(path, 'Error finding users', err));
            }
        )
    } else {
        queryUsersAndReturn();
    }

    function queryUsersAndReturn() {
        let userNum = User.countDocuments(myFilterObj);
        userNum.exec().then(
            ret => {
                res.status(200).send(util.returnMessaging(path, 'Found users', null, ret));
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Error finding users', err));
            }
        )
    }
});

//paginate users
router.post('/user/filtered/paginate', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/filtered/paginate';
    let page = req.body.page;
    let perPage = 10;
    let teamName = req.user.teamName;
    //userUnteamedFilterInvited
    let myFilterObj = userUnteamed();

    if (teamName) {
        teamName = teamName.toLowerCase();
        Team.findOne({
            teamName_lower: teamName
        }).then(
            foundTeam => {
                if (foundTeam) {
                    if (foundTeam.invitedUsers.length > 0) {
                        myFilterObj.$and.push({
                            "displayName": {
                                $not: {
                                    $in: foundTeam.invitedUsers
                                }
                            }
                        });
                    }
                    performQueryAndReturn();
                } else {
                    performQueryAndReturn
                }
            }, err => {
                performQueryAndReturn();
            }
        );
    } else {
        performQueryAndReturn()
    }

    function performQueryAndReturn() {
        let query = User.find(myFilterObj).skip(page * perPage).limit(perPage);
        query.exec().then(
            found => {
                res.status(200).send(util.returnMessaging(path, "Fetched next page.", null, found));
            }, err => {
                res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
            });
    }
});

//get users total number this returns all unteamed users
router.get('/users/all/total', (req, res) => {
    const path = '/search/users/total';
    console.log('xd');
    let userNum = User.estimatedDocumentCount(userUnteamed());
    console.log(userNum);
    userNum.exec().then(
        ret => {
            res.status(200).send(util.returnMessaging(path, 'Found users', null, ret))

        }, err => {
            res.status(500).send(util.returnMessaging(path, "Error finding users", err));
        }
    );
});

//paginate users
router.post('/user/paginate', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/paginate';
    let page = req.body.page;
    let perPage = 10;
    let query = User.find(userUnteamed()).skip(page * perPage).limit(perPage);
    query.exec().then(
        found => {
            res.status(200).send(util.returnMessaging(path, "Fetched next page.", null, found));

        }, err => {
            res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
        }
    )
});

//get teams total number
router.get('/teams/total', (req, res) => {
    const path = '/search/teams/total';
    let teamNum = Team.countDocuments(teamQueryObject());
    teamNum.exec().then(
        ret => {
            res.status(200).send(util.returnMessaging(path, 'Teams count', null, ret));
        }, err => {
            res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
        }
    )

});

teamQueryObject = function() {
    return {
        $and: [{
                lookingForMore: true
            },
            {
                teamName: /^((?!inactive).)*$/gmi
            },
            {
                teamName: /^((?!withdrawn).)*$/gmi
            }
        ]
    }
}

//paginate teams
router.post('/team/paginate', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/team/paginate';
    let page = req.body.page;
    let perPage = 10;
    const queryObj = teamQueryObject();
    let query = Team.find(queryObj).skip(page * perPage).limit(perPage);
    query.exec().then(
        found => {
            res.status(200).send(util.returnMessaging(path, "Fetched next page.", null, found));
        }, err => {
            res.status(500).send(util.returnMessaging(path, "Error finding teams", err));
        }
    )
});

module.exports = router;

async function filterInvitedUsers(req, ret) {
    let teamName = req.user.teamName ? req.user.teamName.toLowerCase() : null;
    if (teamName) {
        let findTeam = await Team.find({
            teamName_lower: teamName
        }).then(team => {
            if (team) {
                //filter invited users out
                ret = ret.filter(retUser => {
                    let flt = true;
                    team.invitedUsers.forEach(invitedUser => {
                        if (retUser.displayName == invitedUser) {
                            flt = false;
                        }
                    });
                });
                return ret;
            } else {
                //do nothing team not found
            }
        });
    } else {
        //do nothing team not found
    }
    return ret;
}

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

function createUserSearchObject(obj, reqUser) {
    let returnObj = {
        $and: [{
                $or: [{
                        "teamId": null
                    },
                    {
                        "teamId": {
                            $exists: false
                        }
                    },
                ]
            },
            {
                $or: [{
                        "teamName": null
                    },
                    {
                        "teamName": {
                            $exists: false
                        }
                    }
                ]
            },
            {
                $or: [{
                        "pendingTeam": null
                    },
                    {
                        "pendingTeam": {
                            $exists: false
                        }
                    },
                    {
                        "pendingTeam": false
                    }
                ]
            },
            {
                lookingForGroup: true
            }
        ]
    }
    let keys = Object.keys(obj);
    if (keys.length > 0) {

        //staticly set that the user shall not be on another team and shall be lookingforgroup!

        // add divisions to the query object
        if (util.returnBoolByPath(obj, 'divisions')) {
            let divs = {
                $or: []
            };
            obj['divisions'].forEach(div => {
                divs['$or'].push({
                    hlRankMetal: div
                });
            })
            returnObj['$and'].push(divs);
        }


        // Add MMRs to the query object
        if (util.returnBoolByPath(obj, 'lowerMMR') || util.returnBoolByPath(obj, 'upperMMR')) {
            let mmr = {
                $and: []
            };
            let add = false;
            if (util.returnBoolByPath(obj, 'lowerMMR')) {
                mmr['$and'].push({
                    averageMmr: {
                        $gte: obj.lowerMMR
                    }
                });
                add = true;
            }
            if (util.returnBoolByPath(obj, 'upperMMR')) {
                mmr['$and'].push({
                    averageMmr: {
                        $lte: obj.upperMMR
                    }
                });
                add = true;
            }
            if (add) {
                returnObj['$and'].push(mmr);
            }
        }

        // add competitive level to the query object
        if (util.returnBoolByPath(obj, 'competitiveLevel')) {
            returnObj['$and'].push({
                competitiveLevel: obj.competitiveLevel
            });
        }

        //add roles to the query object
        if (util.returnBoolByPath(obj, 'rolesNeeded')) {
            let roles = {
                $or: []
            };
            lodash.forEach(obj.rolesNeeded, (value, key) => {
                let searchKey = 'role';
                searchKey = searchKey + '.' + key;
                let tO = {}
                tO[searchKey] = value;
                roles['$or'].push(tO);
            });
            // let keys = Object.keys(obj.rolesNeeded);
            // keys.forEach(key => {
            //     let searchKey = 'role';
            //     let value = obj.rolesNeeded[key];
            //     searchKey = searchKey + '.' + key;
            //     let tO = {}
            //     tO[searchKey] = value;
            //     roles['$or'].push(tO);
            // });
            returnObj['$and'].push(roles);
        }

        //add times available and timezone to the query object.
        if (util.returnBoolByPath(obj, 'timezone') || util.returnBoolByPath(obj, 'times')) {
            let user = {};

            user.availability = obj.times
            if (util.returnBoolByPath(obj, 'timezone')) {
                user.timeZone = obj.timezone;
            } else if (util.returnBoolByPath(reqUser, 'timeZone')) {
                user.timeZone = reqUser.timeZone;
            } else {
                user.timeZone = (-6);
            }

            if (util.returnBoolByPath(user, 'availability')) {
                let keys = Object.keys(user.availability);
                keys.forEach(key => {
                    let unit = user.availability[key];
                    if (unit.available) {
                        if (util.returnBoolByPath(unit, 'startTime')) {
                            let searchKey = 'availability.' + key + '.startTime';
                            let searchValue = '$gte: ' + zeroGMT(unit.startTime, user.timeZone);
                            let tO = {};
                            tO[searchKey] = searchValue;
                            returnObj['$and'].push(tO);
                        }
                        if (util.returnBoolByPath(unit, 'endTime')) {
                            let searchKey = 'availability.' + key + '.endTime';
                            let searchValue = '$lte: ' + zeroGMT(unit.endTime, user.timeZone);
                            let tO = {};
                            tO[searchKey] = searchValue;
                            returnObj['$and'].push(tO);
                        }
                    }
                });
            } else {
                //user had no profile times....
            }


            returnObj['$and'].push({
                'timeZone': user.timeZone
            });

        }


    }
    return returnObj;
}

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

function createTeamSearchObject(obj, reqUser) {
    let returnObj = teamQueryObject();
    let keys = Object.keys(obj);

    if (keys.length > 0) {

        // add divisions to the query object
        if (util.returnBoolByPath(obj, 'divisions')) {
            let divs = { $or: [] };
            obj['divisions'].forEach(div => {
                divs['$or'].push({
                    divisionConcat: div.value
                });
            })
            returnObj['$and'].push(divs);
        }


        // Add MMRs to the query object
        if (util.returnBoolByPath(obj, 'lowerMMR') || util.returnBoolByPath(obj, 'upperMMR')) {
            let mmr = { $and: [] };
            let add = false;
            if (util.returnBoolByPath(obj, 'lowerMMR')) {
                mmr['$and'].push({
                    teamMMRAvg: {
                        $gte: obj.lowerMMR
                    }
                });
                add = true;
            }
            if (util.returnBoolByPath(obj, 'upperMMR')) {
                mmr['$and'].push({
                    teamMMRAvg: {
                        $lte: obj.upperMMR
                    }
                });
                add = true;
            }
            if (add) {
                returnObj['$and'].push(mmr);
            }
        }

        // add competitive level to the query object
        if (util.returnBoolByPath(obj, 'competitiveLevel')) {
            returnObj['$and'].push({ competitiveLevel: obj.competitiveLevel });
        }

        //add roles to the query object
        if (util.returnBoolByPath(obj, 'rolesNeeded')) {
            let roles = { $or: [] };
            lodash.forEach(obj.rolesNeeded, (value, key) => {
                let searchKey = 'rolesNeeded';
                searchKey = searchKey + '.' + key;
                let tO = {}
                tO[searchKey] = value;
                roles['$or'].push(tO);
            });
            // let keys = Object.keys(obj.rolesNeeded);
            // keys.forEach(key => {
            //     let searchKey = 'rolesNeeded';
            //     let value = obj.rolesNeeded[key];
            //     searchKey = searchKey + '.' + key;
            //     let tO = {}
            //     tO[searchKey] = value;
            //     roles['$or'].push(tO);
            // });
            returnObj['$and'].push(roles);
        }

        //add times available and timezone to the query object.
        if (util.returnBoolByPath(obj, 'getProfileTime') || util.returnBoolByPath(obj, 'getProfileTimezone') || util.returnBoolByPath(obj, 'timezone') || util.returnBoolByPath(obj, 'times')) {
            let user = {};
            //user can use their saved profile
            if ((util.returnBoolByPath(obj, 'getProfileTime') && obj.getProfileTime) || (util.returnBoolByPath(obj, 'getProfileTimezone') && obj.getProfileTimezone)) {
                user = reqUser;
            } else { //or user can provide a seperate time to search
                user.availability = obj.times
                if (util.returnBoolByPath(obj, 'timezone')) {
                    user.timeZone = obj.timezone;
                } else {
                    user.timeZone = reqUser.timeZone;
                }
            }
            if (util.returnBoolByPath(user, 'availability')) {
                let keys = Object.keys(user.availability);
                keys.forEach(key => {
                    let unit = user.availability[key];
                    if (unit.available) {
                        if (util.returnBoolByPath(unit, 'startTime')) {
                            let searchKey = 'availability.' + key + '.startTime';
                            let searchValue = '$gte: ' + zeroGMT(unit.startTime, user.timeZone);
                            let tO = {};
                            tO[searchKey] = searchValue;
                            returnObj['$and'].push(tO);
                        }
                        if (util.returnBoolByPath(unit, 'endTime')) {
                            let searchKey = 'availability.' + key + '.endTime';
                            let searchValue = '$lte: ' + zeroGMT(unit.endTime, user.timeZone);
                            let tO = {};
                            tO[searchKey] = searchValue;
                            returnObj['$and'].push(tO);
                        }
                    }
                });
            } else {
                //user had no profile times....
            }


            returnObj['$and'].push({ 'timeZone': user.timeZone });

        }


    }
    return returnObj;
}


function convertToMil(time) {
    if (typeof time === 'string') {
        let colonSplit = time.split(':');
        return parseInt(colonSplit[0]) * 100 + parseInt(colonSplit[1]);
    } else {
        return null;
    }
}

function zeroGMT(time, timezone) {

    let localTime = time;
    if (typeof localTime === 'string') {
        localTime = convertToMil(localTime);
    }
    timezone = parseInt(timezone);
    let correct = localTime - (timezone * 100);

    return correct;
}

async function getUserProfile(id) {
    let user = await User.findById(id).then(
        res => { return res; },
        err => { return null; }
    )
    return user;
}

function userUnteamed() {
    return {
        $and: [{
                $or: [{
                        "teamId": null
                    },
                    {
                        "teamId": {
                            $exists: false
                        }
                    },
                ]
            },
            {
                $or: [{
                        "teamName": null
                    },
                    {
                        "teamName": {
                            $exists: false
                        }
                    }
                ]
            },
            {
                $or: [{
                        "pendingTeam": null
                    },
                    {
                        "pendingTeam": {
                            $exists: false
                        }
                    },
                    {
                        "pendingTeam": false
                    }
                ]
            },
            {
                "lookingForGroup": true
            }
        ]
    };
}