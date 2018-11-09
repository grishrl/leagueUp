const util = require('../utils');
const User = require('../models/user-models');
const TeamSubs = require('./team-subs');
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
        User.findOne({
            displayName: user.displayName
        }).then((foundUser) => {
            if (foundUser) {
                foundUser.teamInfo = {};
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
    });
}

function toggleCaptain(user) {
    User.findOne({ displayName: user }).then((foundUser) => {
        //get the value in teamInfo, is captain, will be boolean if it's been set before
        let changed = false;
        let isCap = util.returnByPath(foundUser, 'teamInfo.isCaptain');
        //if this is a boolean value, toggle it
        if (typeof isCap == 'boolean') {
            changed = true;
            foundUser.teamInfo.isCaptain = !foundUser.teamInfo.isCaptain;
        } else {
            //it the iscaptain didnt exist would be false by default, turn it on
            if (util.returnBoolByPath(foundUser, 'teamInfo')) {
                changed = true;
                foundUser.teamInfo.isCaptain = true;
            } else {
                //if for some reason this user didn't have a team, whats the play?
                //I think it's best to do nothing for now.
            }
        }
        if (changed) {
            foundUser.save((save) => {
                console.log(save.displayName + ' user profile update cpttoggle');
            }, (err) => {
                console.log('cpt toggle error saving user profile');
            });
        }

    }, (err) => {
        console.log('error toggling user as captain ', err);
    })
}

module.exports = {
    scrubUser: scrubUser,
    clearUsersTeam: clearUsersTeam,
    toggleCaptain: toggleCaptain
}