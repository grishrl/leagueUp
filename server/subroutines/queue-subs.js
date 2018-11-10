const Admin = require('../models/admin-models');
const util = require('../utils');

function cleanUpPendingQueue(item) {
    Admin.PendingQueue.findByIdAndDelete(item._id).then((deleted) => {
        console.log('pendingQueue item ' + deleted._id + ' deleted.');
    }, (err) => {
        console.log('err in the pending delete sub ', err);
    })
}

function cleanUpPendingQueueTeamnameUsername(teamname, username) {
    Admin.PendingQueue.find({ teamName: teamname, userName: username }).then((toDelete) => {
        if (toDelete && toDelete.length > 0) {
            toDelete.forEach(ele => {
                ele.remove();
                console.log('pendingQueue item ' + deleted._id + ' deleted.');
            });
        }
    }, (err) => {
        console.log('err in the pending delete sub ', err);
    })
}

function removePendingQueueByUsername(username) {
    Admin.PendingQueue.find({ userName: username }).then((toDelete) => {
        if (toDelete && toDelete.length > 0) {
            toDelete.forEach(ele => {
                ele.remove();
                console.log(username + ' scrubbed from pending queue.');
            });
        }
    }, (err) => {
        console.log('Error ' + username + ' not removed from queue');
    })
}

function addToPendingTeamMemberQueue(teamLower, user) {
    if (util.isNullorUndefined(teamLower) && util.isNullorUndefined(user)) {
        //persistent logging of errors in subroutines would be nice.
    } else {
        Admin.PendingQueue({
            "teamName": teamLower,
            "userName": user
        }).save().then((savedQueue) => {
            console.log('added to pendingteam member queue');
        }, (err) => {
            console.log('we had an error creating this queue');
        })
    }
}

function updatePendingMembersTeamNameChange(teamnameOld, teamnameNew) {
    Admin.PendingQueue.find({ teamName: teamnameOld }).then((foundQueue) => {
        if (foundQueue && foundQueue.length > 0) {
            foundQueue.forEach(queue => {
                queue.teamName = teamnameNew;
                queue.save().then((saved) => {
                    console.log('pending queue team name updated');
                }, (err) => {
                    console.log('err');
                });
            })
        }
    }, (err) => {
        console.log('error');
    })
}

module.exports = {
    removePendingQueue: cleanUpPendingQueue,
    removePendingByTeamAndUser: cleanUpPendingQueueTeamnameUsername,
    addToPendingTeamMemberQueue: addToPendingTeamMemberQueue,
    removePendingQueueByUsername: removePendingQueueByUsername,
    updatePendingMembersTeamNameChange: updatePendingMembersTeamNameChange
}