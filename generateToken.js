const jwt = require('jsonwebtoken');
const System = require('./server/models/system-models');
const mongoose = require('mongoose')
const teamSubs = require('./server/subroutines/team-subs');

let tokenObject = {};
// set this ID to the _id that the API key will be tied to
tokenObject.id = "5c62f9d8a55a147ce08c9674";

//set this to false to create a std JWToken for API calls, or true for an API key :)
var api = true;

if (api) {
    var token = jwt.sign(tokenObject, process.env.apiKey);
} else {
    var token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '7d'
    });
}



console.log('token ', token);

// connect to mongo db
// mongoose.connect(process.env.mongoURI, () => {
//     console.log('connected to mongodb');
// });

// new System.system({
//     'dataName': 'apiKey',
//     'value': token
// }).save().then(
//     saved => {
//         console.log('saved ', ' token ', token);
//         process.exit(0);
//     },
//     err => {
//         console.log('not saved ', ' token ', token);
//         process.exit(0);
//     }
// );

const challonge = require('./server/methods/challongeAPI');

async function test() {
    let tournaments = await challonge.retriveTournaments([6665011, 6381764, 6382688]).then(response => { return response; });
    console.log(tournaments);
    // let newTournament = await challonge.createTournament('nodeTest13', 'node_test13', 'A test from node').then(response => {
    //     return response;
    // }, err => { console.log(err); return null; });
    // if (newTournament.errors && newTournament.errors.length > 0) {
    //     newTournament.errors.forEach(err => {
    //         console.log(err);
    //     })
    // } else {
    //     //tournamnet create ok
    //     /*
    //     {
    //       tournament:{
    //         //info
    //       }
    //     }
    //      */
    //     console.log('newTournament ', newTournament);
    //     let tournamentId = newTournament.tournament.id;

    //     let participants = [{
    //         "name": "A",
    //         "misc": 1.
    //     }, {
    //         "name": "b",
    //         "misc": 2
    //     }, {
    //         "name": "c",
    //         "misc": 3
    //     }, {
    //         "name": "d",
    //         "misc": 4
    //     }, {
    //         "name": "e",
    //         "misc": 5
    //     }, {
    //         "name": "f",
    //         "misc": 6
    //     }, ]

    //     participants.forEach((part, index) => {
    //         part['seed'] = index + 1;
    //     });

    //     let addParticipants = await challonge.bulkParticpantsAdd(tournamentId, participants).then(response => { return response; });

    //     if (addParticipants.errors && addParticipants.errors.length > 0) {
    //         addParticipants.errors.forEach(err => {
    //             console.log(err);
    //         })
    //     } else {
    //         //partipants add ok
    //         /*
    //         return as [
    //           {
    //             participant:{
    //               //info
    //             }
    //           }
    //         ]
    //          */
    //         let finalParticipantArray = []
    //         addParticipants.forEach(part => {
    //             participants.forEach(locPart => {
    //                 if (part.participant.name == locPart.name) {
    //                     finalParticipantArray.push({ "id": locPart.misc, "challonge_ref": part.participant.id });
    //                 }
    //             });
    //         });
    //         console.log('finalParticipantArray ', finalParticipantArray);

    //         let startStatus = await challonge.startTournament(tournamentId).then(response => { return response; });

    //         if (startStatus.errors && startStatus.errors.length > 0) {
    //             startStatus.errors.forEach(err => {
    //                 console.log(err);
    //             })
    //         } else {
    //             //tournamnet has been started
    //             let showTournament = await challonge.showTournament(tournamentId).then(response => { return response; });

    //             if (showTournament.errors && showTournament.errors.length > 0) {
    //                 showTournament.errors.forEach(err => {
    //                     console.log(err);
    //                 })
    //             } else {
    //                 let matches = showTournament.tournament.matches;

    //                 console.log('matches ', matches)
    //                     //do stuff with the matches
    //             }
    //         }

    //     }

    // }
}

test().then(
    y => {
        console.log('i ran the test');
    }
)