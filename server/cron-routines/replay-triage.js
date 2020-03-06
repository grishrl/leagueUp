const mongoose = require('mongoose')
const Replay = require('../models/replay-parsed-models');
const Team = require('../models/team-models');
const User = require('../models/user-models');
const Match = require('../models/match-model');
const statsMethods = require('./stats-routines');
const parser = require('hots-parser');
const _ = require('lodash');
const AWS = require('aws-sdk');
const uniqid = require('uniqid');
const ParsedReplay = require('../models/replay-parsed-models');
const matchCommon = require('../methods/matchCommon');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

const s3replayBucket = new AWS.S3({
    params: {
        Bucket: process.env.s3bucketReplays
    }
});

//connect to mongo db
mongoose.connect(process.env.mongoURI, {
    useNewUrlParser: true
}, () => {
    console.log('connected to mongodb');
});

async function reparseReplays() {
    //vihxvnjxo096hu

    let matches = await Match.find({
        $and: [{
            reported: true
        }, {
            season: 8
        }, {
            replays: {
                $exists: true
            }
        }]
    }).then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );
    if (matches) {
        for (var i = 0; i < matches.length; i++) {
            console.log('triaging ', i + 1, ' of ', matches.length, ' matches');
            let match = matches[i];
            let matchObj = match.toObject();
            let replays = matchObj.replays;
            let replayKeys = Object.keys(replays);
            for (var j = 0; j < replayKeys.length; j++) {
                let thisKey = replayKeys[j];
                let replayInfo = replays[thisKey];
                if (replayInfo.hasOwnProperty('data')) {
                    console.log('has data ', replayInfo);
                    let replayData = await Replay.findOne({ systemId: replayInfo.data }).then(
                        found => { return found; },
                        err => { return null; }
                    );

                    if (replayData) {
                        replayData = replayData.toObject();
                        if (replayData.hasOwnProperty('match')) {
                            // console.log('data looks good...');
                        } else {
                            console.log('data looks bad!');
                            let deleted = await Replay.findByIdAndRemove(replayData._id).then(del => { return del; }, err => { return err; });
                            await retrieveFromS3andParse(replayInfo, match, thisKey);
                        }
                    } else {
                        await retrieveFromS3andParse(replayInfo, match, thisKey);
                    }

                } else {
                    await retrieveFromS3andParse(replayInfo, match, thisKey);
                }
            }
        }
    }
}

reparseReplays().then(
    reply => {
        console.log('completed.');
    }
)

async function retrieveFromS3andParse(replayInfo, match, thisKey) {
    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    //or assign desired season for override
    let season = currentSeasonInfo.value;
    if (replayInfo.hasOwnProperty('url')) {
        let url = process.env.heroProfileReplay + replayInfo.url;
        let params = {
            Key: replayInfo.url
        };
        let s3Obj = await s3replayBucket.getObject(params).promise().then(res => { return res; }, err => { return null; });
        if (s3Obj) {
            var fs = require('fs');
            // var b = data.Body;
            // var readStream = fs.createReadStream({
            //     path: b
            // });
            let filename = __dirname + '/temp/test-' + Date.now().toString();
            fs.writeFileSync(filename, s3Obj.Body);
            let parsed;
            try {
                parsed = parser.processReplay(filename, {
                    useAttributeName: true,
                    overrideVerifiedBuild: true
                });
            } catch (e) {
                console.log(e);
            }
            console.log(parsed);

            if (parsed.status == 1) {
                let UUID = uniqid();
                parsed.season = parseInt(season);
                parsed.systemId = UUID;
                let teamIds = matchCommon.findTeamIds(match);
                let foundTeams = await Team.find({
                    _id: {
                        $in: teamIds
                    }
                }).lean().then(found => { return found; }, err => { return null; })
                teamInfo = [];
                foundTeams.forEach(team => {
                    let teamid = team._id.toString();
                    //info object
                    let teamInf = {};
                    //teamname
                    teamInf['teamName'] = team.teamName;
                    teamInf['id'] = teamid;
                    //add all the players of the team into a player array
                    teamInf['players'] = [];
                    team.teamMembers.forEach(member => {
                        let name = member.displayName.split('#');
                        name = name[0];
                        teamInf['players'].push(name);
                    });
                    teamInfo.push(teamInf);
                });
                let replayTeamA = parsed.match.teams["0"];
                let replayTeamB = parsed.match.teams["1"];
                //sort through the team members in the replay to assign the proper team names into the parsed replay object
                teamInfo.forEach(teamInfo => {
                    if (_.intersection(replayTeamA.names, teamInfo.players).length > _.intersection(replayTeamB.names, teamInfo.players).length) {
                        replayTeamA.teamName = teamInfo.teamName;
                        replayTeamA.teamId = teamInfo.id;
                    } else if (_.intersection(replayTeamA.names, teamInfo.players).length < _.intersection(replayTeamB.names, teamInfo.players).length) {
                        replayTeamB.teamName = teamInfo.teamName;
                        replayTeamB.teamId = teamInfo.id;
                    } else {
                        //some error state, both == 0.... 
                    }
                });

                parsed.match['ngsMatchId'] = match.matchId;
                parsed.match.filename = replayInfo.url;
                let parsedReplayInserted = await ParsedReplay.collection.insertOne(parsed).then(success => {
                    return success;
                }, err => {
                    return null;
                });
                if (parsedReplayInserted) {
                    match.replays[thisKey].data = UUID;
                    match.markModified('replays');
                    let saved = await match.save().then(saved => {
                        return saved;
                    }, err => {
                        return null;
                    });
                    if (saved) {
                        fs.unlink(filename, (err) => {
                            console.log(err);
                        });
                    }
                }
            }
        }
    }
}

async function testLeagueStats() {
    let replays = await Replay.find({
        $or: [{
            leagueStats: false
        }, {
            leagueStats: null
        }, {
            leagueStats: {
                $exists: false
            }
        }]
    }).then(
        found => { return found; }
    )
    if (replays.length > 0) {
        for (var i = 0; i < replays.length; i++) {
            console.log('calculating fun stats ', i + 1, ' of ', replays.length);
            let replay = replays[i];
            let finishUpdate = await statsMethods.calcLeagueStats(replay);
            if (finishUpdate) {
                replay.leagueStats = true;
                replay.save().then(
                    saved => {
                        console.log('done with ', i + 1, ' of ', replays.length);
                    }
                )
            }

        }
    }
}

async function validateTeamReplays() {
    let teams = await Team.find().then(found => { return found }, err => { return err; });
    if (teams && teams.length > 0) {
        for (var i = 0; i < teams.length; i++) {
            console.log('triaging team ', i + 1, ' of ', teams.length);
            let teamIter = teams[i];
            let teamObj = teamIter.toObject();
            if (teamObj.hasOwnProperty('replays') && teamObj.replays.length > 0) {
                let replays = teamObj.replays;
                let removeIndex = [];
                for (var j = 0; j < replays.length; j++) {
                    let foundReplay = await ParsedReplay.findOne({ systemId: replays[j] }).then(found => { return found; }, err => { return null; });
                    if (!foundReplay || foundReplay.status != 1) {
                        removeIndex.push(j);
                    }
                }
                let removed = false;
                removeIndex.forEach(ind => {
                    removed = true;
                    replays.splice(ind, 1);
                });
                if (removed) {
                    console.log('cleaned up some dead links..');
                }
                teamIter.replays = replays;
                teamIter.save();
            }
        }
    }
}

// validateTeamReplays().then(
//   res=>{
//     console.log('completed..');
//   }
// )

async function validatePlayerReplays() {
    let users = await User.find().then(found => { return found }, err => { return err; });
    if (users && users.length > 0) {
        for (var i = 0; i < users.length; i++) {
            console.log('triaging user ', i + 1, ' of ', users.length);
            let userIter = users[i];
            let userObj = userIter.toObject();
            if (userObj.hasOwnProperty('replays') && userObj.replays.length > 0) {
                let replays = userObj.replays;
                let removeIndex = [];
                for (var j = 0; j < replays.length; j++) {
                    let foundReplay = await ParsedReplay.findOne({ systemId: replays[j] }).then(found => { return found; }, err => { return null; });
                    if (!foundReplay || foundReplay.status != 1) {
                        removeIndex.push(j);
                    }
                }
                let removed = false;
                removeIndex.forEach(ind => {
                    removed = true;
                    replays.splice(ind, 1);
                });
                if (removed) {
                    console.log('cleaned up some dead links..');
                }
                userIter.replays = replays;
                userIter.save();
            }
        }
    }
}

// validatePlayerReplays().then(
//   res=>{
//     console.log('completed..');
//   }
// )

// testLeagueStats().then(
//     reply => {
//         console.log(reply);
//     },
//     err => {
//         console.log(err);
//     }
// );

// asscoatieReplays().then(
//     reply => {
//         console.log(reply);
//     },
//     err => {
//         console.log(err);
//     }
// );


//triages mismatched team names inside replays
async function associationTriage() {

    /*
    
        */

    let replays = await Replay.find({
        $or: [{
            fullyAssociated: false
        }, {
            fullyAssociated: null
        }, {
            fullyAssociated: {
                $exists: false
            }
        }]
    }).then(found => {
        return found;
    }, err => {
        return null;
    })

    if (replays.length > 0) {

        for (var i = 0; i < replays.length; i++) {

            console.log('triaging replay ', i + 1, ' of ', replays.length);

            let replay = replays[i];
            let matchId = replay.match.ngsMatchId;

            let matchInfo = await Match.findOne({
                matchId: matchId
            }).then(
                found => {
                    return found;
                },
                err => {
                    return null;
                }
            );

            let team1obj = replay.match.teams["0"];
            let team2obj = replay.match.teams["1"];

            team1obj = buildTeamObj(team1obj, replay, "0");
            team2obj = buildTeamObj(team2obj, replay, "1");

            if (matchInfo) {

                let homeTeamId = matchInfo.home.id;
                let awayTeamId = matchInfo.away.id;

                let homeTeam = await Team.findById(homeTeamId).lean().then(
                    found => {
                        return found;
                    }
                );
                let awayTeam = await Team.findById(awayTeamId).lean().then(
                    found => {
                        return found
                    }
                )

                // console.log('homeTeam ', homeTeam);
                // console.log('awayTeam ', awayTeam);
                assignHomeOrAway(homeTeam, awayTeam, team1obj);
                assignHomeOrAway(homeTeam, awayTeam, team2obj);


                replay.match.teams[team1obj.parseIndex].teamName = team1obj.teamName;
                replay.match.teams[team1obj.parseIndex].teamId = team1obj.id;
                delete replay.match.teams[team1obj.parseIndex].id
                replay.match.teams[team2obj.parseIndex].teamName = team2obj.teamName;
                replay.match.teams[team2obj.parseIndex].teamId = team2obj.id;
                delete replay.match.teams[team2obj.parseIndex].id

                // let playerKeys = Object.keys(replay.players);

                team1obj.members.forEach(member => {
                    _.forEach(replay.players, (value, key) => {
                        if (member.toonHandle == key) {
                            value.with.teamName = team1obj.teamName;
                            value.with.teamId = team1obj.id;
                            value.against.teamName = team2obj.teamName;
                            value.against.teamId = team2obj.id;
                        }
                    });
                    // playerKeys.forEach(key => {
                    //     let playerInf = replay.players[key];
                    //     if (member.toonHandle == key) {
                    //         playerInf.with.teamName = team1obj.teamName;
                    //         playerInf.with.teamId = team1obj.id;
                    //         playerInf.against.teamName = team2obj.teamName;
                    //         playerInf.against.teamId = team2obj.id;
                    //     }
                    // });
                });


                team2obj.members.forEach(member => {
                    _.forEach(replay.players, (value, key) => {
                        if (member.toonHandle == key) {
                            value.with.teamName = team2obj.teamName;
                            value.with.teamId = team2obj.id;
                            value.against.teamName = team1obj.teamName;
                            value.against.teamId = team1obj.id;
                        }
                    });
                    // playerKeys.forEach(key => {
                    //     let playerInf = replay.players[key];
                    //     if (member.toonHandle == key) {
                    //         playerInf.with.teamName = team2obj.teamName;
                    //         playerInf.with.teamId = team2obj.id;
                    //         playerInf.against.teamName = team1obj.teamName;
                    //         playerInf.against.teamId = team1obj.id;
                    //     }
                    // });
                });
                replay.markModified('match');
                replay.markModified('players');
                let saved = await replay.save().then(
                    saved => {
                        console.log('finished triaging ', i + 1, ' of ', replays.length);
                        return saved;
                    },
                    err => {
                        console.log(err)
                    }
                );

            }
        }

    }

}

function assignHomeOrAway(homeTeam, awayTeam, teamObj) {
    let homeMatchCount = returnMatches(homeTeam, teamObj);
    let awayMatchCount = returnMatches(awayTeam, teamObj);
    if (homeMatchCount > awayMatchCount) {
        //assoicate with home team
        teamObj.id = homeTeam._id.toString();
        teamObj.teamName = homeTeam.teamName;
    } else {
        teamObj.id = awayTeam._id.toString();
        teamObj.teamName = awayTeam.teamName;
        //associate with away team
    }
}

function returnMatches(teamDB, teamObj) {
    let count = 0;
    let members = teamDB.teamMembers;
    let possibleMembers = teamObj.members;
    members.forEach(member => {
        possibleMembers.forEach(possMember => {
            if (member.displayName == possMember.battleTag) {
                count += 1;
            }
        })
    });
    return count;
}

function buildTeamObj(team, replay, index) {
    let ret = {
        'parseIndex': index,
        'teamName': '',
        'id': '',
        'members': []
    }
    team.ids.forEach(id => {
        let playerInf = returnPlayerByToon(replay, id);
        let playerObj = {
            'name': playerInf.name,
            'toonHandle': playerInf.ToonHandle,
            'battleTag': playerInf.name + '#' + playerInf.tag
        }
        ret.members.push(playerObj);
    });
    return ret;
}

function returnPlayerByToon(replay, toon) {
    let retObj = {};
    let players = replay.players;
    _.forEach(player, (value, key) => {
        if (key == toon) {
            retObj = value;
        }
    });
    // let keys = Object.keys(players);
    // keys.forEach(key => {
    //     if (key == toon) {
    //         retObj = players[key];
    //     }
    // })
    return retObj;
}


/*
{
  name:'',
  toonHandle:'',
  battleTag:''
}
*/

/*
{
  displayName:'',
  id:'',
  members:[player]
}
*/

//this will filter through the replay files and associate any player and toon handle togeher
async function asscoatieReplays() {

    let logObj = {};
    //5c7780249980ef0017086ccd

    /*
        let parsedReplays = await Replay.find({
          $or: [{
            fullyAssociated: false
          }, {
            fullyAssociated: null
          }, {
            fullyAssociated: {
              $exists: false
            }
          }]
        })
    */

    logObj.actor = 'SYSTEM; CRON';
    logObj.action = ' associate replay to teams and users ';
    logObj.timeStamp = new Date().getTime();
    logObj.logLevel = 'STD';

    let parsedReplays = await Replay.find({
        $or: [{
            fullyAssociated: false
        }, {
            fullyAssociated: null
        }, {
            fullyAssociated: {
                $exists: false
            }
        }]
    }).then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );

    console.log(parsedReplays.length, ' replays to associate')
    if (parsedReplays.length > 0) {
        for (var i = 0; i < parsedReplays.length; i++) {
            console.log(' associating replay ', i + 1, ' of ', parsedReplays.length);
            var replay = parsedReplays[i];
            // console.log(replay);
            var replayObj = replay.toObject();
            let players = replay.players;
            let playerTags = [];
            let playerTagsAndToonHandle = [];
            _.forEach(players, (value, key) => {
                    let btag = value.name + '#' + value.tag
                    let tO = {
                        'btag': btag,
                        'toonHandle': key
                    };
                    playerTags.push(btag);
                    playerTagsAndToonHandle.push(tO);
                })
                // let playerKey = Object.keys(replay.players);
                // playerKey.forEach(key => {
                //     let player = players[key];
                //     let btag = player.name + '#' + player.tag
                //     let tO = {
                //         'btag': btag,
                //         'toonHandle': key
                //     };
                //     playerTags.push(btag);
                //     playerTagsAndToonHandle.push(tO);
                // });
            let replayTeams = [];

            replayTeams.push(replay.match.teams[0].teamId);
            replayTeams.push(replay.match.teams[1].teamId);

            let users = await User.find({
                displayName: {
                    $in: playerTags
                }
            }).then(
                players => {
                    return players;
                },
                err => {
                    return null;
                }
            );

            let associatedCount = 0;
            if (users && users.length > 0) {
                for (var j = 0; j < users.length; j++) {
                    let thisUser = users[j];
                    if (!thisUser.toonHandle) {
                        thisUser.toonHandle = getToonHandle(playerTagsAndToonHandle, thisUser.displayName);
                    }
                    // console.log('replay.systemId ', replayObj.systemId);
                    if (thisUser.replays) {
                        if (thisUser.replays.indexOf(replayObj.systemId) == -1) {
                            thisUser.replays.push(replayObj.systemId);
                            thisUser.parseStats = true;
                            associatedCount += 1;
                        } else {
                            associatedCount += 1;
                        }
                    } else {
                        thisUser.replays = [replayObj.systemId];
                        associatedCount += 1;
                    }
                    thisUser.save().then(
                        saved => {
                            // console.log('saved user!')
                        },
                        err => {
                            // console.log('err!');
                        })
                    console.log('associatedCount user: ', thisUser.displayName, associatedCount)
                }
            }

            let teams = await Team.find({
                _id: {
                    $in: replayTeams
                }
            }).then(
                found => {
                    return found;
                },
                err => {
                    return null;
                }
            )

            if (teams && teams.length > 0) {
                for (var k = 0; k < teams.length; k++) {
                    let team = teams[k];
                    if (team.replays) {
                        if (team.replays.indexOf(replayObj.systemId) == -1) {
                            team.replays.push(replayObj.systemId);
                            team.parseStats = true;
                            associatedCount += 1;
                        } else {
                            associatedCount += 1;
                        }
                    } else {
                        team.replays = [replayObj.systemId];
                        associatedCount += 1;
                    }
                    team.save().then(
                        saved => {
                            // console.log('team saved!');
                        },
                        err => {
                            // console.log('err');
                        }
                    )
                    console.log('associatedCount team: ', team.teamName, associatedCount)
                }

            }
            console.log('associatedCount ', associatedCount)
            if (associatedCount == users.length + 2) {
                let replayToSave = await Replay.findById(replay._id).then(
                    found => {
                        console.log('finished associating replay ', i + 1, ' of ', parsedReplays.length);
                        return found;
                    },
                    err => {
                        return null;
                    }
                )

                if (replayToSave) {

                    if (users.length + 2 == 12) {
                        replayToSave.fullyAssociated = true;
                        replayToSave.futureAssociated = false;
                    } else {
                        replayToSave.fullyAssociated = true;
                        replayToSave.futureAssociated = true;
                    }

                    replayToSave.markModified('fullyAssociated');
                    replayToSave.markModified('futureAssociated');
                    replayToSave.save().then(
                        saved => {
                            // console.log('replay saved');
                        },
                        err => {
                            // console.log('err');
                        }
                    )
                }

            }

        }
    } else {

    }
}