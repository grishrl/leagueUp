const Division = require('../models/division-models');
const util = require('../utils');
const logger = require('../subroutines/sys-logging-subs');



//updates a teams name in the division when the team name has been changed
function updateTeamNameDivision(oldteamName, newteamName) {

    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE updateTeamNameDivision';
    logObj.action = ' update team name division ';
    logObj.target = newteamName;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    Division.findOne({ 'teams': oldteamName }).then((foundDiv) => {
        if (foundDiv) {
            let foundIndex = -1;
            foundDiv.teams.forEach((team, index) => {
                if (team == oldteamName) {
                    foundIndex = index;
                }
            });
            foundDiv.teams[foundIndex] = newteamName;
            foundDiv.markModified('teams');
            foundDiv.save().then((savedDiv) => {
                logger(logObj);
            }, (err) => {
                logObj.logLevel = 'ERROR';
                logObj.error = err;
                logger(logObj);
            })
        }
    }, (err) => {
        logObj.logLevel = 'ERROR';
        logObj.error = 'Error finding div'
        logger(logObj);
    })
}

function removeTeamFromDivision(team) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE removeTeamFromDivision';
    logObj.action = ' remove team from division ';
    logObj.target = team;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    Division.findOne({
        teams: team
    }).then(
        (foundDiv) => {
            if (foundDiv) {
                let ind = foundDiv.teams.indexOf(team);
                logObj.target += ' ' + foundDiv.displayName;
                foundDiv.teams.splice(ind, 1);
                foundDiv.save().then(saved => {
                    logger(logObj);
                }, err => {
                    logObj.logLevel = 'ERROR';
                    logObj.error = err;
                    logger(logObj);
                })
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Error finding div';
                logger(logObj);

            }
        },
        (err) => {
            logObj.logLevel = 'ERROR';
            logObj.error = err;
            logger(logObj);
        }
    )
}



module.exports = {
    updateTeamNameDivision: updateTeamNameDivision,
    removeTeamFromDivision: removeTeamFromDivision
}