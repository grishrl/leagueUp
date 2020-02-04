const TeamModel = require('../models/team-models');
const Division = require('../models/division-models');
const Scheduling = require('../models/schedule-models');
const uniqid = require('uniqid');
const Match = require('../models/match-model');
const util = require('../utils');
const robin = require('roundrobin');
const logger = require('./sys-logging-subs');
const challonge = require('../methods/challongeAPI');
const divSubs = require('./division-subs');
const lodash = require('lodash');



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

    let logObj = {};
    logObj.actor = 'Schedule Generater Sub; generateSeason';
    logObj.action = ' create schedule framework for season ';
    logObj.target = 'Season: ' + season + ' framework ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';

    let returnVal = false;

    try {

        let divObj = {};
        //get list of divisions
        let getDivision = await Division.find({
            $or: [{
                    cupDiv: false
                },
                {
                    cupDiv: {
                        $exists: false
                    }
                }
            ]
        }).lean().then((res) => {
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
            divObj[thisDiv.divisionConcat]['DRR'] = !!util.returnByPath(thisDiv, 'DRR');
            divObj[thisDiv.divisionConcat]['roundSchedules'] = {};
        }

        // create the schedule object
        let schedObj = {
                "season": season,
                "division": divObj
            }
            //save the schedule object to db
        let sched = await new Scheduling(
            schedObj
        ).save().then((saved) => {
            return true;
        }, (err) => {
            return false;
        });
        //log results
        if (sched) {
            logger(logObj);
        } else {
            logObj.logLevel = 'ERROR';
            logger(logObj);
        }
        returnVal = sched;

    } catch (e) {
        logObj.logLevel = 'ERROR';
        logger(logObj);
        util.errLogger('schedule-sub', e, 'Error in generateSeason');
    }
    return returnVal;

}


//this method generates a round robin schedule
//season:string - the season for which to generate the matches
function generateRoundRobinSchedule(season) {
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
        //loop through each division and create the matches for it
        for (var i = 0; i < keys.length; i++) {

            //local key -> this will be divisionConcat
            let key = keys[i];

            if (!(util.returnByPath(divisions[key], 'cupDiv'))) {

                //local participants -> list of team ids in div
                let participants = divisions[key].participants;

                //use the robin method to create the round robin matches
                let roundRobin = robin(participants.length, participants);
                let matches = divisions[key].matches;

                //for a double round robin division >>>>
                if (util.returnByPath(divisions[key], 'DRR')) {
                    console.log('>>>>> here <<<<<<');
                    let dbl = lodash.clone(roundRobin);
                    dbl.forEach(
                        r => {
                            roundRobin.push(r);
                        }
                    );
                }

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


//helper function to return team info object (name and id) back to the tournament generator
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

    //there are a couple of ways we can get teams and their ids, to make sure we get the ids depending on format
    //run through teams and grab the id, depending on how it was send to us:  we use this array as the participants 
    //for the schedule object
    let teamIds = [];
    let participantsArray = [];
    teams.forEach((team, index) => {
        // team id may have been send as team._id or team.id; several receipts;
        let teamid = team._id ? team._id : team.id
            //add this team id to the array if it isnt there all ready
        if (teamIds.indexOf(teamid)) {
            teamIds.push(teamid);
        }
        //add info to the participants array; seeding is same as order sent
        participantsArray.push({
            "name": team.teamName,
            "seed": index + 1,
            "misc": teamid
        });
    });

    //generate an ID for this tournament
    let tournamentId = uniqid();

    //challonge requires a name; if one was not provided then this tournament is known by uniquid
    name = name ? name : tournamentId

    //create a unique url to this by appending _link to the name
    let url = name + '_link';

    //replace any spaces with _
    url = url.replace(/\s/g, '_');

    //sets a default for description if none was provided
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

            //create a new array that will aggregate all our participant info together
            let finalParticipantArray = []
                //loop through the return from challonge, each participant has an ID from challonge we need.
            addParticipants.forEach(part => {
                //loop through the local particpants to match up the two
                participantsArray.forEach(locPart => {
                    //check the return from challonge and the local participant by their db id; add an object with the NGS ID and the challonge ID of the participant
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

                //send a get request for showing the matches generated for the tournament
                let showTournament = await challonge.showTournament(tournamentId).then(response => {
                    return response;
                });

                //check the show tournament response for errors
                if (showTournament.errors && showTournament.errors.length > 0) {
                    showTournament.errors.forEach(err => {
                        console.log(err);
                    })
                } else {

                    let chalMatches = showTournament.tournament.matches;
                    try {
                        //do stuff with the matches
                        //list of match NGS match ids
                        let matchIDsArray = [];
                        //array to hold the match objects
                        let brackets = [];
                        //array of objects keeping the ngs id and challonge id together
                        let matchesCrossRef = [];
                        //need a reference to the final match of the tournament so we know when to finialize it with challonge
                        let finalMatchRef = {};

                        //loop through the matches returned from challonge and create NGS match objects for them
                        chalMatches.forEach((match) => {

                            match = match.match;
                            //create a temp object, these will become the new match db objects
                            let to = {};
                            //save a challonge reference in the object
                            to["challonge_match_ref"] = String(match.id);
                            //set type to tournament
                            to["type"] = "tournament";
                            //set the season prop
                            to["season"] = season;
                            //save a reference to the challonge tournament this match belongs to
                            to["challonge_tournament_ref"] = String(match.tournament_id);
                            //create a ngs id for this match
                            let ngsID = uniqid();
                            to["matchId"] = ngsID;
                            //set the round property of this match
                            to["round"] = match.round;
                            //set the division property of the match if it was sent to us from request
                            if (division) {
                                to["divisionConcat"] = division;
                            }
                            //add to the matchesCrossRef array the ngs ID and challonge ID so we know whats what
                            matchesCrossRef.push({
                                id: ngsID,
                                challonge_ref: match.id
                            });
                            //if this is the final match of the tournament save it to the finalMatchRef
                            let iter = match.suggested_play_order;
                            if (iter == chalMatches.length) {
                                finalMatchRef['matchId'] = ngsID;
                                finalMatchRef['challonge_ref'] = match.id
                            }
                            //add the ngs match id to the list
                            matchIDsArray.push(ngsID);
                            //save the children IDs to array
                            if (match.prerequisite_match_ids_csv) {
                                to['challonge_idChildren'] = match.prerequisite_match_ids_csv.split(',');
                            }
                            //if a home team is assigned this match; xref its info and add it to the object
                            if (match.player1_id) {
                                to['home'] = returnTeamInfo(participantsArray, finalParticipantArray, match.player1_id);

                            }
                            //if an away team is assigned this match; xref its info and add it to the object
                            if (match.player2_id) {
                                to['away'] = returnTeamInfo(participantsArray, finalParticipantArray, match.player2_id);;
                            }
                            //add the match object to the array
                            brackets.push(to);
                        });

                        //loop through the ngs matches and assign children/parents to the matches that have them
                        brackets.forEach(matchOuter => {
                            //if the match has challonge children
                            if (matchOuter.hasOwnProperty('challonge_idChildren')) {
                                //create a property in the match idChildren (old NGS ways)
                                matchOuter.idChildren = [];
                                //loop through this challonge ids in the challonge_idChildren array
                                matchOuter.challonge_idChildren.forEach(challongeIdChild => {
                                    //loop through the brackets array again...
                                    brackets.forEach(matchInner => {
                                        //if this second loop of match id's challonge ref equals the current challonge Id;
                                        if (matchInner.challonge_match_ref == challongeIdChild) {
                                            //set this match parentId to the outer match
                                            matchInner.parentId = matchOuter.matchId;
                                            //push the inner match id into the outer match children array
                                            matchOuter.idChildren.push(matchInner.matchId);
                                        }
                                    });
                                });
                            }
                        });
                        //was all that necessary?


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


module.exports = {
    generateSeason: generateSeason,
    generateRoundRobinSchedule: generateRoundRobinSchedule,
    generateTournamentTwo: generateTournamentTwo
};

//helper method, accpets a match object, 
//checks if home or away has a bye in it and returns true if so, false if not
// function hasBye(match) {
//     return util.returnByPath(match, 'away.teamName') === 'BYE' || util.returnByPath(match, 'home.teamName') === 'BYE'
// }

//helper method to promote a bye matched tournament game
//promotes any team to paired with bye to the parent match 
// function promoteFromBye(match, matches) {
//     let team;
//     if (util.returnByPath(match, 'away.teamName') !== 'BYE') {
//         team = util.returnByPath(match, 'away');
//     }
//     if (util.returnByPath(match, 'home.teamName') !== 'BYE') {
//         team = util.returnByPath(match, 'home');
//     }

//     if (team != null || team != undefined) {
//         let parent = match.parentId;

//         matches.forEach(matchIt => {
//             if (matchIt.matchId == parent) {
//                 if (!util.returnBoolByPath(matchIt, 'away')) {
//                     matchIt['away'] = team;
//                 } else {
//                     matchIt['home'] = team;
//                 }

//             }
//         })

//     }

// }


//helper method that arranges the seeding into the proper ordering
// function splitSeeded(arr) {
//     var topHalf = [];
//     var bottomHalf = [];
//     //this will grab the odd matches and push them into the top half of the bracket
//     //IE first pair of teams, 0,1 then 4,5 etc, etc
//     for (var i = 0; i < arr.length; i = i + 4) {
//         topHalf.push(arr[i]);
//         topHalf.push(arr[i + 1]);
//     }
//     //this will grab the even matches and push them into the bottom half of the bracket
//     //IE second pair of teams, 2,3 then 6,7 etc.
//     for (var i = 2; i < arr.length; i = i + 4) {
//         bottomHalf.push(arr[i]);
//         bottomHalf.push(arr[i + 1]);
//     }
//     //combine the arrays and return them back
//     arr = [];
//     arr = topHalf.concat(bottomHalf);
//     return arr;
// }

// //generate tournament schedules
// //accepts 
// //teams: array of team objects, {id or _id, teamName, logo}
// //season: number, the season that this tournament is for or the iteration of the tournament
// //division: the division info the tournament is for, if it is for one
// //name: name of tournament

// async function generateTournament(teams, season, division, cup, name) {
//   //the bracket function requires of an array of special team objects, 
//   let _teams = [];

//   //there are a couple of ways we can get teams and their ids, to make sure we get the ids depening of format
//   //run through teams and grab the id, depending on where it was send to us:  we use this array as the participants 
//   //for the schedule object
//   let teamIds = [];
//   teams.forEach(team => {
//     let teamid = team._id ? team._id : team.id
//     if (teamIds.indexOf(teamid)) {
//       teamIds.push(teamid);
//     }
//     //create the special team object and add it to the _team array
//     _teams.push(
//       new Team(teamid, team.teamName, team.logo)
//     );
//   });


//   //generate a bracket tree that's a good round number, 2, 4, 8, 16 (fill the odds with byes)
//   let expTeamLength = Math.pow(2, Math.ceil(Math.log2(_teams.length)));

//   //create byes to fill any empty spaces in our team numbers 
//   while (_teams.length < expTeamLength) {
//     _teams.push(
//       new Team(null, 'BYE')
//     )
//   }

//   //this will hold our seeded teams
//   //the bracket creator creates the match trees ingesting the array
//   //creating the first matches, then building the tree upwards to the final round
//   //we must pair the seeds properly then, split the array in halfs to make sure the bracket populates properly
//   let seeded = [];
//   do {
//     //take the team in the top of the array (ie top seed)
//     let topSeed = _teams.splice(0, 1);
//     //take the team at the bottom of the array (ie bottom seed)
//     let bottomSeed = _teams.splice(_teams.length - 1, _teams.length);
//     //pair them together in the seeded array
//     seeded = seeded.concat([topSeed[0], bottomSeed[0]]);

//   }
//   while (_teams.length > 0);

//   //arrange the top and bottom half of the bracket correctly
//   seeded = splitSeeded(seeded);

//   //create the tournament and brackets
//   let tournament = new Tournament(seeded, name);
//   let brackets = tournament.generateBrackets();

//   //brackets are returned as objects with thier on properties, 
//   //add the properties to the object that our other matches have


//   brackets.forEach(bracket => {
//     bracket['type'] = 'tournament';
//     if (division) {
//       bracket['divisionConcat'] = division;
//     }
//     if (season) {
//       bracket['season'] = season;
//     }
//     if (name) {
//       bracket['name'] = name;
//     }
//     //if the match had idChildren, add a property parentId to each of the children
//     let parent = bracket.id;
//     if (bracket.idChildren.length > 0) {
//       //loop through each child
//       bracket.idChildren.forEach(id => {
//         //loop through all brackets to see which ids match the current child
//         brackets.forEach(subBrack => {
//           if (id == subBrack.id) {
//             subBrack.parentId = parent;
//           }
//         })
//       })
//     }
//   });

//   //loop through the bracket objects and replace the current ID with a uuid matchId
//   let matchIDsArray = [];
//   brackets.forEach(bracket => {
//     let newId = uniqid();
//     let id = bracket.id;
//     bracket['matchId'] = newId;
//     matchIDsArray.push(newId);
//     delete bracket.id;
//     brackets.forEach(subBrack => {
//       if (subBrack.parentId == id) {
//         subBrack.parentId = newId;
//       }
//       let ind = subBrack.idChildren.indexOf(id);
//       if (ind > -1) {
//         subBrack.idChildren[ind] = newId;
//       }
//     });
//     //if the match has a bye game, promote the team against the bye forward automatically
//     if (hasBye(bracket)) {
//       promoteFromBye(bracket, brackets);
//     }
//   });


//   //insert the formed up bracked objects into the matches table
//   let matches = await Match.insertMany(brackets).then(res => {
//     console.log('matches inserted!');
//     return res;
//   }, err => {
//     console.log(err);
//     console.log('error inserting matches ', err);
//     return err;
//   });

//   //create a schedule object to go along with this tournament
//   //give it particpants and the matches asscoated with this tournament
//   let schedObj = {
//     'type': 'tournament',
//     'name': name,
//     'division': division,
//     'season': season,
//     'participants': teamIds,
//     'matches': matchIDsArray
//   }
//   let schedule = await new Scheduling(
//     schedObj
//   ).save().then((saved) => {
//     // console.log('fin', JSON.stringify(saved));
//     return saved;
//   }, (err) => {
//     // console.log(err);
//     return err;
//   });

//   return {
//     'matches': matches,
//     'schedule': schedule
//   };

// }

//2-15-19 : not currently in use as we do not anticipate swiss scheduling
//this method generates a particular round of a tournament with the swiss system
//NOTE - the matches must be reported, regardless of outcome in order for the swiss
//to properly generate a schedule!
// function generateRoundSchedules(season, round) {
//   Scheduling.findOne({
//     "season": season
//   }).then((found) => {
//     let divisions = found.division;
//     let keys = Object.keys(divisions);
//     //get data from the found object
//     for (var i = 0; i < keys.length; i++) {
//       let key = keys[i];
//       //get data should be of a divsison
//       let participants = divisions[key].participants;
//       let matches = divisions[key].matches;
//       let roundSchedules = divisions[key].roundSchedules;
//       let schedule = swiss.getMatchups(round, participants, matches);
//       //if a schedule was generated, save it to the round schedules
//       if (schedule.length > 0) {
//         //if round schedles didn't exist on the object before, create it
//         if (roundSchedules == undefined || roundSchedules == null) {
//           divisions[key].roundSchedules = {};
//           roundSchedules = divisions[key].roundSchedules;
//         }
//         round = round.toString();
//         roundSchedules[round] = schedule;
//       }
//     }

//     //save the schedule object.
//     found.markModified('division');
//     found.save().then((saved) => {
//       // console.log('fin  schedules');
//     }, (err) => {
//       // console.log('ERROR : ', err);
//     })
//   });
// }