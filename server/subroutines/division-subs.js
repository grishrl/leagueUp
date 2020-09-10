const Division = require('../models/division-models');
const util = require('../utils');
const logger = require('../subroutines/sys-logging-subs').logger;


//this method is for adding any non-regular teams into the particpants list of the cup divisions
async function cupDivisionAggregator(teams, division) {

    let dbDivision = await Division.findOne({ divisionConcat: division }).then(
        found => { return found; },
        err => {
            return null;
        }
    )


    if (dbDivision) {
        let dbDivisionObject = dbDivision.toObject();
        if (util.returnBoolByPath(dbDivisionObject, 'cupDiv') && dbDivisionObject.cupDiv) {

            let teamNames = [];

            teams.forEach(team => {
                if (dbDivisionObject.teams.indexOf(team.teamName) == -1 && dbDivisionObject.participants.indexOf(team.teamName) == -1) {
                    teamNames.push(team.teamName);
                }
            });

            if (teamNames.length > 0) {
                dbDivision.participants = dbDivision.participants.concat(teamNames);
                dbDivision.save();
            }

        }
    }

}


//updates a teams name in the division when the team name has been changed
function updateTeamNameDivision(oldteamName, newteamName) {

    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE updateTeamNameDivision';
    logObj.action = ' update team name division ';
    logObj.target = newteamName;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    //get division that the team belongs to
    Division.findOne({ 'teams': oldteamName }).then((foundDiv) => {
        if (foundDiv) {
            logObj.target = foundDiv.divisionConcat;

            //get the index of the old team name in array
            let foundIndex = foundDiv.teams.indexOf(oldteamName);

            //replace the old team name with the new
            foundDiv.teams[foundIndex] = newteamName;
            //save the division
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
        logObj.error = 'Error finding division'
        logger(logObj);
    })
}

//removes team from division
function removeTeamFromDivision(team) {
    //log object
    let logObj = {};
    logObj.actor = 'SYSTEM SUBROUTINE removeTeamFromDivision';
    logObj.action = ' remove team from division ';
    logObj.target = team;
    logObj.logLevel = 'STD';
    logObj.timeStamp = new Date().getTime();

    //find division the team belongs to
    Division.findOne({
        teams: team
    }).then(
        (foundDiv) => {
            if (foundDiv) {
                logObj.target += ' ' + foundDiv.displayName;
                //get index of the team in the array
                let ind = foundDiv.teams.indexOf(team);
                //remove team from array
                foundDiv.teams.splice(ind, 1);
                //save the div
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
    removeTeamFromDivision: removeTeamFromDivision,
    cupDivisionAggregator: cupDivisionAggregator
}