const User = require('../models/user-models');
const Team = require('../models/team-models');
const util = require('../utils');
const messageSub = require('../subroutines/message-subs');
const _ = require('lodash');

const mongoose = require('mongoose');

const varianceWindow = 15;
const compLevelVariance = 1;

async function suggestUserToUser() {
    let query = {
        lookingForGroup: true
    }

    let usersLFG = await User.find(query).then(
        found => {
            return found;
        },
        err => {
            console.log(err);
            return null;
        }
    );
    console.log(usersLFG.length)
    if (usersLFG) {
        for (var i = 0; i < usersLFG.length; i++) {
            let user = usersLFG[i]
            let userObj = user.toObject();


            userBreakOut1(userObj).then(
                ret => {
                    console.log('ret ', ret);
                }
            );
        }
    }
}

function baseUserQuery() {
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

async function userBreakOut1(userObj) {
    // let compLevel = teamObj.competitiveLevel;
    // let availability = teamObj.availability;
    // let rolesNeeded = teamObj.rolesNeeded;

    let userAvail = userObj.availability;

    let queries = [];

    let dayAnd = {
        $and: []
    };

    let dayOr = cleanOr();

    _.forEach(userAvail, (val, key) => {

        if (val.available) {

            let query = baseUserQuery();

            let endAndStart = cleanAnd();
            // let timeOr = {
            //     $or: []
            // };
            let timeAnd = {
                $and: []
            };

            if (util.returnBoolByPath(val, 'zeroGMTstartTimeNumber')) {

                let searchKey = 'availability.' + key + '.zeroGMTstartTimeNumber';
                let searchValue = {
                    '$gte': subtractMil(val.zeroGMTstartTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = {
                    '$lte': addMil(val.zeroGMTstartTimeNumber, varianceWindow)
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
                    '$gte': subtractMil(val.zeroGMTendTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = {
                    '$lte': addMil(val.zeroGMTendTimeNumber, varianceWindow)
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

    let userMsg = {};
    userMsg.recipient = userObj._id;
    userMsg.sender = 'Mr. Fisky';
    userMsg.subject = 'NGS Group Finder';
    userMsg.timeStamp = new Date().getTime()
    userMsg.content = 'Hello!  Mr. Fisky here.  I was just looking through the list of free agents looking for a team.  Have you considered making your own team?' + ' I think the following players might be a good fit for a team!';
    userMsg.notSeen = true;

    let possible = 0;

    let keys = Object.keys(overall);

    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let val = overall[key];
        let conf = await userBreakout2(userObj, key, val.hits).then(res => {
            return res;
        });
        if (conf['conf'] >= 5) {
            possible += 1;
            userMsg.content += ' \n' + conf['displayName'];
        }
    }

    console.log('possible ', possible)
    if (possible >= 2) {
        messageSub(userMsg);
    }


    return true;
}

async function userBreakout2(userObj, candidateId, hits) {

    let confidenceLevel = 3;
    let confidenceMultiplier = 1;

    let user = await User.findById(candidateId).then(
        found => {
            return found;
        }, err => {
            return null;
        }
    );

    let otherUserObj = user.toObject();

    if (hits > 4) {
        confidenceMultiplier += .5;
    }

    if (util.returnBoolByPath(userObj, 'competitiveLevel') && util.returnBoolByPath(otherUserObj, 'competitiveLevel')) {
        let uC = userObj.competitiveLevel;
        let tC = otherUserObj.competitiveLevel;

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

        let perc = userMMR / otherUserObj.hpMmrAvg;

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
        displayName: otherUserObj.displayName
    }

}

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
            console.log(err);
            return null;
        }
    );

    if (teamsLFG) {

        for (var i = 0; i < teamsLFG.length; i++) {
            let team = teamsLFG[i]
            let teamObj = team.toObject();


            breakout1(team, teamObj).then(
                ret => {
                    console.log('ret ', ret);
                }
            );
        }


    }
}

function cleanAnd() {
    return { $and: [] };
}

function cleanOr() {
    return {
        $or: []
    };
}

async function breakout1(team, teamObj) {

    // let compLevel = teamObj.competitiveLevel;
    // let availability = teamObj.availability;
    // let rolesNeeded = teamObj.rolesNeeded;

    let teamAvail = teamObj.availability;

    let queries = [];

    let dayAnd = {
        $and: []
    };

    let dayOr = cleanOr();

    _.forEach(teamAvail, (val, key) => {

        if (val.available) {

            let query = {
                $and: [{
                    lookingForGroup: true
                }]
            };

            let endAndStart = cleanAnd();
            // let timeOr = {
            //     $or: []
            // };
            let timeAnd = {
                $and: []
            };

            if (util.returnBoolByPath(val, 'zeroGMTstartTimeNumber')) {

                let searchKey = 'availability.' + key + '.zeroGMTstartTimeNumber';
                let searchValue = {
                    '$gte': subtractMil(val.zeroGMTstartTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = { '$lte': addMil(val.zeroGMTstartTimeNumber, varianceWindow) };
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
                    '$gte': subtractMil(val.zeroGMTendTimeNumber, varianceWindow)
                };

                let tO = {};
                tO[searchKey] = searchValue;
                timeAnd.$and.push(tO);
                tO = {};
                searchValue = { '$lte': addMil(val.zeroGMTendTimeNumber, varianceWindow) };
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

    _.forEach(overall, (val, key) => {
        if (val.hits >= 3) {
            breakout2(team, key, val.hits);
        } else {

        }
    })

    return true;

}

async function breakout2(team, candidateId, hits) {

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

    if (confidenceLevel >= 6) {
        let userMsg = {};
        userMsg.recipient = userObj._id;
        userMsg.sender = 'Mr. Fisky';
        userMsg.subject = 'NGS Group Finder';
        userMsg.timeStamp = new Date().getTime()
        userMsg.content = 'Hello!  Mr. Fisky here.  I was just looking through the list of teams looking for more and I thought that ' + teamObj.teamName +
            ' might be a good fit for you!  If you\'re still on the hunt for a team check out their profile!';
        userMsg.notSeen = true;
        messageSub(userMsg);

        getCptId(teamObj.captain).then(
            capt => {
                if (capt) {
                    let teamMsg = {};
                    teamMsg.notSeen = true;
                    teamMsg.recipient = capt._id.toString();
                    teamMsg.sender = 'Mr. Fisky';
                    teamMsg.subject = 'NGS Group Finder';
                    teamMsg.timeStamp = new Date().getTime()
                    teamMsg.content = 'Hello!  Mr. Fisky here.  I was just looking through the roster of free agents and I thought that ' + userObj.displayName +
                        ' might be a good fit for your team!  If you\'re still on the hunt for a player check out their profile!';
                    messageSub(teamMsg);
                }
            }
        )

    }

}

async function getCptId(cptName) {
    let cptID = await User.findOne({
        displayName: cptName
    }).then(
        res => {
            return res;
        },
        err => {
            return err;
        }
    );
    return cptID;
}

function subtractMil(time, less) {
    let hour = Math.floor(time / 100) * 100;
    let min = time - hour;
    if (min == 0) {
        hour = hour - 100;
        min = 60 - less;
    } else {
        min = min - less;
    }
    if (min < 0) {
        hour = hour - 100;
        min = min + 60;
    }
    return ((hour) + min);
}

function addMil(time, plus) {
    let hour = Math.floor(time / 100) * 100;
    let min = time - hour;
    min = min + plus;
    if (min >= 60) {
        hour = hour + 100;
        min = min - 60;
    }
    return ((hour) + min);
}

// function convertToMil(time) {
//     if (typeof time === 'string') {
//         let colonSplit = time.split(':');
//         let hour = parseInt(colonSplit[0]);
//         let min = parseInt(colonSplit[1]);
//         if (min >= 60) {
//             min = min - 60;
//             hour = hour + 1;
//         }
//         return hour * 100 + min;
//     } else {
//         let hour = Math.floor(time / 100) * 100;
//         let min = time - hour;
//         if (min >= 60) {
//             min = min - 60;
//             hour += 100;
//         }
//         return ((hour) + min);
//     }
// }
// function convertToMil(time) {
//     console.log(time);
//     if (typeof time === 'string') {
//         let colonSplit = time.split(':');
//         let hour = parseInt(colonSplit[0]);
//         let min = parseInt(colonSplit[1]);
//         if (min >= 60) {
//             min = min - 60;
//             hour = hour + 1;
//         }
//         if (hour > 24) {
//             hour = 0;
//         }
//         return hour * 100 + min;
//     } else {
//         let hour = Math.floor(time / 100) * 100;
//         let min = time - hour;
//         if (min >= 60) {
//             min = min - 60;
//             hour += 100;
//         }
//         if (hour > 24) {
//             hour = 0;
//         }
//         return ((hour) + min);
//     }
// }

function zeroGMT(time, timezone) {

    let localTime = time;
    if (typeof localTime === 'string') {
        localTime = convertToMil(localTime);
    }
    timezone = parseInt(timezone);
    let correct = localTime - (timezone * 100);

    return correct;
}

// run through teams and add the zeroGMT time to the teams
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

                        val['startTimeNumber'] = convertToMil(val['startTime']);
                        val['endTimeNumber'] = convertToMil(val['endTime']);

                        val['zeroGMTstartTimeNumber'] = zeroGMT(val['startTime'], teamObj.timeZone);
                        val['zeroGMTendTimeNumber'] = zeroGMT(val['endTime'], teamObj.timeZone);

                    }
                });

                team.availability = teamAvail;

            }



            team.markModified('availability');
            team.save().then(
                saved => {
                    console.log(num + ' of ' + teams.length + ' teams saved.');
                },
                err => {
                    console.log('error saving');
                }
            )

        }

    }

}

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

                        val['startTimeNumber'] = convertToMil(val['startTime']);
                        val['endTimeNumber'] = convertToMil(val['endTime']);

                        val['zeroGMTstartTimeNumber'] = zeroGMT(val['startTime'], teamObj.timeZone);
                        val['zeroGMTendTimeNumber'] = zeroGMT(val['endTime'], teamObj.timeZone);

                    }
                });

                team.availability = teamAvail;

            }



            team.markModified('availability');
            team.save().then(
                saved => {
                    console.log(num + ' of ' + teams.length + ' teams saved.');
                },
                err => {
                    console.log('error saving');
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