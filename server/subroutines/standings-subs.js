const Match = require('../models/match-model');
const util = require('../utils');
const Team = require('../models/team-models');
const System = require('../models/system-models').system;
const Schedules = require('../models/schedule-models');
const challonge = require('../methods/challongeAPI');
const Division = require('../models/division-models');
const _ = require('lodash');
const MatchCommon = require('../methods/matchCommon');


//takes the provided division and season and calcuates the current standings of the teams
//division:string division concat name, season:string or number, season number to check the standings of
async function calulateStandings(division, season, pastSeason) {
    let standings;
    try {

        let dbDiv = await Division.findOne({ divisionConcat: division }).then(found => { return found; });

        if (dbDiv) {
            if (util.returnBoolByPath(dbDiv.toObject(), 'cupDiv') && dbDiv.cupDiv == true) {
                standings = await cupDivStanding(division, season).then(answer => {
                    return answer;
                });
            } else {
                standings = await stdDivStanding(division, season, pastSeason).then(answer => {
                    return answer;
                });
            }
        }

        return standings;
    } catch (e) {
        util.errLogger('standings-subs', e);
    }


}


//these points are awarded to placements of a tournament for cup divisions
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

//helper function that returns objects that match given, 
// array of objects, 
// matchKey: string of property to check;
// matchValue: the value of the property to match against
function returnObjectForKeyMatch(arrayOfObjects, matchKey, matchValue) {
    let arr = arrayOfObjects;
    let returnObj = null;
    arr.forEach(iter => {
        _.forEach(iter, (value, key) => {
            if (key == matchKey && value == matchValue) {
                returnObj = iter;
            }
        });
    });
    return returnObj;
}


//method for calculating the standings of a cup division... if such a thing ever exists.
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

    //find the cup division object
    let standingsData = await System.findOne(standingsQuery).then(found => { return found; }, err => { return null; });

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

    //find the schedules of the division
    let cups = await Schedules.find(schedQuery).then(found => { return found; }, err => { return null; });

    if (cups && cups.length > 0) {
        let tournamentIds = [];
        //get the challonge tournament id of each schedule item found
        cups.forEach(cup => {
            cup = cup.toObject();
            tournamentIds.push(cup.challonge_ref);
        });
        if (standingsData) {
            //go through the standings data all ready compiled; //if the tournament has been compiled all ready remove it from the list to check now
            if (standingsData.data.parsedTournaments) {
                standingsData.data.parsedTournaments.forEach(parsed => {
                    if (tournamentIds.indexOf(parsed) > -1) {
                        tournamentIds.splice(tournamentIds.indexOf(parsed), 1);
                    }
                });
            }

        } else {
            //we didnt have any current standings data so create new
            standingsData = {
                'dataName': 'cupDivStandings',
                'data': {
                    'points': [],
                    'season': season,
                    'divisionConcat': division
                }
            }
        }

        //if we have tournmanets that need to be compiled .. cont
        if (tournamentIds.length > 0) {
            //get the tournament info from challonge...
            let resolvedTournaments = await challonge.retriveTournaments(tournamentIds).then(response => {
                return response
            });

            //loop through each tournament we fetched
            resolvedTournaments.forEach(tourn => {

                tourn = tourn.tournament;
                //check if the tournament is closed and complete..
                if (tourn.state == 'complete') {
                    //add this tournament id to our standings info object so it wont be compiled next time
                    if (standingsData.data.parsedTournaments) {
                        standingsData.data.parsedTournaments.push(tourn.id)
                    } else {
                        standingsData.data.parsedTournaments = [tourn.id];
                    }

                    //loop through the participants; if the participant earned rank points; calculate them and add them to the standings
                    let partipants = tourn.participants;
                    partipants.forEach(part => {
                        part = part.participant;
                        if (part != undefined && part != null) {
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

            //if we had some points from compilation assign them to the return value
            if (standingsData.data.points) {
                returnStanding = standingsData.data.points;
            }

            //update the standings info object
            System.findOneAndUpdate(
                standingsQuery, standingsData, {
                    new: true,
                    upsert: true
                }
            ).then(
                saved => {
                    //needs to be replaced with dB log if ever used.
                    util.errLogger('standings-subs', null, 'standings upserted');
                },
                err => {
                    util.errLogger('standings-subs', err);
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

async function stdDivStanding(division, season, pastSeason) {
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
                //get an array of team ids
                teams = MatchCommon.findTeamIds(matches);
                if (pastSeason) {
                    return MatchCommon.addTeamInfoFromArchiveToMatch(matches, season).then(
                        (processed) => {
                            return processed;
                        },
                        (err) => {
                            return false;
                        }
                    )
                } else {
                    //grab all the team information associated with each team
                    //add names and logos to matches
                    return MatchCommon.addTeamInfoToMatch(matches).then(
                        (processed) => {
                            return processed;
                        },
                        (err) => {
                            return false;
                        }
                    )
                }

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
        //loop through the list of team ids
        teams.forEach(team => {
            //create a response object per team..
            let standing = {};
            standing['wins'] = 0;
            standing['points'] = 0;
            standing['losses'] = 0;
            standing['dominations'] = 0;
            standing['id'] = team;
            standing['matchesPlayed'] = 0;
            //loop through the matches et all for division
            matchesForDivision.forEach(match => {
                //if the match is not reported; ignore it
                if (util.returnBoolByPath(match, 'reported') == false) {
                    return;
                } else {
                    //match the team id
                    if (match.away.id == team) {
                        //get team info from here
                        standing['teamName'] = match.away.teamName;
                        standing['logo'] = match.away.logo;
                        //score from this game if team id was away
                        let score = match.away.score
                            //dominator variable
                        let dominator = match.away.dominator;

                        if (match.reported) {
                            standing['matchesPlayed'] += 1;
                        }

                        if (score != undefined && score != null) {
                            //if the score was 2 
                            if (score == 2) {
                                //add 2 wins
                                standing['wins'] += 2;
                                //add 2 points
                                standing['points'] += 2;
                                //if you scored 2 but not a dominator then you won 2-1
                                if (!dominator) {
                                    standing['losses'] += 1;
                                }
                            } else if (score == 1) {
                                //if you scored 1
                                //add 1 pt
                                standing['points'] += 1;
                                //add 1 win
                                standing['wins'] += 1;
                                //add 2 losses
                                standing['losses'] += 2;
                            } else {
                                //else case score is zero, 
                                //add 2 losses
                                standing['losses'] += 2;
                            }
                        }
                        //dominator bonus;
                        //add 1 pt
                        //add 1 dominations
                        if (dominator) {
                            standing['dominations'] += 1;
                            standing['points'] += 1;
                        }
                    } else if (match.home.id == team) {
                        //get team info from here
                        standing['teamName'] = match.home.teamName;
                        standing['logo'] = match.home.logo;
                        //score from this game if team id was home
                        let score = match.home.score
                            //dominator variable
                        let dominator = match.home.dominator;
                        if (match.reported) {
                            standing['matchesPlayed'] += 1;
                        }
                        if (score != undefined && score != null) {
                            //if the score was 2 
                            if (score == 2) {
                                //add 2 pts
                                standing['points'] += 2;
                                // add 2 wins
                                standing['wins'] += 2;
                                //if you scored 2 but not a dominator then you won 2-1
                                if (!dominator) {
                                    standing['losses'] += 1;
                                }
                            } else if (score == 1) {
                                //score was 1, you lost 1-2
                                //add 1 pts
                                standing['points'] += 1;
                                //add 1 wins
                                standing['wins'] += 1;
                                //add 2 losses
                                standing['losses'] += 2;
                            } else {
                                //score was zero, 
                                //add 2 losses
                                standing['losses'] += 2;
                            }
                            //dominator bonus
                            //add 1 dominations
                            //add 1 pts
                            if (dominator) {
                                standing['dominations'] += 1;
                                standing['points'] += 1;
                            }
                        }
                    }
                }
            });
            standings.push(standing);
        });
    }
    //sort resultant standings by points
    standings.sort((a, b) => {
        if (a.points > b.points) {
            return -1;
        } else {
            return 1;
        }
    });
    //add a position property 1st,....
    for (var i = 0; i < standings.length; i++) {
        standings[i]['standing'] = i + 1;
    }
    return standings;
}

module.exports = {
    calulateStandings: calulateStandings
};