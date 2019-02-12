const util = require('../utils');
const Team = require('../models/team-models');
const User = require('../models/user-models');
const Match = require('../models/match-model');
const request = require('request');
const logger = require('./sys-logging-subs');
const axios = require('axios');

function routeFriendlyUsername(username) {
    if (username != null && username != undefined) {
        return username.replace('#', '_');
    } else {
        return '';
    }
}

let reqURL = 'https://api.hotslogs.com/Public/Players/1/';
async function hotslogs(url, btag) {
    let val = 0;
    try {
        // console.log(url + btag);
        const response = await axios.get(url + routeFriendlyUsername(btag));
        let data = response.data;
        var inc = 0
        var totalMMR = 0;
        var avgMMR = 0;
        data['LeaderboardRankings'].forEach(element => {
            if (element['GameMode'] != 'QuickMatch') {
                if (element['CurrentMMR'] > 0) {
                    inc += 1;
                    totalMMR += element.CurrentMMR;
                }
            }
        });
        avgMMR = Math.round(totalMMR / inc);
        val = avgMMR;
    } catch (error) {
        val = null;
    }
    return val;
};

const numberOfTopMembersToUse = 4;

//subroutine to update teams division
function upsertTeamsDivision(teams, division) {
    teams.forEach(team => {
        upsertTeamDivision(team, division);
    });
}

function upsertTeamDivision(team, division) {
    let fteam;
    if (typeof team == 'object') {
        fteam = team.teamName_lower.toLowerCase();
    } else {
        fteam = team.toLowerCase();
    }

    Team.findOne({ teamName_lower: fteam }).then((foundTeam) => {
        if (foundTeam) {
            foundTeam.divisionDisplayName = division.displayName;
            foundTeam.divisionConcat = division.divisionConcat;
            foundTeam.save((success) => {
                console.log('team division updated');
            }, (err) => {
                console.log('team saving error');
            })
        }
    }, (err) => {
        console.log('found team error')
    })
}

//update mmrs asynch
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
            let mmr = await hotslogs(reqURL, member);

            let player = await User.findOne({ displayName: member }).then(
                found => { return found; },
                err => { return null; }
            )
            logObj.target += member + ' ';
            let savedPlayer;
            if (player) {
                player.averageMmr = mmr;
                savedPlayer = await player.save().then(
                    saved => { return saved; },
                    err => { return null; }
                )
            }


        }
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
    let updatedTeam;
    if (processMembersMMR) {
        retrievedTeam.teamMMRAvg = processMembersMMR;
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
                foundTeam.teamMMRAvg = processed;
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

async function topMemberMmr(members) {
    let usersMmr = await User.find({ displayName: { $in: members } }).lean().then((users) => {

        if (users && users.length > 0) {
            let mmrArr = [];
            users.forEach(user => {
                if (util.returnBoolByPath(user, 'averageMmr')) {
                    mmrArr.push(user.averageMmr);
                }
            });

            if (mmrArr.length > 1) {
                mmrArr.sort((a, b) => {
                    if (a > b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
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
                return average;
            } else {
                return mmrArr[0];
            }
        }
    }, (err) => {
        return null
    });
    return usersMmr;
}

//this is used to calculate MMRS on the fly for admin to apporve a team add
async function resultantMMR(userMmrToAdd, members) {
    let usersMmr = await User.find({
        displayName: {
            $in: members
        }
    }).lean().then((users) => {
        if (users && users.length > 0) {
            let mmrArr = [];
            users.forEach(user => {
                if (util.returnBoolByPath(user, 'averageMmr')) {
                    mmrArr.push(user.averageMmr);
                }
            });
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
    return usersMmr;
}

function removeUser(team, user) {
    team = team.toLowerCase();
    Team.findOne({ teamName_lower: team }).then((foundTeam) => {
        let index;
        for (var i = 0; i < foundTeam.teamMembers; i++) {
            let element = foundTeam.teamMembers[i];
            if (element.displayName == user) {
                index = i;
            }
        }
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

function scrubUserFromTeams(username) {

    Team.find({
        'pendingMembers.displayName': username
    }).exec().then(
        (foundTeams) => {
            console.log('pendingMembers Scrub a ', foundTeams);
            if (foundTeams && foundTeams.length > 0) {
                console.log('pendingMembers Scrub b')
                foundTeams.forEach(element => {
                    console
                    let save = false;
                    let pendingMembers = util.returnByPath(element.toObject(), 'pendingMembers');
                    if (pendingMembers.length > 0) {
                        for (var i = 0; i < pendingMembers.length; i++) {
                            if (pendingMembers[i].displayName == username) {
                                element.pendingMembers.splice(i, 1);
                                save = true;
                            }
                        }
                    }
                    if (save) {
                        console.log('pendingMembers Scrub save')
                        element.save();
                    }
                })
            }
        }
    );
    Team.find({
        'teamMembers.displayName': username
    }).exec().then(
        (foundTeams) => {
            console.log('teamMembers Scrub a ', foundTeams);
            if (foundTeams && foundTeams.length > 0) {
                console.log('teamMembers Scrub b')
                foundTeams.forEach(element => {
                    let save = false;
                    let members = util.returnByPath(element.toObject(), 'teamMembers');
                    if (members.length > 0) {
                        for (var i = 0; i < members.length; i++) {
                            if (members[i].displayName == username) {
                                element.teamMembers.splice(i, 1);
                                save = true;
                            }
                        }
                    }
                    if (save) {
                        console.log('teamMembers Scrub saving')
                        element.save();
                    }
                })
            }
        }
    );
};

function updateTeamMatches(team) {

    Match.find({
        $or: [{
            'away.id': team._id
        }, {
            'home.id': team._id
        }]
    }).then((found) => {
        if (found) {

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

async function addTeamNamesToMatch(team, found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }
    let teamid = team._id.toString();
    found.forEach(match => {
        let homeid, awayid;
        if (util.returnBoolByPath(match, 'home.id')) {
            homeid = match.home.id.toString();
        }
        if (util.returnBoolByPath(match, 'away.id')) {
            awayid = match.away.id.toString();
        }
        if (teamid == homeid) {
            match.home['teamName'] = team.teamName;
            match.home['logo'] = team.logo;
            match.home['teamName_lower'] = team.teamName_lower;
        }
        if (teamid == awayid) {
            match.away['teamName'] = team.teamName;
            match.away['logo'] = team.logo;
            match.away['teamName_lower'] = team.teamName_lower;
        }
    });
    let saved = [];
    for (var i = 0; i < found; i++) {
        let save = await found[i].save().then(res => { return res; }, err => { return null });
    }
    return saved;
}