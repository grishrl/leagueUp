const Match = require('../../models/match-model');

async function returnNonTournamentMatchesByTeamId(teamId, season) {

    return Match.find({
        $and: [{
                $or: [{
                    'away.id': teamId
                }, {
                    'home.id': teamId
                }]
            },
            {
                season: season
            },
            {
                type: {
                    $ne: "tournament"
                }
            }
        ]
    }).then((foundMatches) => {
        return foundMatches;
    }, (err) => {
        throw err;
    });

}

module.exports = { returnNonTournamentMatchesByTeamId: returnNonTournamentMatchesByTeamId }