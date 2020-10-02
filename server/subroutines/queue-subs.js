/**
 *  Queue subroutines - methods for adminsitering the queues
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */

const Admin = require('../models/admin-models');
const util = require('../utils');
const logger = require('./sys-logging-subs').logger;


/**
 * @name cleanUpPendingQueue
 * @function
 * @description method to remove provided queue item
 * @param {Object} item 
 */
function cleanUpPendingQueue(item) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE cleanUpPendingQueue';
    logObj.action = ' remove pending queue item ';
    logObj.target = JSON.stringify(util.objectify(item));
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    Admin.PendingQueue.findByIdAndDelete(item._id).then((deleted) => {
        logger(logObj);
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
    })
}

//
/**
 * @name removePendingAvatarQueue
 * @function
 * @description pending avatar items via user id and file name
 * @param {string} userId 
 * @param {string} fileName 
 */
function removePendingAvatarQueue(userId, fileName) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE cleanUpPendingQueue';
    logObj.action = ' remove pending avatar queue item ';
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    Admin.PendingAvatarQueue.findOneAndDelete({
        $and: [
            { userId: userId },
            { fileName: fileName }
        ]
    }).then((deleted) => {
        logObj.target = deleted;
        logger(logObj);
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
    })
}

/**
 * @name removePendingByTeamAndUser
 * @function
 * @description removes a pending memeber queue item of given team and username
 * @param {string} teamId 
 * @param {string} teamname 
 * @param {string} userId 
 * @param {string} username 
 */
function removePendingByTeamAndUser(teamId, teamname, userId, username) {

    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE removePendingByTeamAndUser';
    logObj.action = ' remove pending queue item ';
    logObj.target = teamname + ' : ', username;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    teamname = teamname.toLowerCase();
    //find the queue item of specified team/user combo
    Admin.PendingQueue.find({
        $and: [{
                teamId: teamId
            },
            {
                userId: userId
            }
        ]
    }).then((toDelete) => {
        if (toDelete && toDelete.length > 0) {
            //iterate through each element
            toDelete.forEach(ele => {
                //remove the element
                Admin.PendingQueue.findByIdAndDelete(ele._id).then(
                    deleted => {
                        logObj.target = deleted;
                        logger(logObj);
                    },
                    err => {
                        logObj.logLevel = "ERROR";
                        logObj.error = err;
                        logger(logObj);
                    }
                );
            });
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
    })
}


/**
 * @name removePendingQueueByUsername
 * @function
 * @description removes pending member queues by userneame
 * @param {string} username 
 */
function removePendingQueueByUsername(username) {
    //find all pending member queues by this user name
    Admin.PendingQueue.find({ userName: username }).then((toDelete) => {
        if (toDelete && toDelete.length > 0) {
            //iterate through and delete them
            toDelete.forEach(ele => {
                ele.remove();
                util.errLogger('queue-subs', null, username + ' scrubbed from pending queue.');
            });
        }
    }, (err) => {
        util.errLogger('queue-subs', err, 'Error ' + username + ' not removed from queue')
    })
}

//
//teamLower:string - team name as lower case;
//user:string battle tag of user
/**
 * @name addToPendingTeamMemberQueue
 * @function
 * @description creates pending member queue for a specified user to the specified team
 * @param {string} teamId 
 * @param {string} teamLower 
 * @param {string} userId 
 * @param {string} user 
 */
function addToPendingTeamMemberQueue(teamId, teamLower, userId, user) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE addToPendingTeamMemberQueue';
    logObj.action = ' create pending queue item ';
    logObj.target = teamLower + ' : ', user;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    teamLower = teamLower.toLowerCase();
    if (util.isNullorUndefined(teamLower) && util.isNullorUndefined(user) && util.isNullorUndefined(teamId) && util.isNullorUndefined(userId)) {
        logObj.error = 'addToPendingTeamMemberQueue got emtpy teamname / username '
    } else {
        //create a new queue of the recieved team and username
        Admin.PendingQueue({
            "teamId": teamId,
            "teamName": teamLower,
            "userId": userId,
            "userName": user
        }).save().then((savedQueue) => {
            logger(logObj);
        }, (err) => {
            logObj.logLevel = 'ERROR';
            logObj.error = err;
            logger(logObj);
        });
    }
}


module.exports = {
    removePendingQueue: cleanUpPendingQueue,
    removePendingByTeamAndUser: removePendingByTeamAndUser,
    addToPendingTeamMemberQueue: addToPendingTeamMemberQueue,
    removePendingQueueByUsername: removePendingQueueByUsername,
    removePendingAvatarQueue: removePendingAvatarQueue
}