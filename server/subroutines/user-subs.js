const util = require('../utils');
const User = require('../models/user-models');
const TeamSubs = require('./team-subs');
const Team = require('../models/team-models');
const QueueSubs = require('./queue-subs');

//sub to handle complete removal of user from data locations:
//pendingqueue, teams - pending members and members.
function scrubUser(username) {
    QueueSubs.removePendingQueueByUsername(username);
    TeamSubs.scrubUserFromTeams(username);
}

//when a team is deleted the users must have the team info removed from their object.
//accepts an array of users (those removed) and updates their object to be empty
function clearUsersTeam(usersRemoved) {
    usersRemoved.forEach(function(user) {
        clearUserTeam(user);
    });
}


function clearUserTeam(user) {
    User.findOne({
        displayName: user.displayName
    }).then((foundUser) => {
        if (foundUser) {
            foundUser.teamId = null;
            foundUser.teamName = null;
            foundUser.isCaptain = null;
            foundUser.save().then((savedUser) => {
                console.log('need some persistent logging');
            }, (err) => {
                console.log('need some persistent logging');
            });
        } else {
            console.log('need some persistent logging');
        }
    }, (err) => {
        console.log('need some persistent logging');
    });
}

function upsertUsersTeamName(users, team) {
    users.forEach(function(user) {
        upsertUserTeamName(user, team);
    });
}

function upsertUserTeamName(user, team) {
    User.findOne({
        displayName: user.displayName
    }).then((foundUser) => {
        if (foundUser) {
            foundUser.teamName = team;
            foundUser.save().then((savedUser) => {
                console.log('need some persistent logging');
            }, (err) => {
                console.log('need some persistent logging');
            });
        } else {
            console.log('need some persistent logging');
        }
    }, (err) => {
        console.log('need some persistent logging');
    });
}


function toggleCaptain(user) {
    console.log(user);
    User.findOne({ displayName: user }).then((foundUser) => {
        //get the value in teamInfo, is captain, will be boolean if it's been set before
        let changed = false;
        let isCap = util.returnByPath(foundUser.toObject(), 'isCaptain');
        //if this is a boolean value, toggle it
        if (typeof isCap == 'boolean') {
            changed = true;
            foundUser.isCaptain = !foundUser.isCaptain;
        } else {
            //iF the iscaptain didnt exist would be false by default, turn it on
            if (!util.returnBoolByPath(foundUser.toObject(), 'isCaptain')) {
                changed = true;
                foundUser.isCaptain = true;
            }
        }
        console.log(user, ' changed: ', changed)
        if (changed) {
            foundUser.save().then((save) => {
                console.log(save.displayName + ' user profile update cpttoggle');
            }, (err) => {
                console.log('cpt toggle error saving user profile');
            });
        }

    }, (err) => {
        console.log('error toggling user as captain ', err);
    })
}

function togglePendingTeam(user) {
    User.findOne({
        displayName: user
    }).then((foundUser) => {
        console.log('foundUser ', foundUser);
        //get the value in teamInfo, is captain, will be boolean if it's been set before
        let changed = false;
        let pendingTeam = foundUser.pendingTeam;
        //if this is a boolean value, toggle it
        if (typeof pendingTeam == 'boolean') {
            changed = true;
            foundUser.pendingTeam = !foundUser.pendingTeam;
        } else if (pendingTeam == null || pendingTeam == undefined) {
            changed = true;
            foundUser.pendingTeam = true;
        }
        console.log(changed);
        if (changed) {
            foundUser.save().then((save) => {
                console.log(save.displayName + ' user profile update pendingTeamToggle');
            }, (err) => {
                console.log('pendingteam toggle error saving user profile');
            });
        }

    }, (err) => {
        console.log('error toggling user as pending ', err);
    })
}

async function updateUserName(id, newUserName) {
    let user = await User.findById(id).then(
        (foundUser) => {
            if (foundUser) {
                return foundUser;
            } else {
                return null;
            }
        },
        (err) => {
            return null;
        }
    );
    let team = await Team.findOne({
        $or: [{
                captain: user.displayName
            },
            {
                'teamMembers.displayName': user.displayName
            }
        ]
    }).then((foundTeam) => {
        if (foundTeam) {
            return foundTeam;
        } else {
            return null;
        }
    }, (err) => {
        return null;
    });
    if (team) {
        if (team.captain == user.displayName) {
            team.captain = newUserName;
        }
        team.teamMembers.forEach(member => {
            if (member.displayName == user.displayName) {
                member.displayName = newUserName;
            }
        });
        let teamSave = await team.save().then(
            (saved) => { return saved; },
            (err) => { return null; }
        );
    }
    user.displayName = newUserName;
    let userSave = await user.save().then(saved => {
        return saved;
    }, err => {
        return null;
    });

    return userSave;
}

module.exports = {
    scrubUser: scrubUser,
    clearUsersTeam: clearUsersTeam,
    upsertUsersTeamName: upsertUsersTeamName,
    toggleCaptain: toggleCaptain,
    togglePendingTeam: togglePendingTeam,
    updateUserName: updateUserName
}