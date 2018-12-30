const Division = require('../models/division-models');
const util = require('../utils');

function updateTeamNameDivision(oldteamName, newteamName) {
    Division.findOne({ 'teams': oldteamName }).then((foundDiv) => {
        if (foundDiv) {
            foundDiv.teams.forEach(team => {
                if (team == oldteamName) {
                    team = newteamName;
                }
            });
            foundDiv.save((savedDiv) => {
                console.log('saved div'); //static logging
            }, (err) => {
                console.log('error saving div') //static logging
            })
        }
    }, (err) => {
        console.log('Error finding div') //static logging
    })
}



module.exports = {
    updateTeamNameDivision: updateTeamNameDivision
}