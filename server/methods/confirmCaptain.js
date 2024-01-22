/**
 * Middleware to confirm the user calling the API is a captain secures the routes so that only captains can do certain team acts
 */

const util = require('../utils');
const Team = require("../models/team-models");
//this confirms that the calling user is a captain of the team
/**
 * @name confirmCaptain
 * @function
 * @description middleware to confirm the user calling the API is a captain secures the routes so that only captains can do certain team acts
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function confirmCaptain(req, res, next) {
    const path = 'captianCheck';
    var callingUser = req.user;
    var payloadTeamName = req.body.teamName ? req.body.teamName : req.user.teamName;
    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' validate captain ';
    logObj.logLevel = 'STD';
    logObj.target = payloadTeamName;
    let lower = payloadTeamName.toLowerCase();
    Team.findOne({
        teamName_lower: lower
    }).then((foundTeam) => {
        if (foundTeam) {
            let aCindex = -1;
            if (foundTeam.assistantCaptain) {
                aCindex = foundTeam.assistantCaptain.indexOf(callingUser.displayName);
            }
            if (foundTeam.captain == callingUser.displayName || aCindex > -1) {
                req.team = foundTeam;
                next();
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Not authorized to change team';
                res.status(403).send(util.returnMessaging(path, "User not authorized to change team.", false, null, null, logObj));
            }
        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'Team was not found';
            res.status(400).send(util.returnMessaging(path, "Team not found.", false, null, null, logObj));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, "Error finding team", err, null, null, logObj));
    });
}
exports.confirmCaptain = confirmCaptain;