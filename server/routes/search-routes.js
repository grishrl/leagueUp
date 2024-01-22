const utils = require('../utils');
const router = require('express').Router();
const User = require('../models/user-models');
const Team = require('../models/team-models');
const passport = require("passport");
const lodash = require('lodash');
const milTime = require('../methods/timeMethods');
const {
    commonResponseHandler
} = require('./../commonResponseHandler');

router.post('/user', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user';

    const requiredParameters = [{
        name: 'userName',
        type: 'string'
    }];

    const optionalParameters = [{
        name: 'fullProfile',
        type: 'boolean'
    }];

    commonResponseHandler(req, res, requiredParameters, optionalParameters, async(req, res, requiredParameters, optionalParameters) => {
        const response = {};
        let payload = requiredParameters.userName.value;
        let regEx = new RegExp(payload, "i");
        return User.find({
            displayName: regEx
        }).exec().then((foundUsers) => {
            if (foundUsers && foundUsers.length > 0) {
                let ret = [];

                if (optionalParameters.fullProfile.valid && optionalParameters.fullProfile.value) {
                    foundUsers.forEach(function(user) {
                        ret.push(user);
                    })
                } else {
                    foundUsers.forEach(function(user) {
                        ret.push(user.displayName);
                    })
                }

                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found Users", false, ret)
                return response;
            } else {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found Users", false, foundUsers)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, "Error finding users", err)
            return response;
        })
    })

});

router.post('/user/unteamed', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/unteamed';

    const requiredParameters = [{
        name: 'userName',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let payload = requiredParameters.userName.value;
        let regEx = new RegExp(payload, "i");

        return User.find({
            $and: [{
                    displayName: regEx
                },
                {
                    $or: [{
                            teamName: null
                        },
                        {
                            teamName: undefined
                        },
                        {
                            teamId: null
                        },
                        {
                            teamId: undefined
                        }
                    ]
                },
                {
                    $or: [{
                            pendingTeam: null
                        },
                        {
                            pendingTeam: false
                        }
                    ]
                }

            ]
        }).exec().then((foundUsers) => {
            if (foundUsers && foundUsers.length > 0) {
                let ret = [];
                foundUsers.forEach(function(user) {
                    ret.push(user.displayName);
                })
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found Users", false, ret)
                return response;

            } else {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found Users", false, foundUsers)
                return response;
            }
        }, (err) => {
            response.status = 500
            response.message = utils.returnMessaging(req.originalUrl, "Error finding users", err)
            return response;
        });

    })


});


router.post('/team', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/team';

    const requiredParameters = [{
        name: 'teamName',
        type: 'string'
    }]
    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let payload = requiredParameters.teamName.value.toLowerCase();
        let regEx = new RegExp(payload, "i");
        return Team.find({
            teamName_lower: regEx
        }).exec().then((foundTeams) => {
            if (foundTeams && foundTeams.length > 0) {
                let ret = [];
                foundTeams.forEach(function(team) {
                    ret.push(team.teamName);
                })
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found Teams", false, ret)
                return response;
                // res.status(200).send(utils.returnMessaging(req.originalUrl, "Found Teams", false, ret));
            } else {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found Teams", false, foundTeams);
                return response;
                // res.status(200).send(utils.returnMessaging(req.originalUrl, "Found Teams", false, foundTeams));
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, "Error finding teams", err)
            return response;
            // res.status(500).send(utils.returnMessaging(path, "Error finding teams", err));
        });
    })

});

router.post('/user/market', (req, res) => {
    const path = '/search/user/market';



    const optionalParmateres = [{
        name: 'searchObj',
        type: 'object'
    }]
    commonResponseHandler(req, res, [], [], async(req, res, requiredParameters, optionalParmateres) => {
        const response = {};
        let payload = req.body.searchObj;
        let formedSearchObject = createUserSearchObject(payload, req.user);
        // res.status(200).send(utils.returnMessaging(path, "formed search object", null, formedSearchObject))
        return User.find(formedSearchObject).then(
            (found) => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, "Found these users", null, found)
                return response;
                // res.status(200).send(utils.returnMessaging(path, "Found these users", null, found));
            }, (err) => {
                response.status = 500
                response.message = utils.returnMessaging(req.originalUrl, "Error finding users", err)
                return response;
                // res.status(500).send(utils.returnMessaging(path, "Error finding users", err));
            }
        );

    })

});



router.post('/team/market', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/team/market';

    const optionalParmateres = [{
        name: 'searchObj',
        type: 'object'
    }]

    let payload = req.body.searchObj;
    let formedSearchObject = createTeamSearchObject(payload, req.user);

    return Team.find(formedSearchObject).then(
        (found) => {
            res.status(200).send(utils.returnMessaging(req.originalUrl, "Found these teams", null, found))
                // response.status = 200;
                // response.message = utils.returnMessaging(req.originalUrl, "Found these teams", null, found);
                // return response;
        }, (err) => {
            res.status(500).send(utils.returnMessaging(req.originalUrl, "Error finding teams", err))
                // response.status = 500;
                // response.message = utils.returnMessaging(req.originalUrl, "Error finding teams", err);
                // return response;
        }
    );

});


//get users total number this returns all unteamed users
router.get('/users/filtered/total', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/users/filtered/total';
    try {
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
                    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding users', err));
                }
            )
        } else {
            queryUsersAndReturn();
        }

        function queryUsersAndReturn() {
            let userNum = User.countDocuments(myFilterObj);
            userNum.exec().then(
                ret => {
                    res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found users', null, ret));
                },
                err => {
                    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding users', err));
                }
            )
        }
    } catch (e) {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'User Query Error', e));
    }
});

//paginate users
router.post('/user/filtered/paginate', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/filtered/paginate';
    try {
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
                    res.status(200).send(utils.returnMessaging(req.originalUrl, "Fetched next page.", null, found));
                }, err => {
                    res.status(500).send(utils.returnMessaging(req.originalUrl, "Error finding teams", err));
                });
        }
    } catch (e) {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'User Search Error', e));
    }

});

//get users total number this returns all unteamed users
router.get('/users/all/total', (req, res) => {
    const path = '/search/users/total';
    try {
        let userNum = User.estimatedDocumentCount(userUnteamed());
        userNum.exec().then(
            ret => {
                res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found users', null, ret))

            }, err => {
                res.status(500).send(utils.returnMessaging(req.originalUrl, "Error finding users", err));
            }
        );
    } catch (e) {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'User Search Error', e));
    }

});

//paginate users
router.post('/user/paginate', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/search/user/paginate';
    try {
        let page = req.body.page;
        let perPage = 10;
        let query = User.find(userUnteamed()).skip(page * perPage).limit(perPage);
        query.exec().then(
            found => {
                res.status(200).send(utils.returnMessaging(req.originalUrl, "Fetched next page.", null, found));

            }, err => {
                res.status(500).send(utils.returnMessaging(req.originalUrl, "Error finding teams", err));
            }
        )
    } catch (e) {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'User Search Error', e));
    }

});

//get teams total number
router.get('/teams/total', (req, res) => {
    const path = '/search/teams/total';
    try {
        let teamNum = Team.countDocuments(teamQueryObject());
        teamNum.exec().then(
            ret => {
                res.status(200).send(utils.returnMessaging(req.originalUrl, 'Teams count', null, ret));
            }, err => {
                res.status(500).send(utils.returnMessaging(req.originalUrl, "Error finding teams", err));
            }
        )
    } catch (e) {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'User Search Error', e));
    }

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
            res.status(200).send(utils.returnMessaging(req.originalUrl, "Fetched next page.", null, found));
        }, err => {
            res.status(500).send(utils.returnMessaging(req.originalUrl, "Error finding teams", err));
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
        if (utils.returnBoolByPath(obj, 'divisions')) {
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
        if (utils.returnBoolByPath(obj, 'lowerMMR') || utils.returnBoolByPath(obj, 'upperMMR')) {
            let mmr = {
                $and: []
            };
            let add = false;
            if (utils.returnBoolByPath(obj, 'lowerMMR')) {
                mmr['$and'].push({
                    averageMmr: {
                        $gte: obj.lowerMMR
                    }
                });
                add = true;
            }
            if (utils.returnBoolByPath(obj, 'upperMMR')) {
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
        if (utils.returnBoolByPath(obj, 'competitiveLevel')) {
            returnObj['$and'].push({
                competitiveLevel: obj.competitiveLevel
            });
        }

        //add roles to the query object
        if (utils.returnBoolByPath(obj, 'rolesNeeded')) {
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
        if (utils.returnBoolByPath(obj, 'timezone') || utils.returnBoolByPath(obj, 'times')) {
            let user = {};

            user.availability = obj.times
            if (utils.returnBoolByPath(obj, 'timezone')) {
                user.timeZone = obj.timezone;
            } else if (utils.returnBoolByPath(reqUser, 'timeZone')) {
                user.timeZone = reqUser.timeZone;
            } else {
                user.timeZone = (-6);
            }

            if (utils.returnBoolByPath(user, 'availability')) {
                let keys = Object.keys(user.availability);
                keys.forEach(key => {
                    let unit = user.availability[key];
                    if (unit.available) {
                        if (utils.returnBoolByPath(unit, 'startTime')) {
                            let searchKey = 'availability.' + key + '.startTime';
                            let searchValue = '$gte: ' + milTime.zeroGMT(unit.startTime, user.timeZone);
                            let tO = {};
                            tO[searchKey] = searchValue;
                            returnObj['$and'].push(tO);
                        }
                        if (utils.returnBoolByPath(unit, 'endTime')) {
                            let searchKey = 'availability.' + key + '.endTime';
                            let searchValue = '$lte: ' + milTime.zeroGMT(unit.endTime, user.timeZone);
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
        if (utils.returnBoolByPath(obj, 'divisions')) {
            let divs = { $or: [] };
            obj['divisions'].forEach(div => {
                divs['$or'].push({
                    divisionConcat: div.value
                });
            })
            returnObj['$and'].push(divs);
        }


        // Add MMRs to the query object
        if (utils.returnBoolByPath(obj, 'lowerMMR') || utils.returnBoolByPath(obj, 'upperMMR')) {
            let mmr = { $and: [] };
            let add = false;
            if (utils.returnBoolByPath(obj, 'lowerMMR')) {
                mmr['$and'].push({
                    teamMMRAvg: {
                        $gte: obj.lowerMMR
                    }
                });
                add = true;
            }
            if (utils.returnBoolByPath(obj, 'upperMMR')) {
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
        if (utils.returnBoolByPath(obj, 'competitiveLevel')) {
            returnObj['$and'].push({ competitiveLevel: obj.competitiveLevel });
        }

        //add roles to the query object
        if (utils.returnBoolByPath(obj, 'rolesNeeded')) {
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
        if (utils.returnBoolByPath(obj, 'getProfileTime') || utils.returnBoolByPath(obj, 'getProfileTimezone') || utils.returnBoolByPath(obj, 'timezone') || utils.returnBoolByPath(obj, 'times')) {
            let user = {};
            //user can use their saved profile
            if ((utils.returnBoolByPath(obj, 'getProfileTime') && obj.getProfileTime) || (utils.returnBoolByPath(obj, 'getProfileTimezone') && obj.getProfileTimezone)) {
                user = reqUser;
            } else { //or user can provide a seperate time to search
                user.availability = obj.times
                if (utils.returnBoolByPath(obj, 'timezone')) {
                    user.timeZone = obj.timezone;
                } else {
                    user.timeZone = reqUser.timeZone;
                }
            }
            if (utils.returnBoolByPath(user, 'availability')) {
                let keys = Object.keys(user.availability);
                keys.forEach(key => {
                    let unit = user.availability[key];
                    if (unit.available) {
                        if (utils.returnBoolByPath(unit, 'startTime')) {
                            let searchKey = 'availability.' + key + '.startTime';
                            let searchValue = '$gte: ' + milTime.zeroGMT(unit.startTime, user.timeZone);
                            let tO = {};
                            tO[searchKey] = searchValue;
                            returnObj['$and'].push(tO);
                        }
                        if (utils.returnBoolByPath(unit, 'endTime')) {
                            let searchKey = 'availability.' + key + '.endTime';
                            let searchValue = '$lte: ' + milTime.zeroGMT(unit.endTime, user.timeZone);
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