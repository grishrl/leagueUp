const Replay = require('../models/replay-parsed-models');
const mongoose = require('mongoose');
const User = require('../models/user-models');
const Team = require('../models/team-models');
const Stats = require('../models/stats-model');
const logger = require('../subroutines/sys-logging-subs');
const summarizePlayerData = require('../summarizeData/summarize-player-data');
const summarizeTeamData = require('../summarizeData/summarize-team-data');

asscoatieUsers().then(
    processed => {
        console.log('completed ok');
    },
    err => {
        console.log('completed err');
    }
)

function getToonHandle(obj, name) {
    let handle = null;
    console.log('obj ', obj, ' name ', name);
    obj.forEach(key => {
        if (key.btag == name) {
            handle = key.toonHandle;
        }
    });
    return handle;
}

//this will filter through the replay files and associate any player and toon handle togeher
async function asscoatieUsers() {
    //TODO: implement
    //connect to mongo db
    mongoose.connect(process.env.mongoURI, () => {
        console.log('connected to mongodb');
    });

    let logObj = {};

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
        found => { return found; },
        err => { return null; }
    );

    if (parsedReplays.length > 0) {
        for (var i = 0; i < parsedReplays.length; i++) {
            var replay = parsedReplays[i];
            var replayObj = replay.toObject();
            let players = replay.players;
            let playerKey = Object.keys(replay.players);
            let playerTags = [];
            let playerTagsAndToonHandle = [];
            playerKey.forEach(key => {
                let player = players[key];
                let btag = player.name + '#' + player.tag
                let tO = {
                    'btag': btag,
                    'toonHandle': key
                };
                playerTags.push(btag);
                playerTagsAndToonHandle.push(tO);
            });
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
                    console.log('replay.systemId ', replayObj.systemId);
                    if (thisUser.replays.indexOf(replayObj.systemId) == -1) {
                        thisUser.replays.push(replayObj.systemId);
                        thisUser.parseStats = true;
                        associatedCount += 1;
                        thisUser.save().then(
                            saved => {
                                console.log('saved user!')
                            },
                            err => {
                                console.log('err!');
                            })
                    } else {
                        associatedCount += 1;
                    }

                }
            }

            let teams = await Team.find({
                _id: { $in: replayTeams }
            }).then(
                found => { return found; },
                err => { return null; }
            )

            if (teams && teams.length > 0) {
                for (var k = 0; k < teams.length; k++) {
                    let team = teams[k];
                    if (team.replays.indexOf(replayObj.systemId) == -1) {
                        team.replays.push(replayObj.systemId);
                        team.parseStats = true;
                        associatedCount += 1;
                        team.save().then(
                            saved => {
                                console.log('team saved!');
                            },
                            err => {
                                console.log('err');
                            }
                        )
                    } else {
                        associatedCount += 1;
                    }
                }
            }
            console.log('associatedCount ', associatedCount)
            if (associatedCount == 12) {
                let replayToSave = await Replay.findById(replay._id).then(
                    found => { return found; },
                    err => { return null; }
                )
                if (replayToSave) {
                    replayToSave.fullyAssociated = true;
                    replayToSave.markModified('fullyAssociated');
                    replayToSave.save().then(
                        saved => {
                            console.log('replay saved');
                        },
                        err => {
                            console.log('err');
                        }
                    )
                }

            }

        }
    } else {

    }
}

// tabulateUserStats().then(
//     processed => {
//         console.log('completed ok');
//     },
//     err => {
//         console.log('completed err');
//     }
// )

//this will run through players with toon handles and tabulate their stats from replays
async function tabulateUserStats() {

    //connect to mongo db
    mongoose.connect(process.env.mongoURI, () => {
        console.log('connected to mongodb');
    });

    //grab users who have been marked for tabulation
    let players = await User.find({ parseStats: true }).then(
        found => { return found; },
        err => {
            return null;
        }
    );

    let sysRet;

    if (players && players.length > 0) {

        for (var i = 0; i < players.length; i++) {

            let player = players[i];
            let playerObj = player.toObject();
            let toonHandle = playerObj.toonHandle;
            let replays = playerObj.replays;
            // console.log('replays ', replays)
            let fullReplays = await Replay.find({
                systemId: {
                    $in: replays
                }
            }).then(
                foundReplays => { return foundReplays },
                err => { return null }
            );
            let replaysObj = [];
            fullReplays.forEach(replay => {
                    let obj = replay.toObject()
                    replaysObj.push(obj);
                })
                // console.log(replaysObj.length);
            if (replaysObj && replaysObj.length > 0) {
                let playerData = summarizePlayerData(replaysObj, toonHandle);
                playerData = playerData[toonHandle];
                player.parseStats = false;

                let dbStats = await Stats.findOne({ associateId: player._id.toString() }).then(
                    found => { return found },
                    err => { return null }
                )

                let statResult

                if (dbStats) {
                    dbStats.stats = playerData;
                    statResult = await dbStats.save().then(
                        saved => { return saved },
                        err => { return null }
                    )
                } else {
                    let statObj = {
                        stats: playerData,
                        associateId: player._id.toString()
                    }
                    statResult = await new Stats(statObj).save().then(
                        saved => { return saved },
                        err => { return null }
                    )
                }

                if (statResult) {
                    console.log('stats saved');
                } else {
                    console.log('stats not saved');
                }

                let savePayer = await player.save().then(
                    saved => { return saved; },
                    err => { return null; }
                )

            }
        }

        sysRet = true;


    } else {
        //no players to be parsed;
        sysRet = true;

    }

    return sysRet;

}

// tabulateTeamStats().then(
//     processed => {
//         console.log('completed ok');
//     },
//     err => {
//         console.log('completed err');
//     }
// )

//this will run through teams and tabulate stats
async function tabulateTeamStats() {
    //TODO: implement
    //connect to mongo db
    mongoose.connect(process.env.mongoURI, () => {
        console.log('connected to mongodb');
    });

    let teams = await Team.find({ parseStats: true }).then(
        found => { return found; },
        err => { return null; }
    );

    if (teams && teams.length > 0) {
        // console.log('teams.length ', teams.length);
        for (var i = 0; i < teams.length; i++) {
            let thisTeam = teams[i]
            let replays = thisTeam.replays;
            let dbReplay = await Replay.find({
                systemId: {
                    $in: replays
                }
            }).then(
                foundReplays => {
                    return foundReplays
                },
                err => {
                    return null
                }
            );

            let replaysObj = [];
            dbReplay.forEach(replay => {
                    let obj = replay.toObject();
                    replaysObj.push(obj);
                })
                // console.log('replaysObj.length ', replaysObj.length)
            if (replaysObj && replaysObj.length > 0) {
                // console.log('thisTeam.teamName ', thisTeam.teamName);
                // console.log(summarizeTeamData(thisTeam.teamName, replaysObj))
                let teamData = summarizeTeamData(thisTeam._id.toString(), replaysObj);
                // console.log('teamData ', teamData);
                thisTeam.parseStats = false;

                let dbStats = await Stats.findOne({
                    associateId: thisTeam._id.toString()
                }).then(
                    found => {
                        return found
                    },
                    err => {
                        return null
                    }
                )

                let statResult

                if (dbStats) {
                    dbStats.stats = teamData;
                    statResult = await dbStats.save().then(
                        saved => {
                            return saved
                        },
                        err => {
                            return null
                        }
                    )
                } else {
                    let statObj = {
                        stats: teamData,
                        associateId: thisTeam._id.toString()
                    }
                    statResult = await new Stats(statObj).save().then(
                        saved => {
                            return saved
                        },
                        err => {
                            return null
                        }
                    )
                }

                if (statResult) {
                    console.log('stats saved');
                } else {
                    console.log('stats not saved');
                }

                let saveTeam = thisTeam.save().then(
                    saved => { return saved; },
                    err => { return null; }
                )

            }
        }


    }

    return true;

}

module.exports = {
    asscoatieUsers: asscoatieUsers
}