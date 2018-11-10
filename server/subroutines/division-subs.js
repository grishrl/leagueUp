const Division = require('../models/division-models');
const util = require('../utils');

function updateTeamNameDivision(oldteamName, newteamName) {
    Division.findOne({ 'teams.teamName': oldteamName }).then((foundDiv) => {
        if (foundDiv) {
            foundDiv.teams.forEach(team => {
                if (team == oldteamName) {
                    team = newteamName;
                }
            });
            foundDiv.save((savedDiv) => {
                console.log('saved div');
            }, (err) => {
                console.log('error saving div')
            })
        }
    }, (err) => { console.log('Error finding div') })
}

module.exports = {
    updateTeamNameDivision: updateTeamNameDivision
}