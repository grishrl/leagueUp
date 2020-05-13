const Division = require('../../models/division-models');
const TeamSubs = require('../../subroutines/team-subs');
const utils = require('../../utils');


async function removeTeamsFromDivision(divisionConcat, removeTeams) {

    let returnObject = {};

    try {

        let modDiv = await Division.findOne({
            divisionConcat: divisionConcat
        }).then((found) => {
            return found;
        }, (err) => {
            throw err;
        });


        let removed = [];

        if (modDiv) {
            if (removeTeams == '*') {
                removeTeams = modDiv.teams;
            }
            removeTeams.forEach(team => {
                let i = modDiv.teams.indexOf(team);
                removed = removed.concat(modDiv.teams.splice(i, 1));
            });

        } else {
            throw {
                'message': 'Division was not found'
            }
        }

        let saved = await modDiv.save().then((saved) => {
            TeamSubs.upsertTeamsDivision(removed, {});
            return saved;
        }, (err) => {
            throw err;
        });

        returnObject.division = saved;

    } catch (e) {

        utils.errLogger('removeTeamsFromDivision', e)

    }



    return returnObject;

}

module.exports = removeTeamsFromDivision;