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

module.exports = {
    scrubUser: scrubUser,
    clearUsersTeam: clearUsersTeam
}