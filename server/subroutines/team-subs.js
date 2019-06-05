const util = require('../utils');
const Team = require('../models/team-models');
const User = require('../models/user-models');
const Match = require('../models/match-model');
const logger = require('./sys-logging-subs');
const mmrMethods = require('../methods/mmrMethods');



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

//update teams division info with that of the provided division
//team: object or string
//division : object, division obhect
function upsertTeamDivision(team, division) {
    let logObj = {};
    logObj.actor = 'SYSTEM; Update Team Divison';
    logObj.action = ' updating team division ';

    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    let fteam;
    if (typeof team == 'object') {
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
                // console.log('team division updated');
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
                // console.log('team saving error');
            })
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
            // console.log('found team error')
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
        console.log('updateMmr routine failed');
        return null;
    });

    //grab all the members of the team
    let members = [];
    retrievedTeam.teamMembers.forEach(element => {
        members.push(element.displayName);
    });
    //
    let processMembersMMR;
    if (members.length > 0) {
        //loop through the members of each team
        for (var i = 0; i < members.length; i++) {
            //grab a specific member
            let member = members[i];


            //call out to the hots log API grab the most updated users MMR
            // let mmr = await mmrMethods.hotslogs(member);
            // let hpMmr = await mmrMethods.heroesProfileMMR(member);

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
                    player.lowReplays = true;
                }
                player.ngsMmr = mmrInfo.ngsMmr;
                player.averageMmr = mmrInfo.hotsLogs.mmr;
                player.hotsLogsPlayerID = mmrInfo.hotsLogs.playerId;
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
                    console.log('team mmr updated successfully');
                }, err => {
                    console.log('error saving');
                })
            } else {
                console.log('there was an error');
            }
        });
    }, (err) => {
        console.log('updateMmr routine failed');
    });
}

//calculates the mmr of the highest mmr members of the team
//members: string array
//returns average mmrs or Null
async function topMemberMmr(members) {

    try {

        //fetch all users from the dB
        let returnVal = {
            'averageMmr': 0,
            'heroesProfileAvgMmr': 0,
            'ngsAvgMmr': 0
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
        console.log(err);
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
                console.log('user successfully removed from team');
            }, (err) => {
                console.log('error saving team, removeUser sub');
            })
        } else {
            console.log('no changes were made to the team, couldnt find user in team members');
        }
    }, (err) => {
        console.log('remove player routine failed.');
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
            console.log('pendingMembers Scrub a ', foundTeams);
            if (foundTeams && foundTeams.length > 0) {
                //iterate through the teams the user was foudn in
                console.log('pendingMembers Scrub b')
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
                        console.log('pendingMembers Scrub save')
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
            console.log('teamMembers Scrub a ', foundTeams);
            if (foundTeams && foundTeams.length > 0) {
                console.log('teamMembers Scrub b')
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
                        console.log('teamMembers Scrub saving')
                        element.save();
                    }
                })
            }
        }
    );
};


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
                    console.log('matches modified')
                },
                err => {
                    console.log('error occurred');
                }
            )

        } else {
            console.log('no matches found')
        }
    }, (err) => {
        console.log('error finding matches');
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
    updateTeamMatches: updateTeamMatches
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
            match.markModified('home');
        }
        if (teamid == awayid) {
            match.away['teamName'] = team.teamName;
            match.away['logo'] = team.logo;
            match.away['teamName_lower'] = team.teamName_lower;
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