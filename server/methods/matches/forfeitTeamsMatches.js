const SeasonInfoCommon = require('../seasonInfoMethods');
const getMatches = require('./getMatchesBy');

const teamMethod = require('../team/getTeamBy');

async function forfietTeam(teamName) {
    let returnObject = {};

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    // let pastSeason = season != currentSeasonInfo.value;

    try {
        teamName = teamName.toLowerCase();
        let team = await teamMethod.getTeamByName(teamName);
        if (team) {
            let teamId = team._id;
            let matches = await getMatches.returnNonTournamentMatchesByTeamId(teamId, currentSeasonInfo.value).then(
                response => {
                    return response;
                },
                err => {
                    throw err;
                }
            );
            if (matches && matches.length > 0) {
                returnObject.matches = [];
                for (var i = 0; i < matches.length; i++) {
                    let match = matches[i];
                    if (match.away.id == teamId) {
                        match.away.score = 0;
                        match.away.dominator = false;
                        match.home.score = 2;
                        match.home.dominator = true;
                    } else {
                        match.away.score = 2;
                        match.away.dominator = true;
                        match.home.score = 0;
                        match.home.dominator = false;
                    }
                    match.forfeit = true;
                    match.reported = true;
                    match.postedToHP = true;

                    let savedMatch = await match.save().then(
                        saved => {
                            return saved;
                        },
                        err => {
                            return {
                                matchId: match.matchId,
                                'err': 'error saving forfiet'
                            };
                        }
                    )
                    returnObject.matches.push(savedMatch);
                }
            }
        } else {
            returnObject.logLevel = 'ERROR';
            returnObject.error = 'Team not found.';
            returnObject.message = 'Team not found.';
            throw returnObject;
        }
    } catch (e) {
        console.log('forfiet teams catch', e);
        returnObject.logLevel = 'ERROR';
        returnObject.error = e;
        returnObject.message = 'Error in forfeit method';
        throw returnObject;
    }

    return returnObject;

}

module.exports = {
    forfietTeam: forfietTeam
};