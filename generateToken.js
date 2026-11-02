const jwt = require('jsonwebtoken');
const System = require('./server/models/system-models');
const _ = require('lodash');
const mongoose = require('mongoose');
const teamSubs = require('./server/subroutines/team-subs');
// const Archive = require('./server/models/system-models').archive;
const Match = require('./server/models/match-model');
const util = require('./server/utils');
const matchCommon = require('./server/methods/matchCommon');
const groupMakerTest = require('./server/cron-routines/groupMaker');
const Archive = require('./server/methods/archivalMethods');
const hpAPI = require('./server/methods/heroesProfileAPI');
const fs = require('fs');
// const casterReport = require('./server/methods/casterReportMethods');
const UserSub = require('./server/subroutines/user-subs');
const testing = require('./server/workers/vods-playlist-curator');
const CasterReportWorker = require('./server/workers/write-caster-report');
const StatsJobs = require('./server/cron-routines/stats-routines');
const loadConfig = require('./loadConfig');
const ParsedReplay = require('./server/models/replay-parsed-models');
const { s3putObject } = require('./server/methods/aws-s3/put-s3-file');
const getRegisteredTeams = require('./server/methods/team/getRegistered');
const AWS = require('aws-sdk');
const associateReplaysWorker = require('./server/workers/associate-replays');

const CURRENT_WORKING_SEASON = 18;

//bootstrap the program from AWS configs...
loadConfig().finally(function () {
    // connect to mongo db
    mongoose.connect(process.env.mongoURI, () => {
        console.log('connected to mongodb');
    });

    let tokenObject = {};
    // set this ID to the _id that the API key will be tied to
    tokenObject.id = '5c4524d0f3614c0017235167';

    //set this to false to create a std JWToken for API calls, or true for an API key :)
    //to remind you; the api key will only work in instances that are set to validate it IE it will fail jwt because
    //it isn't signed by a user;
    //
    var api = true;
    var token;
    if (api) {
        token = jwt.sign(tokenObject, process.env.jwtToken);
    } else {
        token = jwt.sign(tokenObject, process.env.jwtToken, {
            expiresIn: '7d',
        });
    }

    //Operational code goes here now...
    associateReplaysWorker();
    // fixSeasonReplay();

});

async function fixSeasonReplay(){
    const ngsStatsOfTheStorm = process.env.s3bucketStats; //'ngs-stats-of-the-storm';

    AWS.config.update({
        accessKeyId: process.env.S3accessKeyId,
        secretAccessKey: process.env.S3secretAccessKey,
        region: process.env.S3region,
    });

    const s3 = new AWS.S3();

    const params = {
        Bucket: ngsStatsOfTheStorm,
        Prefix: `${CURRENT_WORKING_SEASON}/parsedReplays`,
    };

    const data = await s3.listObjectsV2(params).promise();

    let systemIds = [];

    data.Contents.forEach(obj => {
        // console.log(obj.Key);
        let parts = obj.Key.split('/');
        let file = parts[parts.length - 1];
        let fileParts = file.split('.');
        console.log(fileParts[0]);
        systemIds.push(fileParts[0]);
    });

    console.log(systemIds.length);

    const result = await ParsedReplay.updateMany(
        { season: 18 }, // Query condition to match documents with season 18
        { $set: { season: null } } // Update operation to set season to null
    );

    console.log(`${result.nModified} replays updated.`);


    // Write systemIds to a JSON file
    fs.writeFile('systemIds.json', JSON.stringify(systemIds, null, 2), err => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('systemIds have been written to systemIds.json');
        }
    });

    // data.Contents.forEach(
    //     obj=>{
    //         // console.log(obj.Key);
    //         let parts = obj.Key.split('/');
    //         let file = parts[parts.length-1]
    //         let fileParts = file.split('.');
    //         console.log(fileParts[0]);
    //         systemIds.push(fileParts[0]);
    //     }
    // )

    const foundReplays = await ParsedReplay.find({systemId:{$in:systemIds}});

    foundReplays.forEach( element=>{
        element.season = CURRENT_WORKING_SEASON;
        element.markModified('season');
        element.save().then(s=>{
            console.log('saved', s)
        },err=>{
            console.log(err);
        });
    });

    
}


// async function fixAllReplayLink(){
//     let matches = await Match.find();

//     let grief = [];

//     for(i=2; i<matches.length; i++){
//         let match = matches[i];
//         console.log('working: ' + i + 1 + ' of ' + matches.length);
        
//         if (match.postedToHP) {
//             const replays = match.toObject().replays;
//             for (key in replays) {
//                 let v = replays[key];
//                 if (_.has(v, 'parsedUrl')) {
//                     const copyOfObj = util.JSONCopy(v);
//                     console.log('v.get', v.parsedUrl);
//                     try {
//                         let orig = copyOfObj.parsedUrl;
//                         v.originalUrl = orig;
//                         let a = orig.split('?');
//                         let b = a[1].split('=')[1];
//                         v.parsedUrl = `https://www.heroesprofile.com/Esports/NGS/Match/Single/${b}`;
//                     } catch (e) {
//                         console.log('ERROR ON MATCH:', match.matchId);
//                         if(grief.indexOf(match.matchId)==-1){
//                             grief.push(match.matchId);
//                         }
//                     }
//                 }
//             }

//             match.replays = replays;

//             match.markModified('replays');
//             await match.save();
            
//         }
//     }

//     fs.writeFile('grief.json', JSON.stringify(grief), err => {
//         console.log(err);
//     });
//     console.log('done');
//     return 1;
// }

// async function processReplayInfoFromS3(){
//     const s3 = new AWS.S3({
//         accessKeyId: process.env.S3accessKeyId,
//         secretAccessKey: process.env.S3secretAccessKey,
//         region: 'us-east-1',
//         params: {
//             Bucket: 'ngs-stats-of-the-storm',
//         },
//     });

//     let matches = await Match.find({$and:[{season:16},{reported:true}]});

//     console.log(matches.length);

//     for(var i = 0; i<matches.length; i++){
        
//         let match = matches[i];
//         console.log('processing: ',' ', match.matchId, ' ', i + 1);
//         if(Object.keys(match.replays).length>1){

//             let replays = [];

//             replays.push(match.replays["1"]);
//             replays.push(match.replays['2']);
//             replays.push(match.replays['3'])

//             for(let j=0; j<replays.length; j++){
//             let replayOne = replays[j];
//             if (replayOne && replayOne.data) {
//                 console.log(`handling data id: ${replayOne.data}`);
//                 let key = `16/parsedReplays/${replayOne.data}.json`;
//                 let parsedReplay = await s3
//                     .getObject({
//                         Key: key,
//                     })
//                     .promise();
//                 parsedReplay = JSON.parse(parsedReplay.Body.toString('utf-8'));
//                 let sysreplay = await ParsedReplay.findOne({
//                     systemId: replayOne.data,
//                 });
//                 sysreplay.match.map = parsedReplay.match.map;
//                 sysreplay.markModified("match");
//                 sysreplay.save();
//             }

//             }

//         }
//     }


// }


// async function reparseReplays() {
//     const tmp = require('tmp-promise');
//     const parser = require('hots-parser');
//     AWS.config.update({
//         accessKeyId: process.env.S3accessKeyId,
//         secretAccessKey: process.env.S3secretAccessKey,
//         region: process.env.S3region,
//     });

//     const s3replayBucket = new AWS.S3({
//         params: {
//             Bucket: process.env.s3bucketReplays,
//         },
//     });

//     /**
//      * {
//         $and: [{ season: 15 }, { reported: true }],
//     }
//      * 
//      */
//     let matches = await Match.find({
//         $and: [{ season: CURRENT_WORKING_SEASON }, { reported: true }],
//     });
//     let beginTime = Date.now();
//     console.log(`found ${matches.length} matches`);
//     if (matches) {
//         for (var i = 0; i < matches.length; i++) {
//             console.log(`processing ${i + 1} of ${matches.length}`);
//             //get match info
//             let match = matches[i];
//             let matchObj = util.objectify(match);
//             if (util.returnBoolByPath(matchObj, 'replays')) {
//                 let replays = matchObj.replays;

//                 let replaysKeys = Object.keys(replays);

//                 for (var j = 0; j < replaysKeys.length; j++) {
//                     let value = replaysKeys[j];

//                     if (value != '_id') {
//                         let replayInfo = replays[value];
//                         let fileUrl = replayInfo['url'];
//                         let replayUUID = replayInfo['data'];

//                         console.log(`re-parse ${fileUrl}, UUID: ${replayUUID}`);
//                         if (fileUrl) {
//                             let dat = await s3replayBucket
//                                 .getObject({
//                                     Key: fileUrl,
//                                 })
//                                 .promise()
//                                 .then(
//                                     dat => {
//                                         return dat;
//                                     },
//                                     err => {
//                                         return null;
//                                     }
//                                 );

//                             if (dat) {
//                                 try {
//                                     const { fd, path, cleanup } =
//                                         await tmp.file();
//                                     let f = await fs.promises.appendFile(
//                                         path,
//                                         dat.Body
//                                     );
//                                     let parsedReplay = parser.processReplay(
//                                         path,
//                                         {
//                                             overrideVerifiedBuild: true,
//                                         }
//                                     );

//                                     if (parsedReplay.status != 1) {
//                                         parsedReplay['failed'] = true;
//                                     }
//                                     await s3putObject(
//                                         'ngs-stats-of-the-storm',
//                                         `${CURRENT_WORKING_SEASON}/parsedReplays`,
//                                         `${replayUUID}.json`,
//                                         JSON.stringify(parsedReplay)
//                                     );
//                                     let foundReplay = await ParsedReplay.find({
//                                         systemId: replayUUID,
//                                     });
//                                     foundReplay = foundReplay[0];
//                                     foundReplay.match = {};
//                                     foundReplay.players = {};
//                                     foundReplay.markModified('match');
//                                     foundReplay.markModified('players');
//                                     await foundReplay.save().then(
//                                         r => {
//                                             console.log(
//                                                 `${replayUUID} replay cleared ok`
//                                             );
//                                         },
//                                         e => {
//                                             console.log(
//                                                 `error clearing ${replayUUID}`
//                                             );
//                                         }
//                                     );
//                                     cleanup();
//                                 } catch (error) {
//                                     util.errLogger(
//                                         'moveAndParseTempFiles, parsing:',
//                                         error,
//                                         'caught parse error'
//                                     );
//                                 }
//                             } else {
//                                 //no dat!!!
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//         console.log('done');
//         let endTimestamp = Date.now();
//         let elapsed = endTimestamp - beginTime;
//         console.log(`took ${elapsed / (60 * 1000)} minutes`);
//     }
// }

// async function moveMatchesToS3() {
//     let matches = await Match.find({
//         $and: [{ season: 15 }, { reported: true }],
//     });
//     if (matches) {
//         await s3putObject(
//             'ngs-stats-of-the-storm',
//             '15',
//             `matches.json`,
//             JSON.stringify(matches)
//         );
//         console.log('finished...');
//     }
// }

// async function moveTeamsToS3() {
//     let teams = await getRegisteredTeams();
//     s3putObject(
//         'ngs-stats-of-the-storm',
//         '15',
//         `teams.json`,
//         JSON.stringify(teams)
//     );
// }

//ngs-stats-of-the-storm

// async function moveParsedReplaysToS3() {
//     let allMatches = await Match.find({
//         $and: [{ season: 15 }, { replays: { $exists: true } }],
//     });
//     console.log(`Found ${allMatches.length}  matches..`);
//     if (allMatches) {
//         for (var i = 0; i < allMatches.length; i++) {
//             console.log(
//                 `Processing ${i + 1} of ${allMatches.length} matches..`
//             );
//             let match = allMatches[i];
//             if (
//                 util.returnBoolByPath(match, 'replays') &&
//                 Object.keys(match.replays).length > 0
//             ) {
//                 let matchObj = util.objectify(match);
//                 let replayObj = matchObj.replays;

//                 let keys = Object.keys(replayObj);

//                 for (var j = 0; j < keys.length; j++) {
//                     let key = keys[j];

//                     if (key != '_id') {
//                         let replayInfo = replayObj[key];
//                         let replayDataKey = null;
//                         if (util.returnBoolByPath(replayInfo, 'data')) {
//                             replayDataKey = replayInfo.data;
//                         }
//                         if (replayDataKey) {
//                             let parsedReplayInfo = await ParsedReplay.findOne({
//                                 systemId: replayDataKey,
//                             });
//                             console.log(`S3ing replay json...`);
//                             await s3putObject(
//                                 'ngs-stats-of-the-storm',
//                                 '15',
//                                 `${replayDataKey}.json`,
//                                 JSON.stringify(parsedReplayInfo)
//                             );
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     console.log('finished...');
// }

// console.log('token',token);

// function updateSystemSchema() {
//     const factory = {};

//     factory.doNotCopy = ['_id', 'span', 'stat', 'value'];
//     factory.okObjects = ['youtubeReport'];
//     factory.objects = [];
//     factory.keepKeys = ['_id', 'dataName', 'data'];
//     factory.runMore = false;
//     factory.perPage = 50;
//     factory.page = 0;
//     factory.getObjects = function() {
//         System.system.find().limit(this.perPage).skip(this.page*this.perPage).then(
//             (found) => {
//                 this.objects = this.objects.concat(found);
//                 if (found.length == this.perPage) {
//                     this.page++;
//                     this.getObjects();
//                 }else{
//                     console.log('might be done');
//                     console.log('zz', this.objects);
//                     console.log('ll', this.objects.length);
//                     this.updateObjects();
//                 }
//             }
//         )
//     }

//     factory.updateObjects = function() {
//         this.objects.forEach(
//             item => {
//                 let object = util.objectify(item);
//                 // let keys = Object.keys(object);
//                 let dataName = object.dataName;
//                 if (this.okObjects.indexOf(dataName) == -1) {
//                     if (dataName == 'TopStatList') {
//                         let tDat = object.data;
//                         let newDat = {};
//                         newDat.span = object.span;
//                         object.span = undefined;
//                         item.span = undefined;
//                         delete item.span;
//                         item.set('span', undefined);
//                         newDat.stat = object.stat;
//                         object.stat = undefined;
//                         item.stat = undefined;
//                         delete item.stat;
//                         item.set('stat', undefined);
//                         newDat.list = tDat;
//                         object.data = newDat;

//                     } else if (dataName == 'leagueRunningFunStats') {
//                         object.data.span = object.span;
//                         object.span = undefined;
//                         item.span = undefined;
//                         delete item.span;
//                         item.set('span', undefined);
//                     } else if (dataName == 'apiKey') {
//                         object.data = {};
//                         object.data.value = object.value;
//                         object.value = undefined;
//                         delete item.value;
//                         item.set('value', undefined);
//                     } else if (dataName == 'seasonInfo') {
//                         object.data.value = object.value;
//                         item.value = undefined;
//                         delete item.value;
//                         item.set('value', undefined);
//                         object.value = undefined;
//                     } else if (object.season) {
//                         let tDat = object.data ? object.data : [];
//                         let newDat = {};
//                         newDat.standings = tDat;
//                         newDat.season = object.season;
//                         object.data = newDat;
//                         object.season = undefined;
//                         item.season = undefined;
//                         item.set('season', undefined);
//                         delete item.season;
//                     }
//                 }

//                 Object.keys(object).forEach(
//                     key=>{
//                         item[key]=object[key];
//                     }
//                 );

//                             item.save().then(
//                                 r => {
//                                     console.log('saved');
//                                 },
//                                 e => {
//                                     console.log('save failed');
//                                 }
//                             );
//             });

//             console.log(this.objects);
//     }

//     factory.report = function(){
//         console.log(this.objects);
//     }

//     factory.run = function(){
//         this.getObjects();
//     }

//     return factory;
// }

// StatsJobs.leagueStatRunner().then(
//     sucuess => {
//         console.log('fun stats calced');
//     },
//     err => {
//         console.log('fun stats failed calc', err);
//     }
// );
// let factoryInstance = updateSystemSchema();
// factoryInstance.run();

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

//9-1-2021 Caster report testing..
// CasterReportWorker();

//8-18-2021 vod curator testing...

// testing().then(
//     s => {
//         console.log('done');
//     }
// )

/// 7-7-21 Clear User Sub Testing...
// UserSub.clearUsersTeam(['DHCæsarsalad#1517'], true);

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
