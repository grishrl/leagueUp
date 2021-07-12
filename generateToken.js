const jwt = require('jsonwebtoken');
const System = require('./server/models/system-models');
const _ = require('lodash');
const mongoose = require('mongoose')
const teamSubs = require('./server/subroutines/team-subs');
// const Archive = require('./server/models/system-models').archive;
const Match = require('./server/models/match-model');
const util = require('./server/utils');
const matchCommon = require('./server/methods/matchCommon');
const groupMakerTest = require('./server/cron-routines/groupMaker');
const Archive = require('./server/methods/archivalMethods');
const hpAPI = require('./server/methods/heroesProfileAPI');
const fs = require('fs');
const casterReport = require('./server/methods/casterReportMethods');
const UserSub = require('./server/subroutines/user-subs');

// connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});

let tokenObject = {};
// set this ID to the _id that the API key will be tied to
tokenObject.id = "60ddff203070414c13d74468";

//set this to false to create a std JWToken for API calls, or true for an API key :)
//to remind you; the api key will only work in instances that are set to validate it IE it will fail jwt because
//it isn't signed by a user; 
//
var api = true;
var token
if (api) {
    token = jwt.sign(tokenObject, process.env.jwtToken);
} else {
    token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '7d'
    });
}
//!!!!!!!!!!!!!!!!!!!!!!! API KEY GENERATOR  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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


/// 7-7-21 Clear User Sub Testing...
UserSub.clearUsersTeam(['DHCæsarsalad#1517'], true);

// console.log('token ', token);



// vodCur();

// casterReport.generateCastReportData().then(
//     f => {
//         console.log('f', f);
//     },
//     e => {
//         console.log('e', e);
//     }
// )

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
// const list = [];

// Match.find({
//     $and: [
//         { season: 11 },
//         { divisionConcat: 'e-east' },
//         { reported: true },
//         { $or: [{ forfeit: false }, { forfeit: { $exists: false } }] }
//     ]
// }).then(
//     (found) => {
//         console.log(found.length);
//         found.forEach(
//             match => {
//                 let obj = match.toObject();
//                 if (obj.replays) {
//                     _.forEach(obj.replays, (v, k) => {
//                         console.log('V', v);
//                         if (v && v.url) {
//                             console.log(`${process.env.heroProfileReplay}${v.url}`);
//                             list.push(`${process.env.heroProfileReplay}${v.url}`);
//                         }
//                     })
//                 }
//             }
//         );

//         fs.writeFile('downloadList.txt', JSON.stringify(list), (err) => {
//             console.log(err);
//         });

//     }
// )

// Archive.archiveDivisions().then(
//     res => {
//         console.log(res);
//     },
//     err => {
//         console.log(err);
//     }
// )

// hpAPI.playerMmrAPI('wraithling#1178').then(
//     res => {

//         console.log('ret 1', res);
//     },
//     err => {
//         console.log(err);
//     }
// );

// hpAPI.playerProfile('wraithling#1178').then(
//     res => {

//         console.log('ret 2', res);
//     },
//     err => {
//         console.log(err);
//     }
// );

// hpAPI.highestStat('kills', '7').then(
//     res => {

//         console.log('ret 3', res);
//     },
//     err => {
//         console.log(err);
//     }
// );




// let query = {


//     type: 'team'

// };

// Archive.find(query).then(found => {
//     let ind = 0;

//     for (let x = 0; x < found.length; x++) {
//         console.log('updating ', x + 1, ' of ', found.length);
//         let obj = found[x];

//         obj['object']['teamId'] = obj['object']['_id'].toString();

//         obj.markModified('object');

//         obj.save().then(
//             saved => {
//                 console.log('saved ', x + 1, ' of ', found.length);
//             }
//         )

//     }
// })

// date???
// let query = {
//     $and: [{
//             season: 7
//         },
//         {
//             reported: true
//         }
//     ]
// };

// let mostRecent = undefined;
// let limit = undefined;
// let pastSeason = false;

/**  */
// Match.find(query).lean().then(
//     found => {
//         if (found) {
//             if (mostRecent == 'des') {
//                 found = util.sortMatchesByTime(found);
//                 found.reverse();
//             } else if (mostRecent == 'asc') {
//                 found = util.sortMatchesByTime(found);
//             }

//             if (limit) {
//                 limit = limit > found.length ? found.length : limit;
//                 found = found.slice(0, limit);
//             }

//             if (pastSeason) {
//                 matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
//                     processed => {
//                         // res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
//                         console.log(processed);
//                     },
//                     err => {
//                         console.log(err);
//                         // res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
//                     }
//                 )
//             } else {
//                 matchCommon.addTeamInfoToMatch(found).then(
//                     processed => {
//                         console.log(processed);
//                         // res.status(200).send(util.returnMessaging(path, 'Found these matches', null, processed));
//                     },
//                     err => {
//                         console.log(err);
//                         // res.status(400).send(util.returnMessaging(path, 'Error compiling match info', err));
//                     }
//                 )
//             }
//         } else {
//             console.log(found);
//             // res.status(200).send(util.returnMessaging(path, 'No Matches Found', null, found));
//         }
//     }, err => {
//         console.log(err);

//         // res.status(500).send(util.returnMessaging(path, 'Error getting matches', err));
//     }
// )

/*9-10-19 - add zero gmt time to team info*/
// groupMakerTest.zeroTeamTimes().then(
//     res => {
//         console.log(res);
//     },
//     err => {
//         console.log(err);
//     }
// )

/*9-10-19 - add zero gmt time to user info*/
// groupMakerTest.zeroUserTimes().then(
//     res => {
//         console.log(res);
//     },
//     err => {
//         console.log(err);
//     }
// )

/*9-10-19 - add zero gmt time to team info*/
// groupMakerTest.suggestUserToTeam().then(
//     res => {
//         console.log(res);
//     },
//     err => {
//         console.log(err);
//     }
// )


// test
// groupMakerTest.suggestUserToUser().then(
//     res => {
//         console.log(res);
//     },
//     err => {
//         console.log(err);
//     }
// );≠≠