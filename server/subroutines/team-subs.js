const util = require('../utils');
const Team = require('../models/team-models');
const User = require('../models/user-models');

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

//subroutine to update a teams average mmr, this will run when it is passed a team
function updateTeamMmr(team) {
    console.log('welcome to the sub ', team)
    Team.findOne({ teamName_lower: team.teamName_lower }).then((foundTeam) => {
        let members = [];
        foundTeam.teamMembers.forEach(element => {
            members.push(element.displayName);
        });
        User.find({ displayName: { $in: members } }).then((users) => {
            if (users && users.length > 0) {
                let length = 0;
                let total = 0;
                users.forEach(user => {
                    if (util.returnBoolByPath(user.toObject(), 'averageMmr')) {
                        total += user.averageMmr;
                        length += 1;
                    }
                });
                if (total > 1) {
                    foundTeam.teamMMRAvg = Math.round(total / length);
                } else {
                    console.log('we had a zero total');
                }
                foundTeam.save();
            }
        }, (err) => {
            console.log('updateMmr routine failed');
        })
    }, (err) => {
        console.log('updateMmr routine failed');
    });
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
}

module.exports = {
    updateTeamMmr: updateTeamMmr,
    removeUser: removeUser,
    scrubUserFromTeams: scrubUserFromTeams,
    upsertTeamsDivision: upsertTeamsDivision
}