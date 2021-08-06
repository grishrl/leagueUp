const Match = require('../../models/match-model');
const SeasonInfoCommon = require('../seasonInfoMethods');
const matchCommon = require('../matchCommon');
const utils = require('../../utils');

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

async function returnReportedMatches(season, division, sortOrder, limit) {
    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

    season = season ? season : currentSeasonInfo.value;
    let pastSeason = season != currentSeasonInfo.value;

    let query = {
        $and: [{
                season: season
            },
            {
                reported: true
            }
        ]
    }

    if (division) {
        query.$and.push({
            divisionConcat: division
        });
    }

    return Match.find(query).lean().then(
        found => {
            if (found) {
                if (sortOrder == 'des') {
                    found = utils.sortMatchesByTime(found);
                    found.reverse();
                } else if (sortOrder == 'asc') {
                    found = utils.sortMatchesByTime(found);
                }

                if (limit) {
                    let tlimit = limit > found.length ? found.length : limit;
                    found = found.slice(0, tlimit);
                }

                if (pastSeason) {
                    return matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                        processed => {
                            return processed;
                        },
                        err => {
                            throw err;
                        }
                    )
                } else {
                    return matchCommon.addTeamInfoToMatch(found).then(
                        processed => {
                            return processed;
                        },
                        err => {
                            throw err;
                        }
                    )
                }
            } else {
                return found;
            }
        }, err => {
            throw err;
        }
    );
}

module.exports = {
    returnNonTournamentMatchesByTeamId: returnNonTournamentMatchesByTeamId,
    returnReportedMatches: returnReportedMatches
}