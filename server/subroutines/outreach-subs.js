/**
 * Outreach subroutine; 
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */

const Outreach = require('../models/outreach-model');
const logger = require('../subroutines/sys-logging-subs').logger;

/**
 * @name updateOutreachTeamname
 * @function
 * @description this updates the team name in the outreach queue so that if a team name changes and there was an outstanding invite, the connection can still be made.
 * 
 * @param {string} oldteamName 
 * @param {string} newteamName 
 */
function updateOutreachTeamname(oldteamName, newteamName) {
    let logObj = {};
    logObj.logLevel = 'STD';
    logObj.action = ' update team name recorded in the outreach queue ';
    logObj.timeStamp = new Date().getTime();
    logObj.actor = 'SYSTEM';

    //grab the outstanding outreaches for the team
    Outreach.find({ teamName: oldteamName }).then((foundOutreach) => {
        if (foundOutreach && foundOutreach.length > 0) {
            //loop through found outreaches
            foundOutreach.forEach(outreach => {
                //update the teamname
                if (outreach.teamName == oldteamName) {
                    outreach.teamName = newteamName;
                }
                //save the outreach
                foundOutreach.save().then((saved) => {
                    logObj.target = saved._id;
                    logger(logObj);
                }, (err) => {
                    logObj.logLevel = 'ERROR';
                    logObj.error = err;
                    logger(logObj)
                })
            });
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = err;
        logger(logObj)
    })
}

module.exports = {
    updateOutreachTeamname: updateOutreachTeamname
}