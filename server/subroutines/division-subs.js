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

function removeTeamFromDivision(team) {
    Division.findOne({
        teams: team
    }).then(
        (foundDiv) => {
            if (foundDiv) {
                let ind = foundDiv.teams.indexOf(team);
                foundDiv.teams.splice(ind, 1);
                foundDiv.save().then(saved => {
                    console.log('team removed from division');
                }, err => {
                    console.log('error saving div');
                })
            } else {
                console.log('Error finding div'); //static logging
            }
        },
        (err) => {
            console.log('error finding division');
        }
    )
}



module.exports = {
    updateTeamNameDivision: updateTeamNameDivision,
    removeTeamFromDivision: removeTeamFromDivision
}