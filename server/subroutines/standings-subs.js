const Match = require('../models/match-model');
const util = require('../utils');
const Team = require('../models/team-models');

async function calulateStandings(division, season) {
    let teams;
    let matchesForDivision = await Match.find({
        $and: [{
            divisionConcat: division
        }, {
            season: season
        }]
    }).lean().then(
        (matches) => {
            if (matches) {
                teams = findTeamIds(matches);
                return addTeamNamesToMatch(teams, matches).then(
                    (processed) => {
                        return processed;
                    },
                    (err) => {
                        return false;
                    }
                )
            } else {
                return false;
            }
        },
        (err) => {
            return false;
        }
    );

    let standings = [];
    if (matchesForDivision != false) {
        teams.forEach(team => {
            let standing = {};
            standing['wins'] = 0;
            standing['points'] = 0;
            standing['losses'] = 0;
            standing['dominations'] = 0;
            standing['id'] = team;
            standing['matchesPlayed'] = 0;
            matchesForDivision.forEach(match => {
                if (match.away.id == team) {
                    standing['teamName'] = match.away.teamName;
                    let score = match.away.score
                    let dominator = match.away.dominator;
                    if (match.reported) {
                        standing['matchesPlayed'] += 1;
                    }
                    if (score != undefined && score != null) {
                        if (score == 2) {
                            standing['wins'] += 2;
                            standing['points'] += 2;
                            if (!dominator) {
                                standing['losses'] += 1;
                            }
                        } else if (score == 1) {
                            standing['points'] += 1;
                            standing['wins'] += 1;
                            standing['losses'] += 2;
                        } else {
                            standing['losses'] += 2;
                        }
                    }
                    if (dominator) {
                        standing['dominations'] += 1;
                        standing['points'] += 1;
                    }
                } else if (match.home.id == team) {
                    standing['teamName'] = match.home.teamName;
                    let score = match.home.score
                    let dominator = match.home.dominator;
                    if (match.reported) {
                        standing['matchesPlayed'] += 1;
                    }
                    if (score != undefined && score != null) {
                        if (score == 2) {
                            standing['points'] += 2;
                            standing['wins'] += 2;
                            if (!dominator) {
                                standing['losses'] += 1;
                            }
                        } else if (score == 1) {
                            standing['points'] += 1;
                            standing['wins'] += 1;
                            standing['losses'] += 2;
                        } else {
                            standing['losses'] += 2;
                        }
                        if (dominator) {
                            standing['dominations'] += 1;
                            standing['points'] += 1;
                        }
                    }
                }
            });
            standings.push(standing);
        });
    }
    standings.sort((a, b) => {
        if (a.points > b.points) {
            return -1;
        } else {
            return 1;
        }
    });
    for (var i = 0; i < standings.length; i++) {
        standings[i]['standing'] = i + 1;
    }
    return standings;
}

function findTeamIds(found) {
    let teams = [];
    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
        if (util.returnBoolByPath(match, 'home.id')) {
            if (match.home.id != 'null' && teams.indexOf(match.home.id.toString()) == -1) {
                teams.push(match.home.id.toString());
            }
        }
        if (util.returnBoolByPath(match, 'away.id')) {
            if (match.away.id != 'null' && teams.indexOf(match.away.id.toString()) == -1) {
                teams.push(match.away.id.toString());
            }
        }
    });
    return teams;
}

async function addTeamNamesToMatch(teams, found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }
    return Team.find({
        _id: {
            $in: teams
        }
    }).then((foundTeams) => {
        if (foundTeams) {
            foundTeams.forEach(team => {
                let teamid = team._id.toString();
                found.forEach(match => {
                    let homeid, awayid;
                    if (util.returnBoolByPath(match, 'home.id')) {
                        homeid = match.home.id.toString();
                    }
                    if (util.returnBoolByPath(match, 'away.id')) {
                        awayid = match.away.id.toString();
                    }
                    if (teamid == homeid) {
                        match.home['teamName'] = team.teamName;
                        match.home['teamName_lower'] = team.teamName_lower;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['teamName_lower'] = team.teamName_lower;
                    }
                });
            });
            return found;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
}

module.exports = {
    calulateStandings: calulateStandings
};