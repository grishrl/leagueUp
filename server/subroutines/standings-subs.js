const Match = require('../models/match-model');
const util = require('../utils');
const Team = require('../models/team-models');


//takes the provided division and season and calcuates the current standings of the teams
//division:string division concat name, season:string or number, season number to check the standings of
async function calulateStandings(division, season) {
    let teams;

    //grab all amtches that match the season and division and are not tournament matches
    let matchesForDivision = await Match.find({
        $and: [{
            divisionConcat: division
        }, {
            season: season
        }, {
            type: {
                $ne: 'tournament'
            }
        }]
    }).lean().then(
        (matches) => {
            if (matches) {
                //grab all the team information associated with each team
                teams = findTeamIds(matches);
                //add names and logos to matches
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

    //calcualte the standings of the teams
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
                    standing['logo'] = match.away.logo;
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

//this loops through an array of matches from the db and adds the teams ids to an array
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

//this takes an array of ids and grabs all the team info for them, adds it to the 
// home/away object of the match so they are available on the client
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
                        match.home['logo'] = team.logo;
                        match.home['teamName_lower'] = team.teamName_lower;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['logo'] = team.logo;
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