/**
 * 
 * Some helper methods for team data
 * 
 * reviewed: 10-5-2020
 * reviewer: wraith
 * 
 */
const User = require('../../models/user-models');

const degenerate = [
    'withdrawn',
    'inactive'
];

/**
 * @name removeDegenerateTeams
 * @function
 * @description filters team names that do not pass the degenerate check
 * @param {Array.<Object>} teams list of teams to filter
 * @param {Array.<string>} [additional] list of additional filter words
 */
function removeDegenerateTeams(teams, additional) {
    if (additional) {
        degenerate.concat(additoonal);
    }

    teams = teams.filter(a => {
        return nameContains(a.teamName, degenerate);
    });

    return teams;
}

/**
 * @name nameContains
 * @function
 * @description runs provided name through array of strings, performing partial matches, returns true if team name is included in the array
 * @param {string} teamName 
 * @param {Array.<string>} check 
 */
function nameContains(teamName, check) {
    let match = true;
    const tname = teamName.toLowerCase();
    check.forEach(
        ck => {
            ck = ck.toLowerCase();
            if (tname.indexOf(ck) > -1) {
                match = false;
            }
        }
    );
    return match;
};

/**
 * @name getCptId
 * @function
 * @description returns the ID of player object 
 * @deprecated
 * @param {string} cptName display name of captain
 */
async function getCptId(cptName) {
    let cptID = await User.findOne({
        displayName: cptName
    }).then(
        res => {
            return res;
        },
        err => {
            return err;
        }
    );
    return cptID;
}

module.exports = {
    removeDegenerateTeams,
    getCptId
}