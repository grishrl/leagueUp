const util = require('../utils');
const User = require('../models/user-models');
const TeamSubs = require('./team-subs');
const Team = require('../models/team-models');
const QueueSubs = require('./queue-subs');
const logger = require('./sys-logging-subs').logger;
const SeasonInfoCommon = require('../methods/seasonInfoMethods');

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

//accept user: object
// remove all team info from the provided user object
function clearUserTeam(user) {
    let logObj = {};
    logObj.actor = 'SYSTEM; clearUserTeam ';
    logObj.action = ' remove all team info from user ';
    logObj.target = user.displayName;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    //get the user from the db associated with this user
    SeasonInfoCommon.getSeasonInfo().then(
        (rep) => {
            let seasonNum = rep.value;
            User.findOne({
                displayName: user.displayName
            }).then((foundUser) => {
                //update the fetched users info
                if (foundUser) {
                    foundUser.teamId = null;
                    let teamname = foundUser.teamName;
                    foundUser.teamName = null;
                    foundUser.isCaptain = null;
                    if (foundUser.history) {
                        foundUser.history.push({
                            timestamp: Date.now(),
                            action: 'Left team',
                            target: teamname,
                            season: seasonNum
                        });
                    } else {
                        foundUser.history = [{
                            timestamp: Date.now(),
                            action: 'Left team',
                            target: teamname,
                            season: seasonNum
                        }];
                    }
                    foundUser.save().then((savedUser) => {
                        logger(logObj);
                    }, (err) => {
                        logObj.logLevel = 'ERROR';
                        logObj.error = err;
                        logger(logObj);
                    });
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'user not found';
                    logger(logObj);
                }
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
            });
        }
    )

}

//update an array of users team info
function upsertUsersTeamName(users, team, teamid) {
    users.forEach(function(user) {
        upsertUserTeamName(user, team, teamid);
    });
}

//update a users team info
function upsertUserTeamName(user, team, teamid) {
    let logObj = {};
    logObj.actor = 'SYSTEM; upsertUserTeamName ';
    logObj.action = 'Update users team name in team';
    logObj.target = user.displayName;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    SeasonInfoCommon.getSeasonInfo().then(
        (rep) => {
            let seasonNum = rep.value;
            User.findOne({
                displayName: user.displayName
            }).then((foundUser) => {
                if (foundUser) {
                    foundUser.teamName = team;
                    foundUser.teamId = teamid;
                    if (foundUser.history) {
                        foundUser.history.push({
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: team,
                            season: seasonNum
                        });
                    } else {
                        foundUser.history = [{
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: team,
                            season: seasonNum
                        }];
                    }
                    foundUser.save().then((savedUser) => {
                        logger(logObj);
                    }, (err) => {
                        logObj.logLevel = 'ERROR';
                        logObj.error = err;
                        logger(logObj);
                    });
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'User was not found.';
                    logger(logObj);
                }
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
            });
        }
    )

}

function setCaptain(user) {
    let logObj = {};
    logObj.actor = 'SYSTEM; toggleCaptain ';
    logObj.action = 'set Team Captain Status';
    logObj.target = user;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    User.findOne({
        displayName: user
    }).then((foundUser) => {

        foundUser.isCaptain = true;

        foundUser.save().then((save) => {
            logger(logObj);
        }, (err) => {
            logObj.logLevel = 'ERROR';
            logObj.error = err;
            logger(logObj);
        });


    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj);
    });
}

function removeCaptain(user) {
    let logObj = {};
    logObj.actor = 'SYSTEM; toggleCaptain ';
    logObj.action = 'remove Team Captain Status';
    logObj.target = user;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    User.findOne({
        displayName: user
    }).then((foundUser) => {

        foundUser.isCaptain = false;

        foundUser.save().then((save) => {
            logger(logObj);
        }, (err) => {
            logObj.logLevel = 'ERROR';
            logObj.error = err;
            logger(logObj);
        });


    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj);
    });
}


function toggleCaptain(user) {
    let logObj = {};
    logObj.actor = 'SYSTEM; toggleCaptain ';
    logObj.action = 'Toggle Team Captain Status';
    logObj.target = user;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
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
        if (changed) {
            foundUser.save().then((save) => {
                logger(logObj);
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
            });
        }

    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj);
    });
}

function togglePendingTeam(user) {
    let logObj = {};
    logObj.actor = 'SYSTEM; togglePendingTeam ';
    logObj.action = 'Toggle Pending Team';
    logObj.target = user;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    User.findOne({
        displayName: user
    }).then((foundUser) => {
        //get the value in teamInfo, is captain, will be boolean if it's been set before
        let changed = false;
        let pendingTeam = foundUser.pendingTeam;
        //if this is a boolean value, toggle it
        if (typeof pendingTeam == 'boolean') {
            changed = true;
            foundUser.pendingTeam = !foundUser.pendingTeam;
            foundUser.lookingForGroup = false;
        } else if (pendingTeam == null || pendingTeam == undefined) {
            changed = true;
            foundUser.pendingTeam = true;
            foundUser.lookingForGroup = false;
        }
        if (changed) {
            foundUser.save().then((save) => {
                logger(logObj);
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
            });
        }

    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj);
    });
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
            }, {
                'pendingMembers.displayName': user.displayName
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
        //if the user was a captain update their user name in the captain property
        if (team.captain == user.displayName) {
            team.captain = newUserName;
        }
        //update the user name in the team members array
        team.teamMembers.forEach(member => {
            if (member.displayName == user.displayName) {
                member.displayName = newUserName;
            }
        });
        //update the user name in the pending members array
        team.pendingMembers.forEach(member => {
            if (member.displayName == user.displayName) {
                member.displayName = newUserName;
            }
        });
        //if the user was an AC - update their name in the ac array
        if (team.assistantCaptain && team.assistantCaptain.length > 0) {
            let index = team.assistantCaptain.indexOf(user.displayName);
            if (index > -1) {
                team.assistantCaptain.splice(index, 1);
                team.assistantCaptain.push(newUserName);
            }
        }
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
    setCaptain: setCaptain,
    removeCaptain: removeCaptain,
    togglePendingTeam: togglePendingTeam,
    updateUserName: updateUserName
}