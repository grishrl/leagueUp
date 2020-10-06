/**
 * Reset team registration method
 * 
 * reviewed: 10-5-2020
 * reviewer: wraith
 */

const Team = require('../../models/team-models');

/**
 * @name resetTeamRegistrations
 * @description resets all team registrations to empty for a new season of registering
 * @function
 */
async function resetTeamRegistrations() {

    let x = await Team.find().then(
        (teams) => {
            if (teams) {
                let modified = 0;
                for (var i = 0; i, teams.length; i++) {
                    teams[i].registration = {};
                    teams[i].markModified('registration');
                    let x = await teams[i].save(
                        suc => { return 1; }
                    );
                    if (x > 0) {
                        modified++;
                    }
                }
                return modified;
            } else {
                throw { 'message': 'Teams not found.' };
            }
        },
        (err) => {
            throw err;
        }
    );

    return { 'message': `Reset ${x} teams` };

}

module.exports = resetTeamRegistrations;