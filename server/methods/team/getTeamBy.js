const Team = require('../../models/team-models');

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