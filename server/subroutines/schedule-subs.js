const TeamModel = require('../models/team-models');
const Division = require('../models/division-models');
const Scheduling = require('../models/schedule-models');
const uniqid = require('uniqid');
const Match = require('../models/match-model');
const util = require('../utils');
const robin = require('roundrobin');
const {
    Team,
    Tournament
} = require('../bracketzadateam/bracketzada.min');
const logger = require('./sys-logging-subs');
const challonge = require('../methods/challongeAPI');
const divSubs = require('./division-subs');



/* Match report format required for the generator
    {
      round: 1,
      home: {
        id: 1,
        points: 1
      },
      away: {
        id: 3,
        points: 1
      }
    }
*/

//this function generates the framework for scheduling for the season.  should only be run once ever per season;
//after this is ran, division changes should not be performed!!!!!!!
async function generateSeason(season) {

    //logObj
    let logObj = {};
    logObj.actor = 'Schedule Generater Sub; generateSeason';
    logObj.action = ' create schedule framework for season ';
    logObj.target = 'Season: ' + season + ' framework ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';


    let divObj = {};
    //get list of divisions
    let getDivision = await Division.find({
        $or: [{
                cupDiv: false
            },
            {
                cupDiv: { $exists: false }
            }
        ]
    }).then((res) => {
        return res;
    });
    //loop through the divisions
    for (var i = 0; i < getDivision.length; i++) {
        //local div variable
        let thisDiv = getDivision[i];
        divObj[thisDiv.divisionConcat] = {};
        //create an array of teams from the division
        let lowerTeam = [];
        thisDiv.teams.forEach(iterTeam => {
            lowerTeam.push(iterTeam.toLowerCase());
        });
        //pull the teams info from the dB and create an array of strings of the teams _ids
        // let participants = [];
        let participants = await TeamModel.find({
            teamName_lower: {
                $in: lowerTeam
            }
        }).then((teams) => {
            //create an array of strings of the teams _ids and return
            let returnParticipants = [];
            if (teams && teams.length > 0) {
                teams.forEach(team => {
                    returnParticipants.push(team._id.toString());
                });
            }
            return returnParticipants;
        });
        //schedule object will have
        /*
        {
            participants:[ String ], <- string array of team _ids
            matches:[ Object ], <- object array of matches
            roundSchedules[ Object ] <- object array of matches
        }
         */
        divObj[thisDiv.divisionConcat]['participants'] = participants;
        divObj[thisDiv.divisionConcat]['matches'] = [];
        divObj[thisDiv.divisionConcat]['roundSchedules'] = {};
    }

    // create the schedule object
    let schedObj = {
        "season": season,
        "division": divObj
    }
    let sched = await new Scheduling(
        schedObj
    ).save().then((saved) => {
        return true;
    }, (err) => {
        return false;
    });
    if (sched) {
        logger(logObj);
    } else {
        logObj.logLevel = 'ERROR';
        logger(logObj);
    }
    return sched;
}


//2-15-19 : not currently in use as we do not anticipate swiss scheduling
//this method generates a particular round of a tournament with the swiss system
//NOTE - the matches must be reported, regardless of outcome in order for the swiss
//to properly generate a schedule!
function generateRoundSchedules(season, round) {
    Scheduling.findOne({ "season": season }).then((found) => {
        let divisions = found.division;
        let keys = Object.keys(divisions);
        //get data from the found object
        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            //get data should be of a divsison
            let participants = divisions[key].participants;
            let matches = divisions[key].matches;
            let roundSchedules = divisions[key].roundSchedules;
            let schedule = swiss.getMatchups(round, participants, matches);
            //if a schedule was generated, save it to the round schedules
            if (schedule.length > 0) {
                //if round schedles didn't exist on the object before, create it
                if (roundSchedules == undefined || roundSchedules == null) {
                    divisions[key].roundSchedules = {};
                    roundSchedules = divisions[key].roundSchedules;
                }
                round = round.toString();
                roundSchedules[round] = schedule;
            }
        }

        //save the schedule object.
        found.markModified('division');
        found.save().then((saved) => {
            // console.log('fin  schedules');
        }, (err) => {
            // console.log('ERROR : ', err);
        })
    });
}

//this method generates a round robin schedule
//season:string - the season for which to generate the matches
function generateRoundRobinSchedule(season) {
    // logObj
    let logObj = {};
    logObj.actor = 'Schedule Generater Sub; generateRoundRobinSchedule';
    logObj.action = ' create regular season matches ';
    logObj.target = 'Season: ' + season + ' matches ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';
    //grab the schedule of the season in question
    Scheduling.findOne({
        "season": season
    }).then((found) => {
        //get the divisions
        let divisions = found.division;
        //make an array of the divisions as keys to iterate through
        let keys = Object.keys(divisions);
        for (var i = 0; i < keys.length; i++) { //loop through each division and create the matches for it
            let key = keys[i];
            let participants = divisions[key].participants;
            console.log('participants ', participants)
                //variable of rounds to generate, will be N - 1 if even, or N if odd number teamas;
            let rounds;
            if (participants.length % 2 == 0) {
                rounds = participants.length - 1;
            } else {
                rounds = participants.length;
            }

            //use the robin method to create the round robin matches
            let roundRobin = robin(participants.length, participants);
            let matches = divisions[key].matches;
            console.log('roundRobin.length ', roundRobin.length);
            console.log('roundRobin', JSON.stringify(roundRobin));
            //loop for reach round number and each round generated by the robin method and assign the indvidual matches
            //a round number
            for (var j = 0; j < roundRobin.length; j++) { //loop through the number of rounds
                //adjust 0 based round incrementer by +1
                let roundNum = j + 1;
                //grab the round from the result of the robin method
                let round = roundRobin[j];
                round.forEach(match => { //loop through the particular rounds matches
                    //create a match object from the round number and the information provided by the robin method
                    let matchObj = {
                            'season': season,
                            'divisionConcat': key,
                            "matchId": uniqid(),
                            "round": roundNum,
                            home: {
                                id: match[0]
                            },
                            away: {
                                id: match[1]
                            }
                        }
                        //push the match object into the schedule matches array
                    matches.push(matchObj);
                });
            }
            //create dB objects for each match generated.
            Match.insertMany(matches).then(res => {
                console.log('matches inserted!');
            }, err => {
                console.log('error inserting matches');
            });
        }
        //save the matches into the schedule object as well, this will serve as both a back up and 
        //a way to further perserve what matches belong to each season
        found.markModified('division');
        found.save().then((saved) => {
            logger(logObj);
            // console.log('season saved');
        }, (err) => {
            logObj.logLevel = 'ERROR';
            logObj.error = err;
            logger(logObj);
            // console.log('season save error!');
        })

    });
}

function returnTeamInfo(fullTeamsInfo, finalParticipantArray, challongeRef) {
    let returnTeam = null;
    let teamCrossRef = null;
    finalParticipantArray.forEach(part => {
        if (part.challonge_ref == challongeRef) {
            teamCrossRef = part;
        }
    });
    if (teamCrossRef) {
        fullTeamsInfo.forEach(team => {
            if (teamCrossRef.id == team.misc) {
                returnTeam = {
                    'teamName': team.name,
                    'id': team.misc
                }
            }
        });
    }

    return returnTeam;
}

async function generateTournamentTwo(teams, season, division, cup, name, description) {

    divSubs.cupDivisionAggregator(teams, division);

    //the bracket function requires of an array of special team objects, 
    let _teams = [];

    //there are a couple of ways we can get teams and their ids, to make sure we get the ids depening of format
    //run through teams and grab the id, depending on where it was send to us:  we use this array as the participants 
    //for the schedule object
    let teamIds = [];
    let participantsArray = [];
    teams.forEach((team, index) => {
        let teamid = team._id ? team._id : team.id
        if (teamIds.indexOf(teamid)) {
            teamIds.push(teamid);
        }

        participantsArray.push({
            "name": team.teamName,
            "seed": index + 1,
            "misc": teamid
        });
    });

    let tournamentId = uniqid();

    name = name ? name : tournamentId

    let url = name + '_link';

    url = url.replace(/\s/g, '_');

    // console.log(url);

    description = description ? description : 'No description provided';

    //create a new tournament in the challonge system and get the response
    let newTournament = await challonge.createTournament(name, url, description).then(response => {
        return response;
    });
    //check the reply from challonge and make sure it was OK
    if (newTournament.errors && newTournament.errors.length > 0) {
        newTournament.errors.forEach(err => {
            console.log(err);
            //will probably need some logging or throws to alert client
        })
    } else {
        // console.log('newTournament ', newTournament);
        //tournamnet create ok
        /*
        {
          tournament:{
            //info
          }
        }
         */
        //get the tournament ID; we'll need to save this for a reference;
        let tournamentId = newTournament.tournament.id;

        //add the participants to the tournament
        let addParticipants = await challonge.bulkParticpantsAdd(tournamentId, participantsArray).then(response => {
            return response;
        });

        //check the return from challonge and make sure that we got no errors
        if (addParticipants.errors && addParticipants.errors.length > 0) {
            addParticipants.errors.forEach(err => {
                console.log(err);
                //will probably need some logging or throws to alert client 
            })
        } else {
            // console.log('addParticpants ', addParticipants);
            //partipants add ok
            /*
            return as [
              {
                participant:{
                  //info
                }
              }
            ]
             */
            let finalParticipantArray = []
            addParticipants.forEach(part => {
                participantsArray.forEach(locPart => {
                    if (part.participant.name == locPart.name) {
                        finalParticipantArray.push({
                            "id": locPart.misc,
                            "challonge_ref": part.participant.id
                        });
                    }
                });
            });
            //now we have an array of NGS Team IDs and the challonge participant reference:
            //[ { id: NGSID, challonge_ref: xxxx } ]

            //start the tournament - this finializes everything and generats the matches
            let startStatus = await challonge.startTournament(tournamentId).then(response => {
                return response;
            });

            //check the start tournament response for errors
            if (startStatus.errors && startStatus.errors.length > 0) {
                startStatus.errors.forEach(err => {
                    console.log(err);
                })
            } else {
                // console.log('startStatus ', startStatus);
                //tournamnet has been started

                //set a get request for showing the matches generated for the tournament
                let showTournament = await challonge.showTournament(tournamentId).then(response => {
                    return response;
                });

                //check the show tournament response for errors
                if (showTournament.errors && showTournament.errors.length > 0) {
                    showTournament.errors.forEach(err => {
                        console.log(err);
                    })
                } else {
                    // console.log('showTournament ', showTournament);
                    let chalMatches = showTournament.tournament.matches;
                    try {
                        //do stuff with the matches
                        let matchIDsArray = [];
                        let brackets = [];
                        let matchesCrossRef = [];
                        let finalMatchRef = {};

                        //loop through the matches returned from challonge and create NGS match objects for them
                        chalMatches.forEach((match) => {

                            match = match.match;
                            let to = {};
                            to["challonge_match_ref"] = String(match.id);
                            to["type"] = "tournament";
                            to["season"] = season;
                            to["challonge_tournament_ref"] = String(match.tournament_id);
                            let ngsID = uniqid();
                            to["matchId"] = ngsID;
                            to["round"] = match.round;
                            matchesCrossRef.push({
                                id: ngsID,
                                challonge_ref: match.id
                            });
                            let iter = match.suggested_play_order;
                            if (iter == chalMatches.length) {
                                finalMatchRef['matchId'] = ngsID;
                                finalMatchRef['challonge_ref'] = match.id
                            }
                            matchIDsArray.push(ngsID);
                            if (match.prerequisite_match_ids_csv) {
                                to['challonge_idChildren'] = match.prerequisite_match_ids_csv.split(',');
                            }
                            if (match.player1_id) {
                                to['home'] = returnTeamInfo(participantsArray, finalParticipantArray, match.player1_id);

                            }
                            if (match.player2_id) {
                                to['away'] = returnTeamInfo(participantsArray, finalParticipantArray, match.player2_id);;
                            }
                            brackets.push(to);
                        });

                        //loop through the ngs matches and assign children/parents to the matches that have them
                        brackets.forEach(matchOuter => {
                            if (matchOuter.hasOwnProperty('challonge_idChildren')) {
                                matchOuter.idChildren = [];
                                matchOuter.challonge_idChildren.forEach(challongeIdChild => {
                                    brackets.forEach(matchInner => {
                                        if (matchInner.challonge_match_ref == challongeIdChild) {
                                            matchInner.parentId = matchOuter.matchId;
                                            matchOuter.idChildren.push(matchInner.matchId);
                                        }
                                    });
                                });
                            }
                        });


                        //insert the formed up bracked objects into the matches table
                        let matches = await Match.insertMany(brackets).then(res => {
                            console.log('matches inserted!');
                            return res;
                        }, err => {
                            console.log('error inserting matches ');
                            return err;
                        });

                        //create a schedule object to go along with this tournament
                        //give it particpants and the matches asscoated with this tournament
                        let schedObj = {
                            'type': 'tournament',
                            'name': name,
                            'division': division,
                            'season': season,
                            'participants': teamIds,
                            'participantsRef': finalParticipantArray,
                            'matches': matchIDsArray,
                            'matchesRef': matchesCrossRef,
                            'challonge_ref': tournamentId,
                            'challonge_url': url,
                            'finalMatch': finalMatchRef
                        }
                        if (cup) {
                            schedObj['cup'] = cup;
                        }
                        let schedule = await new Scheduling(
                            schedObj
                        ).save().then((saved) => {
                            // console.log('fin', JSON.stringify(saved));
                            return saved;
                        }, (err) => {
                            // console.log(err);
                            return err;
                        });



                        return {
                            'matches': matches,
                            'schedule': schedule
                        };
                    } catch (e) {
                        console.log(e);
                    }
                }
            }

        }

    }

}

//generate tournament schedules
//accepts 
//teams: array of team objects, {id or _id, teamName, logo}
//season: number, the season that this tournament is for or the iteration of the tournament
//division: the division info the tournament is for, if it is for one
//name: name of tournament

async function generateTournament(teams, season, division, cup, name) {
    //the bracket function requires of an array of special team objects, 
    let _teams = [];

    //there are a couple of ways we can get teams and their ids, to make sure we get the ids depening of format
    //run through teams and grab the id, depending on where it was send to us:  we use this array as the participants 
    //for the schedule object
    let teamIds = [];
    teams.forEach(team => {
        let teamid = team._id ? team._id : team.id
        if (teamIds.indexOf(teamid)) {
            teamIds.push(teamid);
        }
        //create the special team object and add it to the _team array
        _teams.push(
            new Team(teamid, team.teamName, team.logo)
        );
    });


    //generate a bracket tree that's a good round number, 2, 4, 8, 16 (fill the odds with byes)
    let expTeamLength = Math.pow(2, Math.ceil(Math.log2(_teams.length)));

    //create byes to fill any empty spaces in our team numbers 
    while (_teams.length < expTeamLength) {
        _teams.push(
            new Team(null, 'BYE')
        )
    }

    //this will hold our seeded teams
    //the bracket creator creates the match trees ingesting the array
    //creating the first matches, then building the tree upwards to the final round
    //we must pair the seeds properly then, split the array in halfs to make sure the bracket populates properly
    let seeded = [];
    do {
        //take the team in the top of the array (ie top seed)
        let topSeed = _teams.splice(0, 1);
        //take the team at the bottom of the array (ie bottom seed)
        let bottomSeed = _teams.splice(_teams.length - 1, _teams.length);
        //pair them together in the seeded array
        seeded = seeded.concat([topSeed[0], bottomSeed[0]]);

    }
    while (_teams.length > 0);

    //arrange the top and bottom half of the bracket correctly
    seeded = splitSeeded(seeded);

    //create the tournament and brackets
    let tournament = new Tournament(seeded, name);
    let brackets = tournament.generateBrackets();

    //brackets are returned as objects with thier on properties, 
    //add the properties to the object that our other matches have


    brackets.forEach(bracket => {
        bracket['type'] = 'tournament';
        if (division) {
            bracket['divisionConcat'] = division;
        }
        if (season) {
            bracket['season'] = season;
        }
        if (name) {
            bracket['name'] = name;
        }
        //if the match had idChildren, add a property parentId to each of the children
        let parent = bracket.id;
        if (bracket.idChildren.length > 0) {
            //loop through each child
            bracket.idChildren.forEach(id => {
                //loop through all brackets to see which ids match the current child
                brackets.forEach(subBrack => {
                    if (id == subBrack.id) {
                        subBrack.parentId = parent;
                    }
                })
            })
        }
    });

    //loop through the bracket objects and replace the current ID with a uuid matchId
    let matchIDsArray = [];
    brackets.forEach(bracket => {
        let newId = uniqid();
        let id = bracket.id;
        bracket['matchId'] = newId;
        matchIDsArray.push(newId);
        delete bracket.id;
        brackets.forEach(subBrack => {
            if (subBrack.parentId == id) {
                subBrack.parentId = newId;
            }
            let ind = subBrack.idChildren.indexOf(id);
            if (ind > -1) {
                subBrack.idChildren[ind] = newId;
            }
        });
        //if the match has a bye game, promote the team against the bye forward automatically
        if (hasBye(bracket)) {
            promoteFromBye(bracket, brackets);
        }
    });


    //insert the formed up bracked objects into the matches table
    let matches = await Match.insertMany(brackets).then(res => {
        console.log('matches inserted!');
        return res;
    }, err => {
        console.log(err);
        console.log('error inserting matches ', err);
        return err;
    });

    //create a schedule object to go along with this tournament
    //give it particpants and the matches asscoated with this tournament
    let schedObj = {
        'type': 'tournament',
        'name': name,
        'division': division,
        'season': season,
        'participants': teamIds,
        'matches': matchIDsArray
    }
    let schedule = await new Scheduling(
        schedObj
    ).save().then((saved) => {
        // console.log('fin', JSON.stringify(saved));
        return saved;
    }, (err) => {
        // console.log(err);
        return err;
    });

    return { 'matches': matches, 'schedule': schedule };

}


module.exports = {
    generateSeason: generateSeason,
    generateRoundSchedules: generateRoundSchedules,
    generateRoundRobinSchedule: generateRoundRobinSchedule,
    generateTournament: generateTournament,
    generateTournamentTwo: generateTournamentTwo
};

//helper method, accpets a match object, 
//checks if home or away has a bye in it and returns true if so, false if not
function hasBye(match) {
    return util.returnByPath(match, 'away.teamName') === 'BYE' || util.returnByPath(match, 'home.teamName') === 'BYE'
}

//helper method to promote a bye matched tournament game
//promotes any team to paired with bye to the parent match 
function promoteFromBye(match, matches) {
    let team;
    if (util.returnByPath(match, 'away.teamName') !== 'BYE') {
        team = util.returnByPath(match, 'away');
    }
    if (util.returnByPath(match, 'home.teamName') !== 'BYE') {
        team = util.returnByPath(match, 'home');
    }

    if (team != null || team != undefined) {
        let parent = match.parentId;

        matches.forEach(matchIt => {
            if (matchIt.matchId == parent) {
                if (!util.returnBoolByPath(matchIt, 'away')) {
                    matchIt['away'] = team;
                } else {
                    matchIt['home'] = team;
                }

            }
        })

    }

}


//helper method that arranges the seeding into the proper ordering
function splitSeeded(arr) {
    var topHalf = [];
    var bottomHalf = [];
    //this will grab the odd matches and push them into the top half of the bracket
    //IE first pair of teams, 0,1 then 4,5 etc, etc
    for (var i = 0; i < arr.length; i = i + 4) {
        topHalf.push(arr[i]);
        topHalf.push(arr[i + 1]);
    }
    //this will grab the even matches and push them into the bottom half of the bracket
    //IE second pair of teams, 2,3 then 6,7 etc.
    for (var i = 2; i < arr.length; i = i + 4) {
        bottomHalf.push(arr[i]);
        bottomHalf.push(arr[i + 1]);
    }
    //combine the arrays and return them back
    arr = [];
    arr = topHalf.concat(bottomHalf);
    return arr;
}