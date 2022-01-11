/**
 * User Subs: subroutines that can be called that we just want the work done; generally not waiting on their reply before the route replys or server continues work
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */
const util = require('../utils');
const User = require('../models/user-models');
const TeamSubs = require('./team-subs');
const Team = require('../models/team-models');
const QueueSubs = require('./queue-subs');
const logger = require('./sys-logging-subs').logger;
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const TeamClass = require('../methods/team/Team');

//sub to handle complete removal of user from data locations:
//pendingqueue, teams - pending members and members.

/**
 * @name scrubUser
 * @function
 * @description removes given user name from various locations; pending member queue and any team objects
 * 
 * @param {string} username string: username
 */
function scrubUser(username) {
    QueueSubs.removePendingQueueByUsername(username);
    TeamSubs.scrubUserFromTeams(username);
}


/**
 * @name clearUsersTeam
 * @function
 * @description removes team data from provided list of users
 * 
 * @param {Array.<User>} usersRemoved : Array of user objects
 */
function clearUsersTeam(usersRemoved, wasPending) {
    usersRemoved.forEach(function(user) {
        clearUserTeam(user, wasPending);
    });
}


/**
 * @name clearUserTeam
 * @function 
 * @description remove all team info from the provided user object
 * 
 * @param {User} user : User object
 */
function clearUserTeam(user, wasPending) {

    let username;

    if (typeof user == 'string') {
        username = user;
    } else if (typeof user == 'object' && util.returnBoolByPath(user, 'displayName')) {
        username = user.displayName;
    }


    if (username) {
        let logObj = {};
        logObj.actor = 'SYSTEM; clearUserTeam ';
        logObj.action = ' remove all team info from user ';
        logObj.target = username;
        logObj.timeStamp = new Date().getTime();
        logObj.logLevel = 'STD';
        //get the user from the db associated with this user
        SeasonInfoCommon.getSeasonInfo().then(
            (rep) => {
                let seasonNum = rep.value;
                User.findOne({
                    displayName: username
                }).then((foundUser) => {
                    //update the fetched users info
                    if (foundUser) {

                        foundUser.teamId = null;
                        let teamname = foundUser.teamName;
                        foundUser.teamName = null;
                        foundUser.isCaptain = null;
                        foundUser.pendingTeam = false;
                        // check to make sure we are not adding history to a player for a pending invite being remove
                        if (!wasPending) {

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



}

/**
 * @name upsertUsersTeamName
 * @function 
 * @description update an array of users team info with provided team info
 * 
 * @param {Array.<User>} users Array of user objects to update
 * @param {string} teamName string name of team
 * @param {string} teamid string Id of team
 */
function upsertUsersTeamName(users, teamName, teamid) {
    users.forEach(function(user) {
        upsertUserTeamName(user, teamName, teamid);
    });
}


/**
 * @name upsertUserTeamName
 * @function 
 * @description update provided users team info to that provided
 * 
 * @param {User} user user object to modify
 * @param {string} teamName team name
 * @param {string} teamid team id
 */
function upsertUserTeamName(user, teamName, teamid) {

    let logObj = {};
    logObj.actor = 'SYSTEM; upsertUserTeamName ';
    logObj.action = 'Update users team name in team';
    logObj.target = user.displayName;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    //get the season value for updating user history
    SeasonInfoCommon.getSeasonInfo().then(
        (rep) => {
            let seasonNum = rep.value;
            User.findOne({
                displayName: user.displayName
            }).then((foundUser) => {
                if (foundUser) {
                    //update user team info and history
                    foundUser.teamName = teamName;
                    foundUser.teamId = teamid;
                    if (foundUser.history) {
                        foundUser.history.push({
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: teamName,
                            season: seasonNum
                        });
                    } else {
                        foundUser.history = [{
                            timestamp: Date.now(),
                            action: 'Joined team',
                            target: teamName,
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

/**
 * @name setCaptain
 * @function 
 * @description sets given user as captain true in user object
 * 
 * @param {string} user user displayName
 */
function setCaptain(user) {

    let logObj = {};
    logObj.actor = 'SYSTEM; set captain ';
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

/**
 * @name removeCaptain
 * @function 
 * @description sets given user as captain true in user object
 * 
 * @param {string} user 
 */
function removeCaptain(user) {
    let logObj = {};
    logObj.actor = 'SYSTEM; remove captain ';
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

/**
 * @name togglePendingTeam
 * @function 
 * @description inverts provided users pending team flag
 * 
 * @param {string} userName user display name
 */
function togglePendingTeam(userName) {
    let logObj = {};
    logObj.actor = 'SYSTEM; togglePendingTeam ';
    logObj.action = 'Toggle Pending Team';
    logObj.target = userName;
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    User.findOne({
        displayName: userName
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

/**
 * @name updateUserName
 * @function
 * @description update the given user name to the provided username; 
 * 10 / 2020 does this need to update pending queues ??
 * @param {string} id user Id to change
 * @param {string} newUserName new displayname
 */
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
            },
            {
                'invitedUsers': user.displayName
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
        
        //2021 TODO: some how pending members became null so check it until I can figure out a better way!
        if(util.isNullOrEmpty(team.pendingMembers)){
            team.pendingMembers = [];
        }
        //update the user name in the pending members array
        team.pendingMembers.forEach(member => {
            if (member.displayName == user.displayName) {
                member.displayName = newUserName;
                team.markModified('pendingMembers');
            }
        });
        //if the user was an AC - update their name in the ac array
        if (team.assistantCaptain && team.assistantCaptain.length > 0) {
            let index = team.assistantCaptain.indexOf(user.displayName);
            if (index > -1) {
                team.assistantCaptain.splice(index, 1);
                team.assistantCaptain.push(newUserName);
                team.markModified('assistantCaptain');
            }
        }
        //if the user was invited users...

        team.invitedUsers.forEach((invitedUser, i) => {
            if (invitedUser == user.displayName) {
                team.invitedUsers[i] = newUserName;
                team.markModified('invitedUsers');
            }
        });
        let teamSave = await team.save().then(
            (saved) => { return saved; },
            (err) => { return null; }
        );
    }
    let oldusername = user.displayName;
    user.displayName = newUserName;
    let userSave = await user.save().then(saved => {
        QueueSubs.updatePendingMemberQueueUsername(oldusername, newUserName);
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
    setCaptain: setCaptain,
    removeCaptain: removeCaptain,
    togglePendingTeam: togglePendingTeam,
    updateUserName: updateUserName
}