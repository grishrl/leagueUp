/**
 * 
 */

const Admin = require('../models/admin-models');
const util = require('../utils');
const logger = require('./sys-logging-subs');

//method to remove pending queue items via its object ID
function cleanUpPendingQueue(item) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE cleanUpPendingQueue';
    logObj.action = ' remove pending queue item ';
    logObj.target = item;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    Admin.PendingQueue.findByIdAndDelete(item._id).then((deleted) => {
        logger(logObj);
        // console.log('pendingQueue item ' + deleted._id + ' deleted.'); //static logging
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
            // console.log('err in the pending delete sub ', err); //static logging
    })
}

//removes a pending memeber queue item of given team and username
//teamname:string display name of team, username: string battle tag of the user
function cleanUpPendingQueueTeamnameUsername(teamname, username) {

    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE cleanUpPendingQueueTeamnameUsername';
    logObj.action = ' remove pending queue item ';
    logObj.target = teamname + ' : ', username;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    teamname = teamname.toLowerCase();
    //find the queue item of specified team/user combo
    Admin.PendingQueue.find({ teamName_lower: teamname, userName: username }).then((toDelete) => {
        if (toDelete && toDelete.length > 0) {
            //iterate through each element
            toDelete.forEach(ele => {
                //remove the element
                logObj.target = ele;
                ele.remove();
                logger(logObj);
                // console.log('pendingQueue item ' + ele._id + ' deleted.'); //static logging
            });
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
            // console.log('err in the pending delete sub ', err); //static logging
    })
}


//removes pending member queues by userneame
//username: battle tag of user
function removePendingQueueByUsername(username) {
    //find all pending member queues by this user name
    Admin.PendingQueue.find({ userName: username }).then((toDelete) => {
        if (toDelete && toDelete.length > 0) {
            //iterate through and delete them
            toDelete.forEach(ele => {
                ele.remove();
                console.log(username + ' scrubbed from pending queue.'); //static logging
            });
        }
    }, (err) => {
        console.log('Error ' + username + ' not removed from queue'); //static logging
    })
}

//this method adds a specified user to the specified team
//teamLower:string - team name as lower case;
//user:string battle tag of user
function addToPendingTeamMemberQueue(teamLower, user) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE addToPendingTeamMemberQueue';
    logObj.action = ' create pending queue item ';
    logObj.target = teamLower + ' : ', user;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();
    teamLower = teamLower.toLowerCase();
    if (util.isNullorUndefined(teamLower) && util.isNullorUndefined(user)) {
        logObj.error = 'addToPendingTeamMemberQueue got emtpy teamname / username '
    } else {
        //create a new queue of the recieved team and username
        Admin.PendingQueue({
            "teamName": teamLower,
            "userName": user
        }).save().then((savedQueue) => {
            logger(logObj);
            // console.log('added to pendingteam member queue'); //static logging
        }, (err) => {
            logObj.logLevel = 'ERROR';
            logObj.error = err;
            logger(logObj);
            // console.log('we had an error creating this queue'); //static logging
        });
    }
}

//this method updates any pending member queues that exist when a team name is chagned
//teamnameOld:string, old teamname
//teamnameNew:string, new teamname
function updatePendingMembersTeamNameChange(teamnameOld, teamnameNew) {

    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE addToPendingTeamMemberQueue';
    logObj.action = ' update pending queue teamname ';
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    //find all pending queues for the team
    Admin.PendingQueue.find({ teamName: teamnameOld }).then((foundQueue) => {
        if (foundQueue && foundQueue.length > 0) {
            foundQueue.forEach(queue => {
                logObj.target = queue._id;
                queue.teamName = teamnameNew;
                queue.save().then((saved) => {
                    logObj.action += ' pending queue team name updated';
                    logger(logObj);
                    // console.log('pending queue team name updated'); //static logging
                }, (err) => {
                    logObj.logLevel = "ERROR";
                    logObj.error = err;
                    logger(logObj);
                    // console.log('err'); //static logging
                });
            })
        }
    }, (err) => {
        console.log('error'); //static logging
    })
}

module.exports = {
    removePendingQueue: cleanUpPendingQueue,
    removePendingByTeamAndUser: cleanUpPendingQueueTeamnameUsername,
    addToPendingTeamMemberQueue: addToPendingTeamMemberQueue,
    removePendingQueueByUsername: removePendingQueueByUsername,
    updatePendingMembersTeamNameChange: updatePendingMembersTeamNameChange
}