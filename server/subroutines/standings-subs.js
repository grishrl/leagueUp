const Match = require('../models/match-model');
const util = require('../utils');
const Team = require('../models/team-models');
const System = require('../models/system-models').system;
const Schedules = require('../models/schedule-models');
const challonge = require('../methods/challongeAPI');
const Division = require('../models/division-models');


//takes the provided division and season and calcuates the current standings of the teams
//division:string division concat name, season:string or number, season number to check the standings of
async function calulateStandings(division, season) {
    let standings;
    try {

        let dbDiv = await Division.findOne({ divisionConcat: division }).then(found => { return found; });

        if (dbDiv) {
            if (util.returnBoolByPath(dbDiv.toObject(), 'cupDiv') && dbDiv.cupDiv == true) {
                standings = await cupDivStanding(division, season).then(answer => {
                    return answer;
                });
            } else {
                standings = await stdDivStanding(division, season).then(answer => {
                    return answer;
                });
            }
        }

        return standings;
    } catch (e) {
        console.log(e);
    }


}

const points = [{
        "rank": 1,
        "points": 3
    },
    {
        "rank": 2,
        "points": 2
    },
    {
        "rank": 3,
        "points": 1
    }
];

function returnObjectForKeyMatch(arrayOfObjects, key, value) {
    let arr = arrayOfObjects;
    let returnObj = null;
    arr.forEach(iter => {
        let keys = Object.keys(iter);
        keys.forEach(keyIter => {
            if (keyIter == key && iter[keyIter] == value) {
                returnObj = iter;
            }
        });
    });
    return returnObj;
}


async function cupDivStanding(division, season) {
    let returnStanding = [];
    let standingsQuery = {
        '$and': [{
                'dataName': 'cupDivStandings'
            },
            {
                "data.season": season
            },
            {
                "data.divisionConcat": division
            }
        ]
    }

    let standingsData = await System.findOne(standingsQuery).then(found => { return found; }, err => { return null; })

    let schedQuery = {
        '$and': [{
                'division': division
            },
            {
                'season': season
            },
            {
                'type': 'tournament'
            }
        ]
    };
    let cups = await Schedules.find(schedQuery).then(found => { return found; }, err => { return null; });
    // console.log(cups);
    if (cups && cups.length > 0) {
        let tournamentIds = [];
        cups.forEach(cup => {
            cup = cup.toObject();
            tournamentIds.push(cup.challonge_ref);
        });
        // console.log(standingsData);
        if (standingsData) {
            if (standingsData.data.parsedTournaments) {
                standingsData.data.parsedTournaments.forEach(parsed => {
                    if (tournamentIds.indexOf(parsed) > -1) {
                        tournamentIds.splice(tournamentIds.indexOf(parsed), 1);
                    }
                });
            }
            //this set of actions
            //remove any tournments that are in parsed list
            //pull remaining tournaments
            //parse finished
            //update and save standing
            //return standing
        } else {
            standingsData = {
                    'dataName': 'cupDivStandings',
                    'data': {
                        'points': [],
                        'season': season,
                        'divisionConcat': division
                    }
                }
                //another set of actions
                //pull remaining tournaments
                //parse finished
                //update and save standing
                //return standing
        }
        if (tournamentIds.length > 0) {
            let resolvedTournaments = await challonge.retriveTournaments(tournamentIds).then(response => {
                return response
            });
            console.log('resolvedTournaments ', resolvedTournaments);
            resolvedTournaments.forEach(tourn => {

                tourn = tourn.tournament;

                if (tourn.state == 'complete') {
                    if (standingsData.data.parsedTournaments) {
                        standingsData.data.parsedTournaments.push(tourn.id)
                    } else {
                        standingsData.data.parsedTournaments = [tourn.id];
                    }

                    let partipants = tourn.participants;
                    partipants.forEach(part => {
                        part = part.participant;
                        if (part != undefined && part != null) {
                            //loop through the participants; if the participant earned rank points; calculate them and add them to the standings
                            //if this participants rank, matches a rank in our point array -
                            let finishRank = returnObjectForKeyMatch(points, 'rank', part.final_rank);
                            if (finishRank) {
                                //create an object out of the participant
                                let pts = finishRank.points;
                                let obj = {
                                        teamName: part.name,
                                        id: part.misc,
                                        points: pts
                                    }
                                    //check if this participant had a score in the database all ready
                                let exists = returnObjectForKeyMatch(standingsData.data.points, 'teamName', part.name);
                                if (exists) {
                                    //if so add the scores together
                                    exists.points += exists.points;
                                } else {
                                    //if not add the participant to the standings
                                    standingsData.data.points.push(obj);
                                }
                            }
                        }
                    });
                }
            });

            if (standingsData.data.points) {
                returnStanding = standingsData.data.points;
            }

            System.findOneAndUpdate(
                standingsQuery, standingsData, {
                    new: true,
                    upsert: true
                }
            ).then(
                saved => {
                    console.log('standings upserted');
                },
                err => {
                    console.log(err);
                }
            );
        }

    } else {
        returnStanding = [];
    }
    return returnStanding
}

/*
{dataName: "cupDivStandings"
  data:{
    divisionConcat:'xxx',
    season:'',
    parsedTournaments:[],
    points:[
      {teamName:'',id:'dafd',points:XX},
      {
        teamName: '',
        id: 'dafd',
        points: XX
      }
    ]

  }
}
 */

async function stdDivStanding(division, season) {
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
                        match.home['ticker'] = team.ticker;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['logo'] = team.logo;
                        match.away['teamName_lower'] = team.teamName_lower;
                        match.away['ticker'] = team.ticker;
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