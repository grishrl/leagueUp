const util = require('../utils');
const Team = require('../models/team-models');
const User = require('../models/user-models');
const Match = require('../models/match-model');
const logger = require('./sys-logging-subs');
const mmrMethods = require('../methods/mmrMethods');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');

const location = 'team-subs.js';

//how many members of team we will use to calculate avg-mmr
const numberOfTopMembersToUse = 4;

//subroutine to update teams division
// teams: array of teams,
//division: object division object
function upsertTeamsDivision(teams, division) {
    teams.forEach(team => {
        upsertTeamDivision(team, division);
    });
}

//update team's division info with that of the provided division
//team: object or string
//division : object, division obhect
function upsertTeamDivision(team, division) {
    let logObj = {};
    logObj.actor = 'SYSTEM; Update Team Division';
    logObj.action = ' updating team division ';

    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';

    let fteam;
    //if we got an object; lets get the teamname out of the object to call the database
    if (typeof team == 'object') {
        team = util.objectify(team);
        fteam = team.teamName_lower.toLowerCase();
    } else {
        fteam = team.toLowerCase();
    }
    logObj.target = fteam;
    //grab team
    Team.findOne({ teamName_lower: fteam }).then((foundTeam) => {
        if (foundTeam) {
            //assign or replace its division with the provided
            foundTeam.divisionDisplayName = division.displayName;
            foundTeam.divisionConcat = division.divisionConcat;
            foundTeam.save((success) => {
                logger(logObj);
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
            })
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
    })
}

//update mmrs asynch
//team:string or team object, 
async function updateTeamMmrAsynch(team) {
    let logObj = {};
    logObj.actor = 'SYSTEM; Update Team MMR';
    logObj.action = ' updating team and player mmr ';
    logObj.target = '';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';

    //if we got a string team name then convert team to object with teamname_lower
    if (typeof team == 'string') {
        team = team.toLowerCase();
        team = {
            teamName_lower: team
        }
    }

    logObj.target += team.teamName_lower + ' ';
    //grab the specified team
    let retrievedTeam = await Team.findOne({
        teamName_lower: team.teamName_lower
    }).then((foundTeam) => {
        if (foundTeam) {
            return foundTeam;
        } else {
            return null;
        }
    }, (err) => {
        util.errLogger(location, err, 'updateMmr routine failed')
        return null;
    });

    //grab all the members of the team
    let members = [];
    retrievedTeam.teamMembers.forEach(element => {
        members.push(element.displayName);
    });

    let processMembersMMR;
    if (members.length > 0) {
        //loop through the members of each team
        for (var i = 0; i < members.length; i++) {
            //grab a specific member
            let member = members[i];
            //call out to the external sources grab the most updated users MMR
            let mmrInfo = await mmrMethods.comboMmr(member);

            //grab the player from db
            let player = await User.findOne({ displayName: member }).then(
                found => { return found; },
                err => { return null; }
            )

            logObj.target += member + ' ';
            let savedPlayer;
            //save the players updated MMR
            if (player) {
                if (mmrInfo.heroesProfile >= 0) {
                    player.heroesProfileMmr = mmrInfo.heroesProfile;
                } else {
                    player.heroesProfileMmr = -1 * mmrInfo.heroesProfile;
                }
                player.ngsMmr = mmrInfo.ngsMmr;
                //leaving this hotslogs logic here in case it catches any errors
                if (util.returnBoolByPath(mmrInfo, 'hotsLogs.mmr')) {
                    player.averageMmr = mmrInfo.hotsLogs.mmr;
                }
                //leaving this hotslogs logic here in case it catches any errors
                if (util.returnBoolByPath(mmrInfo, 'hotsLogs.playerId')) {
                    player.hotsLogsPlayerID = mmrInfo.hotsLogs.playerId;
                }

                savedPlayer = await player.save().then(
                    saved => { return saved; },
                    err => { return null; }
                )
            }

        }

        //get the MMR of the top members of the team
        processMembersMMR = await topMemberMmr(members).then((processed) => {
            if (processed) {
                return processed;
            } else {
                return null;
            }
        }, err => {
            logObj.level = 'ERROR';
            logObj.error = err;
            return null;
        });
    }
    //save the teams new MMR back to the database if it was calculated
    let updatedTeam;
    if (processMembersMMR) {
        retrievedTeam.teamMMRAvg = processMembersMMR.averageMmr;
        retrievedTeam.hpMmrAvg = processMembersMMR.heroesProfileAvgMmr;
        retrievedTeam.ngsMmrAvg = processMembersMMR.ngsAvgMmr
        updatedTeam = await retrievedTeam.save().then(saved => {
            return saved;
        }, err => {
            logObj.level = 'ERROR';
            logObj.error = err;
            return null;
        })
    }
    logger(logObj);
    return updatedTeam;
}

//subroutine to update a teams average mmr, this will run when it is passed a team
//this uses currently saved figures in the database to calculate the teams MMR, does not call external for data
function updateTeamMmr(team) {
    if (typeof team == 'string') {
        team = team.toLowerCase();
        team = { teamName_lower: team }
    }

    Team.findOne({ teamName_lower: team.teamName_lower }).then((foundTeam) => {
        let members = [];
        foundTeam.teamMembers.forEach(element => {
            members.push(element.displayName);
        });
        topMemberMmr(members).then((processed) => {
            if (processed) {
                foundTeam.teamMMRAvg = processed.averageMmr;
                foundTeam.hpMmrAvg = processed.heroesProfileAvgMmr;
                foundTeam.ngsMmrAvg = processed.ngsAvgMmr;
                foundTeam.save().then(saved => {
                    //empty promises
                }, err => {
                    //empty promises
                })
            } else {
                //empty promises
            }
        });
    }, (err) => {
        util.errLogger(location, err, 'updateMmr routine failed')
    });
}

//calculates the mmr of the highest mmr members of the team
//members: string array
//returns average mmrs or Null
async function topMemberMmr(members) {

    try {

        //fetch all users from the dB
        let returnVal = {
            'averageMmr': null,
            'heroesProfileAvgMmr': null,
            'ngsAvgMmr': null
        };
        let users = await User.find({
            displayName: {
                $in: members
            }
        }).lean().then((users) => {
            return users;
        }, (err) => {
            return null
        });

        if (users && users.length > 0) {
            let mmrArr = [];
            let hpMmrArr = [];
            let ngsMmrArr = [];
            //get all users mmrs
            users.forEach(user => {
                if (util.returnBoolByPath(user, 'averageMmr')) {
                    mmrArr.push(user.averageMmr);
                }
                if (util.returnBoolByPath(user, 'heroesProfileMmr')) {
                    if (util.returnBoolByPath(user, 'lowReplays') && user.lowReplays) {
                        // this users replays we're too low to trust!
                    } else {
                        hpMmrArr.push(user.heroesProfileMmr);
                    }
                }
                if (util.returnBoolByPath(user, 'ngsMmr')) {
                    ngsMmrArr.push(user.ngsMmr);
                }
            });

            //sort mmrs
            mmrArr = removeZeroIndicies(mmrArr);
            if (mmrArr.length > 0) {
                mmrArr.sort((a, b) => {
                    if (a > b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                //calculate average of the top N mmrs
                let total = 0;
                let membersUsed = 0;
                if (mmrArr.length >= numberOfTopMembersToUse) {
                    membersUsed = numberOfTopMembersToUse;
                } else {
                    membersUsed = mmrArr.length;
                }

                for (let i = 0; i < membersUsed; i++) {
                    total += mmrArr[i];
                }

                let average = total / membersUsed;
                if (!isNaN(average)) {
                    average = Math.round(average);
                }

                returnVal.averageMmr = average;
            }
            hpMmrArr = removeZeroIndicies(hpMmrArr);
            if (hpMmrArr.length > 0) {
                hpMmrArr.sort((a, b) => {
                    if (a > b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                //calculate average of the top N mmrs
                let total = 0;
                let membersUsed = 0;
                if (hpMmrArr.length >= numberOfTopMembersToUse) {
                    membersUsed = numberOfTopMembersToUse;
                } else {
                    membersUsed = hpMmrArr.length;
                }

                for (let i = 0; i < membersUsed; i++) {
                    total += hpMmrArr[i];
                }

                let average = total / membersUsed;
                if (!isNaN(average)) {
                    average = Math.round(average);
                }

                returnVal.heroesProfileAvgMmr = average;
            }
            ngsMmrArr = removeZeroIndicies(ngsMmrArr);

            if (ngsMmrArr.length > 0) {
                ngsMmrArr.sort((a, b) => {
                    if (a > b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                //calculate average of the top N mmrs
                let total = 0;
                let membersUsed = 0;
                if (ngsMmrArr.length >= numberOfTopMembersToUse) {
                    membersUsed = numberOfTopMembersToUse;
                } else {
                    membersUsed = ngsMmrArr.length;
                }

                for (let i = 0; i < membersUsed; i++) {
                    total += ngsMmrArr[i];
                }

                let average = total / membersUsed;
                if (!isNaN(average)) {
                    average = Math.round(average);
                }

                returnVal.ngsAvgMmr = average;
            }
        }
        // return the average
        return returnVal;

    } catch (err) {
        util.errLogger(location, err, 'topMemberMmr');
        throw err;
    }

}

//this is used to calculate MMRS on the fly for admin to apporve a team add
//userMmrToadd: string or number of the average mmr of a player who is being added to a team
//members:string array of the current members of a team
async function resultantMMR(userMmrToAdd, members) {
    //get the members from the db
    let usersMmr = await User.find({
        displayName: {
            $in: members
        }
    }).lean().then((users) => {
        if (users && users.length > 0) {
            let mmrArr = [];
            //get all the users MMR
            users.forEach(user => {
                if (util.returnBoolByPath(user, 'averageMmr')) {
                    mmrArr.push(user.averageMmr);
                }
            });
            //add the mmr of the player to add
            mmrArr.push(userMmrToAdd);
            if (mmrArr.length > 1) {
                mmrArr.sort((a, b) => {
                    if (a > b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                let total = 0;
                let membersUsed;
                if (mmrArr.length >= numberOfTopMembersToUse) {
                    membersUsed = numberOfTopMembersToUse;
                } else {
                    membersUsed = mmrArr.length;
                }
                for (let i = 0; i < membersUsed; i++) {
                    total += mmrArr[i];
                }

                let average = total / membersUsed;
                if (!isNaN(average)) {
                    average = Math.round(average);
                }
                return average;
            } else {
                return null;
            }
        }
    }, (err) => {
        return null
    });
    //return the avg
    return usersMmr;
}


//removes user from team
//team:string - teamname;
//user: string - battletag
function removeUser(team, user) {
    team = team.toLowerCase();
    //grab team from the db
    Team.findOne({ teamName_lower: team }).then((foundTeam) => {
        //get the index of the user from the members array
        let index;
        for (var i = 0; i < foundTeam.teamMembers; i++) {
            let element = foundTeam.teamMembers[i];
            if (element.displayName == user) {
                index = i;
            }
        }
        //remove the user from the members array and save the team.
        if (index && index > -1) {
            foundTeam.teamMembers.splice(index, 1);
            foundTeam.save().then((saved) => {
                util.errLogger(location, null, 'user successfully removed from team');
            }, (err) => {
                util.errLogger(location, err, 'error saving team, removeUser sub');
            })
        } else {
            util.errLogger(location, null, 'no changes were made to the team, couldnt find user in team members')
        }
    }, (err) => {
        util.errLogger(location, err, 'remove player routine failed.')
    })
}

//removes any instances of a username from any teams
//username: string - battletag
function scrubUserFromTeams(username) {

    //find teams that have the user in the pending members
    Team.find({
        'pendingMembers.displayName': username
    }).exec().then(
        (foundTeams) => {
            util.errLogger(location, null, 'pendingMembers Scrub a ' + foundTeams)
            if (foundTeams && foundTeams.length > 0) {
                //iterate through the teams the user was foudn in
                util.errLogger(location, null, 'pendingMembers Scrub b')
                foundTeams.forEach(element => {
                    let save = false;
                    let pendingMembers = util.returnByPath(element.toObject(), 'pendingMembers');
                    //find the index of the user and remove them
                    if (pendingMembers.length > 0) {
                        for (var i = 0; i < pendingMembers.length; i++) {
                            if (pendingMembers[i].displayName == username) {
                                element.pendingMembers.splice(i, 1);
                                save = true;
                            }
                        }
                    }
                    //save the team
                    if (save) {
                        element.save();
                    }
                })
            }
        }
    );

    //find all teams where the user is a team member
    Team.find({
        'teamMembers.displayName': username
    }).exec().then(
        (foundTeams) => {
            if (foundTeams && foundTeams.length > 0) {
                //iterate through the teams
                foundTeams.forEach(element => {
                    let save = false;
                    let members = util.returnByPath(element.toObject(), 'teamMembers');
                    if (members.length > 0) {
                        //find the index of the user and remove it
                        for (var i = 0; i < members.length; i++) {
                            if (members[i].displayName == username) {
                                element.teamMembers.splice(i, 1);
                                save = true;
                            }
                        }
                    }
                    //save the team
                    if (save) {
                        element.save();
                    }
                })
            }
        }
    );
};

//will update all received teams history that they have been added to a division once the division has been set to public:
function updateDivisionHistory(teams, divisionName) {

    let logObj = {};
    logObj.actor = 'SYSTEM; updateDivisionHistory';
    logObj.action = ' updating team division history';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    SeasonInfoCommon.getSeasonInfo().then(
        rep => {
            let seasonNum = rep.value;

            Team.find({
                teamName: {
                    $in: teams
                }
            }).then(
                foundTeams => {
                    for (var i = 0; i < foundTeams.length; i++) {
                        let teamObj = foundTeams[i].toObject()
                        if (!teamObj.hasOwnProperty('history')) {
                            foundTeams[i].history = [{
                                timestamp: Date.now(),
                                action: 'Added to division',
                                target: divisionName,
                                season: seasonNum
                            }]
                        } else {
                            foundTeams[i].history.push({
                                timestamp: Date.now(),
                                action: 'Added to division',
                                target: divisionName,
                                season: seasonNum
                            })
                        }
                        foundTeams[i].markModified('history');
                        foundTeams[i].save();
                    }
                },
                err => {
                    logObj.logLevel = 'ERROR';
                    logObj.error = err;
                    logger(logObj);
                }
            )
        }
    )


}


//will find all the matches that  team is associated to and will update the team name that is in the 
//match object
function updateTeamMatches(team) {
    //find all matches that has the team in the away or home 
    let id = team._id.toString();
    Match.find({
        $or: [{
            'away.id': id
        }, {
            'home.id': id
        }]
    }).then((found) => {
        if (found) {
            //add the team name to the matches that were found
            team.teamName = team.teamName + ' (withdrawn)';
            team.teamName_lower = team.teamName_lower + ' (withdrawn)';
            addTeamNamesToMatch(team, found).then(
                res => {
                    util.errLogger(location, null, 'matches modified');
                },
                err => {
                    util.errLogger(location, err, 'error occurred');
                }
            )

        }
    }, (err) => {
        util.errLogger(location, err, 'error finding matches');
    });

}

module.exports = {
    updateTeamMmr: updateTeamMmr,
    removeUser: removeUser,
    scrubUserFromTeams: scrubUserFromTeams,
    upsertTeamsDivision: upsertTeamsDivision,
    resultantMMR: resultantMMR,
    returnTeamMMR: topMemberMmr,
    updateTeamMmrAsynch: updateTeamMmrAsynch,
    updateTeamMatches: updateTeamMatches,
    updateTeamDivHistory: updateDivisionHistory
}

function removeZeroIndicies(arr) {
    let zerosIndicies = [];
    arr.forEach((val, index) => {
        if (val == 0) {
            zerosIndicies.push(index);
        }
    });
    for (var i = zerosIndicies.length; i > 0; i--) {
        arr.splice(zerosIndicies[i - 1], 1);
    }
    return arr;
}


//helper function to update team names in matches after a team name change
async function addTeamNamesToMatch(team, found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }
    let teamid = team._id.toString();
    //loop through all the found matches
    found.forEach(match => {
        let homeid, awayid;
        if (util.returnBoolByPath(match.toObject(), 'home.id')) {
            homeid = match.home.id.toString();
        }
        if (util.returnBoolByPath(match.toObject(), 'away.id')) {
            awayid = match.away.id.toString();
        }
        //if the provided team id matches the homeid them update the home team info, if it 
        //equals the away team id update the away team info
        if (teamid == homeid) {
            match.home['teamName'] = team.teamName;
            match.home['logo'] = team.logo;
            match.home['teamName_lower'] = team.teamName_lower;
            match.home['ticker'] = team.ticker;
            match.markModified('home');
        }
        if (teamid == awayid) {
            match.away['teamName'] = team.teamName;
            match.away['logo'] = team.logo;
            match.away['teamName_lower'] = team.teamName_lower;
            match.away['ticker'] = team.ticker;
            match.markModified('away');
        }

    });
    let saved = [];
    for (var i = 0; i < found.length; i++) {
        let save = await found[i].save().then(res => { return res; }, err => { return null });
        saved.push(save);
    }

    return saved;
}