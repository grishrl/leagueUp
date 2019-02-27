const Replay = require('../models/replay-parsed-models');
const User = require('../models/user-models');
const Team = require('../models/team-models');
const Stats = require('../models/stats-model');
const Match = require('../models/match-model');
const logger = require('../subroutines/sys-logging-subs');
const summarizePlayerData = require('../summarizeData/summarize-player-data');
const summarizeTeamData = require('../summarizeData/summarize-team-data');
const axios = require('axios');
const _ = require('lodash');
const querystring = require('querystring');
const util = require('../utils');

//TODO: move string into env. variable
const postToHotsProfileURL = 'https://www.heroesprofile.com/API/Games/NGS/';
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
}
async function postToHotsProfile(postObj) {
    let returnUrl = 'null';
    try {
        returnUrl = await axios.get(postToHotsProfileURL + '?' + querystring.stringify(postObj), config);
    } catch (error) {
        // console.log(error);

    }

    return returnUrl;
}

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
async function asscoatieReplays() {

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
                    // console.log('replay.systemId ', replayObj.systemId);
                    if (thisUser.replays.indexOf(replayObj.systemId) == -1) {
                        thisUser.replays.push(replayObj.systemId);
                        thisUser.parseStats = true;
                        associatedCount += 1;
                        thisUser.save().then(
                            saved => {
                                // console.log('saved user!')
                            },
                            err => {
                                // console.log('err!');
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
                                // console.log('team saved!');
                            },
                            err => {
                                // console.log('err');
                            }
                        )
                    } else {
                        associatedCount += 1;
                    }
                }
            }
            // console.log('associatedCount ', associatedCount)
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

//this will run through players with toon handles and tabulate their stats from replays
async function tabulateUserStats() {


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


//this will run through teams and tabulate stats
async function tabulateTeamStats() {
    //TODO: implement
    //connect to mongo db

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
                    // console.log('stats saved');
                } else {
                    // console.log('stats not saved');
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

async function postToHotsProfileHandler(limNum) {

    let success = false;

    if (!limNum) {
        limNum = 10;
    } else {
        limNum = parseInt(limNum);
    }
    // console.log('limit ', limNum);
    let matches = await Match.find({
        $and: [{
                $or: [{
                        "postedToHP": null
                    },
                    {
                        "postedToHP": {
                            $exists: false
                        }
                    },
                    {
                        "postedToHP": false
                    }
                ]
            },
            {
                "reported": true
            }
        ]
    }).limit(limNum).then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );

    if (matches) {
        let savedArray = [];
        for (var i = 0; i < matches.length; i++) {
            let postedReplays = true;
            // console.log('i ', i);
            let postObj = {};
            postObj['api_key'] = 'ngs!7583hh';
            let match = matches[i];
            let matchObj = match.toObject();

            // console.log(match);
            let teamIds = [];

            if (util.returnByPath(matchObj, 'away.id')) {
                teamIds.push(util.returnByPath(matchObj, 'away.id'));
            }

            if (util.returnByPath(matchObj, 'home.id')) {
                teamIds.push(util.returnByPath(matchObj, 'home.id'));
            }

            let teams = await Team.find({ _id: { $in: teamIds } }).then(
                found => { return found; },
                err => {
                    return null;
                }
            )

            let replays = matchObj.replays;
            // console.log('replays ', replays);
            let keys = Object.keys(replays);
            // console.log('keys ', keys);
            let matchCopy = _.cloneDeep(match);

            for (var j = 0; j < keys.length; j++) {
                // console.log('J ', j, ' J+1 ', j + 1);
                let localKey = keys[j];
                // console.log('localKey ', localKey);
                if (localKey != '_id') {

                    let replayInf = matchObj.replays[localKey];
                    let parsed = await Replay.findOne({
                        systemId: replayInf.data
                    }).then(
                        found => {
                            return found;
                        },
                        err => {
                            return null;
                        }
                    );

                    if (parsed) {
                        replayInf['parsed'] = parsed;
                    } else {

                        //error
                    }

                    postObj['replay_url'] = 'https://s3.amazonaws.com/dev-ngs-replay-storage/' + replayInf.url;
                    postObj['team_one_name'] = replayInf.parsed.match.teams["0"].teamName;
                    let playerNameKey = replayInf.parsed.match.teams["0"].ids[0];
                    let battleTag = replayInf.parsed.players[playerNameKey].name + "#" + replayInf.parsed.players[playerNameKey].tag
                    postObj['team_one_player'] = battleTag;
                    postObj['team_one_map_ban'] = matchCopy.mapBans.home;
                    postObj['team_two_name'] = replayInf.parsed.match.teams["1"].teamName;
                    playerNameKey = replayInf.parsed.match.teams["1"].ids[0];
                    battleTag = replayInf.parsed.players[playerNameKey].name + "#" + replayInf.parsed.players[playerNameKey].tag
                    postObj['team_two_player'] = battleTag;
                    postObj['team_two_map_ban'] = matchCopy.mapBans.away;
                    postObj['round'] = matchCopy.round.toString();
                    postObj['division'] = teams[0].divisionDisplayName;
                    postObj['game'] = (j + 1).toString();
                    postObj['season'] = "6";

                    if (teams) {

                        teams.forEach(team => {
                            let teamObj = team.toObject()
                            if (teamObj.teamName == postObj['team_one_name']) {
                                if (!util.isNullOrEmpty(teamObj.logo)) {
                                    postObj['team_one_image_url'] = 'https://s3.amazonaws.com/dev-ngs-image-storage/' + teamObj.logo;
                                }
                            }
                            if (teamObj.teamName == postObj['team_two_name']) {
                                if (!util.isNullOrEmpty(teamObj.logo)) {
                                    postObj['team_two_image_url'] = 'https://s3.amazonaws.com/dev-ngs-image-storage/' + teamObj.logo;
                                }

                            }
                        })
                    }

                    // console.log('post Obj ', postObj);

                    // let posted = { data: { url: " yo mamma " } };
                    // console.log('postObj ', postObj);
                    // call to hotsprofile
                    let posted = await postToHotsProfile(postObj).then(
                        reply => {
                            return reply;
                        },
                        err => {
                            return null;
                        }
                    );

                    // console.log('posted ', posted);

                    if (posted) {
                        // postedReplays += 1;
                        match['replays'][localKey]['parsedUrl'] = posted.data.url;
                    } else {
                        //if posted fails then do not set the match to fully reported
                        postedReplays = false;
                    }

                } else {
                    //do nothing
                }

            }

            match['postedToHP'] = postedReplays;
            // console.log('match ', match);
            let saved = await match.save().then(
                saved => {
                    return saved;
                },
                err => {
                    console.log(err);
                    return null;
                }
            )
            savedArray.push(saved);

        }

        // console.log('SAVED ARRAY ', savedArray);

    } else {
        //no matches found
    }

    return success;

}

module.exports = {
    asscoatieReplays: asscoatieReplays,
    tabulateUserStats: tabulateUserStats,
    tabulateTeamStats: tabulateTeamStats,
    postToHotsProfileHandler: postToHotsProfileHandler
}