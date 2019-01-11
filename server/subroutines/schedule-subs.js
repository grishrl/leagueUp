const Team = require('../models/team-models');
const Division = require('../models/division-models');
const Scheduling = require('../models/schedule-models');
const uniqid = require('uniqid');
const Match = require('../models/match-model');
const util = require('../utils');
const robin = require('roundrobin');


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
    let divObj = {};
    let getDivision = await Division.find().then((res) => {
        return res;
    });
    for (var i = 0; i < getDivision.length; i++) {
        let thisDiv = getDivision[i];
        // console.log('thisDiv ', thisDiv)
        divObj[thisDiv.divisionConcat] = {};
        let lowerTeam = [];
        thisDiv.teams.forEach(iterTeam => {
            lowerTeam.push(iterTeam.toLowerCase());
        });
        // console.log('lowerTeam ', lowerTeam)
        let participants = await Team.find({
            teamName_lower: {
                $in: lowerTeam
            }
        }).then((teams) => {
            let participants = [];
            if (teams && teams.length > 0) {
                teams.forEach(team => {
                    participants.push(team._id.toString());
                });
            }
            return participants;
        });
        divObj[thisDiv.divisionConcat]['participants'] = participants;
        divObj[thisDiv.divisionConcat]['matches'] = [];
        divObj[thisDiv.divisionConcat]['roundSchedules'] = {};
    }

    // console.log('this is divObj before creating new schedule obj: ', divObj);
    let schedObj = {
            "season": season,
            "division": divObj
        }
        // console.log('this is divObj before creating new schedule obj: ', schedObj);
    let sched = await new Scheduling(
        schedObj
    ).save().then((saved) => {
        // console.log('fin', JSON.stringify(saved));
        return true;
    }, (err) => {
        // console.log(err);
        return false;
    });
    return sched;
}

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

//this method generates a round robin schedule using the swiss generator: 
//instead of generating log 2 N rounds with match results to bracketize
//we generate the N-1 rounds, and keep up with matches, regardless of wins so that we dont rematch

function generateRoundRobinSchedule(season) {
    Scheduling.findOne({
        "season": season
    }).then((found) => {
        let divisions = found.division;
        let keys = Object.keys(divisions);
        //get some data from our found object of
        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            //get data from the property - should be a division name:
            let participants = divisions[key].participants;
            //variable of rounds to generate, will be N - 1 if even, or N if odd number teamas;

            let rounds;
            if (participants.length % 2 == 0) {
                rounds = participants.length - 1;
            } else {
                rounds = participants.length;
            }
            let roundSchedules = divisions[key].roundSchedules;
            let roundRobin = robin(participants.length, participants);
            let matches = divisions[key].matches;

            for (var j = 0; j < roundRobin.length; j++) {
                let roundNum = j + 1;
                let round = roundRobin[j];
                round.forEach(match => {
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
                    matches.push(matchObj);
                });
            }
            Match.insertMany(matches).then(res => {
                console.log('matches inserted!');
            }, err => {
                console.log('error inserting matches');
            });
        }

        found.markModified('division');
        found.save().then((saved) => {
            console.log('season saved');
        }, (err) => {
            console.log('season save error!');
        })

    });
}

/*
Need to generate 3 rounds ahead of time, then add those to the matches - no score reported
So that we can generate further schedules without having rematches occur.
*/



module.exports = {
    generateSeason: generateSeason,
    generateRoundSchedules: generateRoundSchedules,
    generateRoundRobinSchedule: generateRoundRobinSchedule
};


// if (matches.length > 0) {
//     Match.insertMany(matches).then(res => {
//         // console.log('matches inserted!');
//     }, err => {
//         // console.log('error inserting matches');
//     })
// }

// console.log(matches);
//loop through and create the required number of rounds
// for (var j = 0; j < rounds; j++) {
//     let round = j + 1;
//     let schedule = swiss.getMatchups(round, participants, matches);
//     //once a round has been generated, add to the matches parameter, 
//     //this way we can ensure that no teams are rematched.
//     schedule.forEach(match => {
//         let matchObj = {
//             "round": round,
//             home: {
//                 id: match.home
//             },
//             away: {
//                 id: match.away
//             }
//         }
//         matches.push(matchObj);
//     });
//     //if a schedule was generated, add it to the round schedules
//     if (schedule.length > 0) {
//         schedule.forEach(match => {
//             match.matchId = uniqid();
//         });
//         //if round schedules didnt exist on the object, create it
//         if (roundSchedules == undefined || roundSchedules == null) {
//             divisions[key].roundSchedules = {};
//             roundSchedules = divisions[key].roundSchedules;
//         }
//         round = round.toString();
//         roundSchedules[round] = schedule;
//     }
// }

//save the schedule

//save the schedule
// found.markModified('division');
// found.save().then((saved) => {
//     /*

//     Now create the new table that is matches only!

//     */
//     // let matchesToInsert = [];
//     // let divisions = saved.division;
//     // let divisionNames = Object.keys(divisions);
//     // //get some data from our found object of
//     // for (var i = 0; i < divisionNames.length; i++) {
//     //     let divisionName = divisionNames[i];
//     //     let roundSchedules = divisions[divisionName].roundSchedules;
//     //     if (roundSchedules != null || roundSchedules != undefined) {
//     //         if (Object.entries(roundSchedules).length > 0) {
//     //             let rounds = Object.keys(roundSchedules);
//     //             rounds.forEach(round => {
//     //                 let matches = roundSchedules[round];
//     //                 matches.forEach(match => {
//     //                     // console.log('match ', match)
//     //                     let newMatch = Object.assign({}, match);
//     //                     newMatch.round = round;
//     //                     newMatch.home = {};
//     //                     if (match.home == null) {
//     //                         newMatch.home.id = 'null';
//     //                     } else {
//     //                         newMatch.home.id = match.home;
//     //                     }
//     //                     newMatch.away = {};
//     //                     if (match.away == null) {
//     //                         newMatch.away.id = 'null';
//     //                     } else {
//     //                         newMatch.away.id = match.away;
//     //                     }
//     //                     // newMatch.home.id = match.home;
//     //                     // newMatch.away.id = match.away;
//     //                     newMatch.season = season;
//     //                     newMatch.divisionConcat = divisionName;
//     //                     // console.log('newMatch ', newMatch);
//     //                     matchesToInsert.push(newMatch);
//     //                 });
//     //             });
//     //         }
//     //     }
//     // }
//     // if (matchesToInsert.length > 0) {
//     //     Match.insertMany(matchesToInsert).then(res => {
//     //         // console.log('matches inserted!');
//     //     }, err => {
//     //         // console.log('error inserting matches');
//     //     })
//     // }
//     // console.log('fin  schedules');
// }, (err) => {
//     // console.log('ERROR : ', err);
// })