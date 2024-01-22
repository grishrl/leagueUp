/**
 * Get team by name
 */

const Team = require('../../models/team-models');

/**
 * @name getTeamByName
 * @function
 * @description returns team object by team name
 * @param {string} teamName 
 */
async function getTeamByName(teamName) {

    teamName = teamName.toLowerCase();

    let foundTeam = await Team.findOne({ teamName_lower: teamName }).then(
        found => {
            return found;
        },
        err => {
            throw err;
        }
    );

    return foundTeam;

}

module.exports = { getTeamByName: getTeamByName };