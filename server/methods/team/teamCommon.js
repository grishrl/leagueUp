/**
 * 
 * Some helper methods for team data
 * 
 * reviewed: 10-5-2020
 * reviewer: wraith
 * 
 */
const User = require('../../models/user-models');
const Team = require('../../models/team-models');
const {
    commonResponseHandler,
    requireOneInput,
    returnInvalidInputsMessage
} = require('../../commonResponseHandler');
const utils = require('../../utils');

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

/**
 * @name removeRegistrationInfo
 * @function
 * @description removes all registration info from teams except for their registration status
 * @param {Array.<object>} teamsArray array of team objects
 * @returns {Array.<object>}
 */
function removeRegistrationInfo(teamsArray){
    teamsArray.forEach(
        team=>{
            let registrationStatus = team.questionnaire.registered;
            team.questionnaire = {registered:registrationStatus};
        }
    )
    return teamsArray;
}

/**
 * @name getTeamBy
 * @function
 * @description returns team by given parameters; apply filter by admin or not.
 * @param {object} req request object from express
 * @param {object} rea response object from express
 */
async  function getTeamBy(req, res) {

    const optionalParameters = [{
      name: 'team',
      type: 'string'
    }, {
      name: 'ticker',
      type: 'string'
    }, {
      name: 'teamId',
      type: 'string'
    }, {
      name: 'discordTag',
      type: 'boolean'
    }];

    let admin = req.originalUrl.indexOf('admin')>-1;

    commonResponseHandler(req, res, [], optionalParameters, async (req, res, requiredParams, optionalParameters) => {
      const response = {};
      // return { status: 200, message: { 'e': 'happy' } }
      if (requireOneInput(optionalParameters)) {

        return teamQuery(optionalParameters).then(
          foundTeam => {
            if(foundTeam){
                            if (!admin) {
                                let registrationStatus = utils.returnByPath(foundTeam, 'questionnaire.registration');
                                foundTeam.questionnaire = {
                                    registered: registrationStatus
                                };
                            }
            }else{
                foundTeam = {};
            }

            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found team', false, foundTeam);
            return response;
          },
          err => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, "Error querying teams.", err);
            return response;
          }
        );

      } else {
        return returnInvalidInputsMessage(req, optionalParameters, true);
      }
    });
  }

module.exports = {
    removeDegenerateTeams,
    getCptId,
    removeRegistrationInfo,
    getTeamBy
}

function teamQuery(optionalParameters) {
    let query = {
        $and: []
    };

    if (optionalParameters.team.valid) {
        let team = optionalParameters.team.value;
        team = team.toLowerCase();
        query['$and'].push({
            'teamName_lower': team
        });
    }

    if (optionalParameters.ticker.valid) {
        let ticker = optionalParameters.ticker.value;
        ticker = ticker.toLowerCase();
        query['$and'].push({
            'ticker_lower': ticker
        });
    }

    if (optionalParameters.teamId.valid) {
        id = optionalParameters.teamId.value;
        query = {
            "_id": id
        }
    }

    return Team.findOne(query).lean().then(
        (foundTeam) => {
            if (optionalParameters.discordTag.value) {

                let usernames = [];



                foundTeam.teamMembers.forEach(member => {
                    usernames.push(member.displayName);
                });

                return User.find({ displayName: { $in: usernames } }).lean().then(
                    users => {

                        foundTeam.teamMembers.forEach(
                            teamMember => {
                                users.forEach(user => {
                                    if (teamMember.displayName == user.displayName) {
                                        if (user.hasOwnProperty('discordTag')) {
                                            teamMember.discordTag = user.discordTag;
                                        } else {
                                            teamMember.discordTag = 'nil';
                                        }
                                        if (user.hasOwnProperty('discordId')) {
                                            teamMember.discordId = user.discordId;
                                        } else {
                                            teamMember.discordId = 'nil';
                                        }
                                    }
                                })
                            }
                        );

                        return foundTeam;

                    },
                    err => {
                        return err;
                    }
                )


            } else {
                return foundTeam;
            }

        }, (err) => {
            return err;
        }
    );
}