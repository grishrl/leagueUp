const Team = require('../../models/team-models');

async function getRegisteredTeams() {
    return Team.find({
        'questionnaire.registered': true
    }).lean().then(
        (foundTeam) => {
            return foundTeam;
        }, (err) => {
            throw err;
        }
    );
}

module.exports = getRegisteredTeams