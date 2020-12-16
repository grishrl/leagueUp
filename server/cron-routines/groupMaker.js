/**
 * These methods are used to search through player and teams to try and match make teams during the off season;
 * this is wrapped in an utility API that is called nightly by temporize on the server (when enabled)
 * 
 * reviewed: 9-30-2020
 * reviewer: wraith
 */
const User = require('../models/user-models');
const Team = require('../models/team-models');
const util = require('../utils');
const messageSub = require('../subroutines/message-subs');
const _ = require('lodash');
const { returnIdFromDisplayName } = require('../methods/profileMethods');
const milTime = require('../methods/timeMethods');

const varianceWindow = 15;
const compLevelVariance = 1;

/**
 * @name suggestUserToUser
 * @function
 * @description kicks off the process to match free agents to free agents to possibly create a team
 */
async function suggestUserToUser() {

    let query = {
            lookingForGroup: true
        }
        //find all players free agent
    let usersLFG = await User.find(query).then(
        found => {
            return found;
        },
        err => {
            util.errLogger('groupMaker', err, 'userlfg query')
            return null;
        }
    );

    if (usersLFG) {
        for (var i = 0; i < usersLFG.length; i++) {
            let user = usersLFG[i]
            let userObj = util.objectify(user);
            matchUsersByTime(userObj).then(
                ret => {
                    // empty return for this async function
                }
            );
        }
    }
}


/**
 * @name returnBaseUserQuery
 * @function
 * @description return an empty user query object with some query params
 */
function returnBaseUserQuery() {
    return {
        $and: [{
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
                lookingForGroup: true
            }
        ]
    };
}
/**
 * @name matchUsersByTime
 * @function
 * @description seeks to match a given free agent to other free agents that have similar time availability, competitive level, mmr etc...
 * 
 * @param {Object} userObj - user object
 */
async function matchUsersByTime(userObj) {
    // let compLevel = teamObj.competitiveLevel;
    // let availability = teamObj.availability;
    // let rolesNeeded = teamObj.rolesNeeded;

    let userAvail = userObj.availability;

    let queries = [];

    let dayAnd = {
        $and: []
    };

    let dayOr = returnCleanOr();

    //build a query out the given users availabilities
    _.forEach(userAvail, (val, key) => {

        if (val.available) {

            let query = returnBaseUserQuery();

            let endAndStart = returnCleanAnd();

            let timeAnd = {
                $and: []
            };

            if (util.returnBoolByPath(val, 'zeroGMTstartTimeNumber')) {

                let searchKey = 'availability.' + key + '.zeroGMTstartTimeNumber';
                let searchValue = {
                    '$gte': milTime.subtractMil(val.zeroGMTstartTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = {
                    '$lte': milTime.addMil(val.zeroGMTstartTimeNumber, varianceWindow)
                };
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
            }

            if (timeAnd.$and.length > 0) {
                endAndStart.$and.push(timeAnd);
                timeAnd = {
                    $and: []
                }
            }

            if (util.returnBoolByPath(val, 'zeroGMTendTimeNumber')) {
                let searchKey = 'availability.' + key + '.zeroGMTendTimeNumber';
                let searchValue = {
                    '$gte': milTime.subtractMil(val.zeroGMTendTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = {
                    '$lte': milTime.addMil(val.zeroGMTendTimeNumber, varianceWindow)
                };
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
            }
            if (timeAnd.$and.length > 0) {
                endAndStart.$and.push(timeAnd);
                timeAnd = {
                    $and: []
                }
            }

            if (endAndStart.$and.length > 0) {
                query.$and.push(endAndStart);
            }

            queries.push(query);
        }

    });

    //query the users for matches
    let matches = {};
    for (var i = 0; i < queries.length; i++) {
        let runQuery = queries[i];
        let userMatches = await User.find(runQuery, '_id').then(
            res => {
                return res;
            },
            err => {
                return null;
            }
        )

        if (userMatches) {
            matches[i.toString()] = userMatches;
        }

    }

    /*
    the overall object gets built out by giving each matching ID a property in the object;
    that property is an object that contains hits; hits get incremented every time we ahve a positive match; we judge out confidence of a match later on before adding the users to the message
    {
      userid1:{
        hits:1
      },
      userid2:{
        hits:2
      }
    }
    */

    let overall = {};
    //loop through the matches object;
    _.forEach(matches, (val, key) => {
        //each value is an array of results;
        //loop through the array of results
        _.forEach(val, (val) => {
            let id = val['_id'];
            if (overall.hasOwnProperty(id)) {
                overall[id].hits += 1;
            } else {
                overall[id] = {
                    hits: 1
                };
            }
        });
    });

    //build out a message object
    let userMsg = {};
    userMsg.recipient = userObj._id;
    userMsg.sender = 'Mr. Fisky';
    userMsg.subject = 'NGS Group Finder';
    userMsg.timeStamp = new Date().getTime()
    userMsg.content = 'Hello!  Mr. Fisky here.  I was just looking through the list of free agents looking for a team.  Have you considered making your own team?' + ' I think the following players might be a good fit for a team!';
    userMsg.notSeen = true;
    userMsg.request = {};

    //we'll keep track of how many possible matches we've made;
    let possible = 0;

    //get the keys of the overall matches (these are user ids)
    let keys = Object.keys(overall);

    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let val = overall[key];
        let conf = await solidifyUserMatch(userObj, key, val.hits).then(res => {
            return res;
        });
        //if our confidence level is 5 or more; move forward with the match
        if (conf['conf'] >= 5) {
            if (userMsg.request.hasOwnProperty('players')) {
                userMsg.request.players.push(conf['displayName']);
                possible += 1;
            } else {
                userMsg.request = {
                    players: [conf['displayName']]
                };
                possible += 1;
            }

            userMsg.content += ' \n' + conf['displayName'];
        }
    }

    //if we have more than 2 matches; send the message (this message only goes to the 1 user)
    if (possible >= 2) {
        messageSub(userMsg);
    }


    return true;
}

/**
 * @name solidifyUserMatch
 * @function
 * @description At this point we have matched two users on times; lets try and solidify that match using witchy math that is all arbitrary by me.
 * 
 * @param {Object} userObj - given user object; 
 * @param {string} candidateId - candidate match user Id
 * @param {number} hits - current 'hits' or matches made (at this point this is the number of schedule times they have aligned)
 */
async function solidifyUserMatch(userObj, candidateId, hits) {

    //abitrary numbers
    let confidenceLevel = 3;
    let confidenceMultiplier = 1;

    //get the user
    let user = await User.findById(candidateId).then(
        found => {
            return found;
        }, err => {
            return null;
        }
    );

    let otherUserObj = util.objectify(user);

    //if these players have more than 4 available blocks together move our confidence up.
    if (hits > 4) {
        confidenceMultiplier += .5;
    }

    //lets check their competitive level
    if (util.returnBoolByPath(userObj, 'competitiveLevel') && util.returnBoolByPath(otherUserObj, 'competitiveLevel')) {
        let uC = userObj.competitiveLevel;
        let tC = otherUserObj.competitiveLevel;
        //if these users have the same competitve level - bump our confidence up
        if (uC == tC) {
            confidenceMultiplier += .4;
        } else if (Math.abs(uC - tC) >= 1) {
            //if they are within 1 comp level slightly up the confidence
            confidenceMultiplier += .3;
        } else if (Math.abs(uC - tC) >= 2) {
            //if they are out of 2 comp level add even less confidence
            confidenceMultiplier += .2;
        }
    }

    //now compare the players mmrs ... 
    if (util.returnBoolByPath(userObj, 'heroesProfileMmr')) {

        let userMMR = userObj.heroesProfileMmr;

        let perc = userMMR / otherUserObj.hpMmrAvg;
        //incase userMMR is much larger than other user mmr, we want an absolute %
        if (perc > 1) {
            perc = perc - 1;
        }

        //we will up our confidence depending on what % these players MMRs are of each other; the closer their MMRs the better they might play together?
        if (perc = 1) {
            confidenceMultiplier += .5;
        } else if (perc >= .85) {
            confidenceMultiplier += .4;
        } else if (perc >= .75) {
            confidenceMultiplier += .3;
        } else if (perc >= .65) {
            confidenceMultiplier += .2;
        } else if (perc >= .55) {
            confidenceMultiplier += .1;
        }

    }

    //create our confidence level of this match
    confidenceLevel = confidenceLevel * confidenceMultiplier;

    return {
        conf: confidenceLevel,
        displayName: otherUserObj.displayName
    }

}

/**
 * @name suggestUserToTeam
 * @function
 * @description kicks off the process to match free agents to an existing team - sends message to captain and players when matches are made
 */
async function suggestUserToTeam() {

    let query = {
        $and: [{
            lookingForMore: true
        }, {
            $where: "this.teamMembers.length <= 6"
        }]
    }

    let teamsLFG = await Team.find(query).then(
        found => {
            return found;
        },
        err => {
            util.errLogger('groupMaker', err, 'teamsLfg query')
            return null;
        }
    );

    if (teamsLFG) {

        for (var i = 0; i < teamsLFG.length; i++) {
            let team = teamsLFG[i]
            let teamObj = team.toObject();


            findFreeAgentsForTeam(team, teamObj).then(
                ret => {
                    // empty return from async
                }
            );
        }


    }
}

/**
 * @name returnCleanAnd
 * @function
 * @description returns clean and query
 */
function returnCleanAnd() {
    return { $and: [] };
}

/**
 * @name returnCleanOr
 * @function
 * @description returns clean or query
 */
function returnCleanOr() {
    return {
        $or: []
    };
}

/**
 * @name findFreeAgentsForTeam
 * @function
 * @description attempts to match free agents to teams
 * 
 * 
 * @param {Team} team 
 * @param {Object} teamObj 
 */
async function findFreeAgentsForTeam(team, teamObj) {


    let teamAvail = teamObj.availability;

    let queries = [];

    let dayAnd = {
        $and: []
    };

    let dayOr = returnCleanOr();

    //go through the team times to find users who have matching times
    _.forEach(teamAvail, (val, key) => {

        if (val.available) {

            let query = {
                $and: [{
                    lookingForGroup: true
                }]
            };

            let endAndStart = returnCleanAnd();

            let timeAnd = {
                $and: []
            };

            if (util.returnBoolByPath(val, 'zeroGMTstartTimeNumber')) {

                let searchKey = 'availability.' + key + '.zeroGMTstartTimeNumber';
                let searchValue = {
                    '$gte': milTime.subtractMil(val.zeroGMTstartTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = { '$lte': milTime.addMil(val.zeroGMTstartTimeNumber, varianceWindow) };
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
            }

            if (timeAnd.$and.length > 0) {
                endAndStart.$and.push(timeAnd);
                timeAnd = {
                    $and: []
                }
            }

            if (util.returnBoolByPath(val, 'zeroGMTendTimeNumber')) {
                let searchKey = 'availability.' + key + '.zeroGMTendTimeNumber';
                let searchValue = {
                    '$gte': milTime.subtractMil(val.zeroGMTendTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = { '$lte': milTime.addMil(val.zeroGMTendTimeNumber, varianceWindow) };
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
            }
            if (timeAnd.$and.length > 0) {
                endAndStart.$and.push(timeAnd);
                timeAnd = {
                    $and: []
                }
            }

            if (endAndStart.$and.length > 0) {
                query.$and.push(endAndStart);
            }

            queries.push(query);
        }

    });

    let matches = {};
    for (var i = 0; i < queries.length; i++) {
        let runQuery = queries[i];
        let userMatches = await User.find(runQuery, '_id').then(
            res => {
                return res;
            },
            err => {
                return null;
            }
        )

        if (userMatches) {
            matches[i.toString()] = userMatches;
        }

    }

    /*
    the overall object gets built out by giving each matching ID a property in the object;
    that property is an object that contains hits; hits get incremented every time we ahve a positive match; we judge out confidence of a match later on before adding the users to the message
    {
      userid1:{
        hits:1
      },
      userid2:{
        hits:2
      }
    }
    */
    let overall = {};
    //loop through the matches object;
    _.forEach(matches, (val, key) => {
        //each value is an array of results;
        //loop through the array of results
        _.forEach(val, (val) => {
            let id = val['_id'];
            if (overall.hasOwnProperty(id)) {
                overall[id].hits += 1;
            } else {
                overall[id] = { hits: 1 };
            }
        });
    });

    let keys = Object.keys(overall);

    let userMessages = {};
    let teamCaptMessages = {};

    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let val = overall[key];
        if (val.hits >= 3) {

            let conf = await teamMatchConfidence(team, key, val.hits).then(
                rep => { return rep; },
                err => { return null; }
            )

            if (conf && conf.conf >= 6) {
                if (userMessages.hasOwnProperty(conf.userId)) {

                    userMessages[conf.userId].request.teams.push(conf.teamName);

                } else {

                    let userMsg = {};
                    userMsg.recipient = conf.userId;
                    userMsg.sender = 'Mr. Fisky';
                    userMsg.subject = 'NGS Group Finder';
                    userMsg.timeStamp = new Date().getTime()
                    userMsg.content = 'Hello!  Mr. Fisky here.  I was just looking through the list of teams looking for more and I thought that these teams might be a good fit for you!  If you\'re still on the hunt for a team check out their profile!';
                    userMsg.request = { teams: [conf.teamName] };
                    userMsg.notSeen = true;
                    userMessages[conf.userId] = userMsg;
                }

                let capt = await returnIdFromDisplayName(teamObj.captain).then(
                    capt => {
                        return capt;
                    },
                    err => {
                        return null;
                    }
                );
                if (capt) {
                    if (teamCaptMessages.hasOwnProperty(capt.toString())) {
                        teamCaptMessages[capt.toString()].request.players.push(conf.userName);
                    } else {
                        let teamMsg = {};
                        teamMsg.notSeen = true;
                        teamMsg.recipient = capt.toString();
                        teamMsg.sender = 'Mr. Fisky';
                        teamMsg.subject = 'NGS Group Finder';
                        teamMsg.timeStamp = new Date().getTime()
                        teamMsg.content = 'Hello!  Mr. Fisky here.  I was just looking through the roster of free agents and I thought that these players might be a good fit for your team!  If you\'re still on the hunt for a player check out their profile!';
                        teamMsg.request = {
                            players: [conf.userName]
                        };
                        teamCaptMessages[capt.toString()] = teamMsg;
                    }
                }
            }
        }

    }

    //send messages to players about teams they might like
    _.forEach(userMessages, (val, key) => {
        messageSub(val);
    })

    //send messages to captains about players they might like
    _.forEach(teamCaptMessages, (val, key) => {
        messageSub(val);
    })

    return true;

}
/**
 * @name teamMatchConfidence
 * @function
 * @description attempts to determine match strength of team and players
 * @param {Team} team 
 * @param {string} candidateId 
 * @param {number} hits 
 */
async function teamMatchConfidence(team, candidateId, hits) {

    let confidenceLevel = 3;
    let confidenceMultiplier = 1;

    let user = await User.findById(candidateId).then(
        found => {
            return found;
        }, err => {
            return null;
        }
    );

    let userObj = user.toObject();
    let teamObj = team.toObject();

    if (hits > 3) {
        confidenceMultiplier += .5;
    }

    if (util.returnBoolByPath(userObj, 'competitiveLevel') && util.returnBoolByPath(teamObj, 'competitiveLevel')) {
        let uC = userObj.competitiveLevel;
        let tC = teamObj.competitiveLevel;

        if (uC == tC) {
            confidenceMultiplier += .4;
        } else if (Math.abs(uC - tC) >= 1) {
            confidenceMultiplier += .3;
        } else if (Math.abs(uC - tC) >= 2) {
            confidenceMultiplier += .2;
        }
    }

    /*
        "heroesProfileMmr": Number,
        "ngsMmr": Number,
            "hlRankMetal": String,
            "hlRankDivision": Number,
    */

    if (util.returnBoolByPath(userObj, 'heroesProfileMmr')) {

        let userMMR = userObj.heroesProfileMmr;

        let perc = userMMR / team.hpMmrAvg;

        if (perc >= 1) {
            confidenceMultiplier += .5;
        } else if (perc >= .85) {
            confidenceMultiplier += .4;
        } else if (perc >= .75) {
            confidenceMultiplier += .3;
        } else if (perc >= .65) {
            confidenceMultiplier += .2;
        } else if (perc >= .55) {
            confidenceMultiplier += .1;
        }

    }

    confidenceLevel = confidenceLevel * confidenceMultiplier;

    return {
        conf: confidenceLevel,
        teamName: teamObj.teamName,
        captain: teamObj.captain,
        userId: userObj._id,
        userName: userObj.displayName
    }

}


/**
 * @name zeroTeamTimes
 * @function
 * @description run through teams and add the zeroGMT time to the teams
 */
async function zeroTeamTimes() {

    let teams = await Team.find().then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );

    if (teams) {

        for (var i = 0; i < teams.length; i++) {
            let num = i + 1;
            let team = teams[i]
            let teamObj = team.toObject();

            if (teamObj.availability) {

                let teamAvail = teamObj.availability;

                _.forEach(teamAvail, (val, key) => {
                    if (val.available) {

                        val['startTimeNumber'] = milTime.convertToMil(val['startTime']);
                        val['endTimeNumber'] = milTime.convertToMil(val['endTime']);

                        val['zeroGMTstartTimeNumber'] = milTime.zeroGMT(val['startTime'], teamObj.timeZone);
                        val['zeroGMTendTimeNumber'] = milTime.zeroGMT(val['endTime'], teamObj.timeZone);

                    }
                });

                team.availability = teamAvail;

            }



            team.markModified('availability');
            team.save().then(
                saved => {
                    util.errLogger('groupMaker', null, num + ' of ' + teams.length + ' teams saved. zeroTeamTimes')
                },
                err => {
                    util.errLogger('groupMaker', null, 'error saving, zeroTeamTimes');
                }
            )

        }

    }

}

/**
 * @name zeroUserTimes
 * @function
 * @description run through users and add the zeroGMT time to their availabilities
 */
async function zeroUserTimes() {

    let teams = await User.find().then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );

    if (teams) {

        for (var i = 0; i < teams.length; i++) {
            let num = i + 1;
            let team = teams[i]
            let teamObj = team.toObject();

            if (teamObj.availability) {

                let teamAvail = teamObj.availability;

                _.forEach(teamAvail, (val, key) => {
                    if (val.available) {

                        val['startTimeNumber'] = milTime.convertToMil(val['startTime']);
                        val['endTimeNumber'] = milTime.convertToMil(val['endTime']);

                        val['zeroGMTstartTimeNumber'] = milTime.zeroGMT(val['startTime'], teamObj.timeZone);
                        val['zeroGMTendTimeNumber'] = milTime.zeroGMT(val['endTime'], teamObj.timeZone);

                    }
                });

                team.availability = teamAvail;

            }



            team.markModified('availability');
            team.save().then(
                saved => {
                    util.errLogger('groupMaker', null, num + ' of ' + teams.length + ' teams saved.')
                },
                err => {
                    util.errLogger('groupMaker', null, 'error saving: zeroUserTimes');
                }
            )

        }

    }

}

module.exports = {
    zeroTeamTimes: zeroTeamTimes,
    zeroUserTimes: zeroUserTimes,
    suggestUserToTeam: suggestUserToTeam,
    suggestUserToUser: suggestUserToUser
}