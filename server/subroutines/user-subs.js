const User = require('../models/user-models');
const TeamSubs = require('./team-subs');
const QueueSubs = require('./queue-subs');

//sub to handle complete removal of user from data locations:
//pendingqueue, teams - pending members and members.
function scrubUser(username) {
    QueueSubs.removePendingQueueByUsername(username);
    TeamSubs.scrubUserFromTeams(username);
}

module.exports = {
    scrubUser: scrubUser
}