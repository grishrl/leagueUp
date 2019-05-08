const Replay = require('../models/replay-parsed-models');
const User = require('../models/user-models');
const Division = require('../models/division-models');
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
const postToHotsProfileURL = process.env.heroProfileAPI;
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
        console.log(error);
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


    //grab users who have been marked for tabulation (this is a flag on the user model set after a replay is associated to a user)
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
            //running archive of the replays a player is associated to
            let replays = playerObj.replays;
            //grab replays from the database
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
                //parse each replay found
                let playerData = summarizePlayerData(replaysObj, toonHandle);
                playerData = playerData[toonHandle];
                player.parseStats = false;
                // find the stats data that corresponds to this user and season
                let dbStats = await Stats.findOne({
                    $and: [{
                            associateId: player._id.toString()
                        },
                        {
                            season: process.env.season
                        }
                    ]
                }).then(
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
                        associateId: player._id.toString(),
                        season: process.env.season
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
        limNum = 20;
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

    console.log('matches.length ', matches.length);
    if (matches) {

        let divisionList = [];
        matches.forEach(match => {
            if (divisionList.indexOf(match.divisionConcat) == -1) {
                divisionList.push(match.divisionConcat);
            }
        });

        let divisions = await Division.find({
            divisionConcat: {
                $in: divisionList
            }
        }).then(
            reply => {
                return reply;
            },
            err => {
                console.log(err);
                return null;
            }
        );

        let savedArray = [];
        for (var i = 0; i < matches.length; i++) {
            let postedReplays = true;
            let postObj = {};
            postObj['api_key'] = 'ngs!7583hh';
            let match = matches[i];
            let matchObj = match.toObject();

            let matchCopy = _.cloneDeep(match);

            postObj['team_one_name'] = matchCopy.home.teamName;
            postObj['team_one_image_url'] = process.env.heroProfileImage + matchCopy.home.logo;
            postObj['team_one_map_ban'] = matchCopy.mapBans.home;
            postObj['team_one_player'] = matchCopy.other.homeTeamPlayer;

            postObj['team_two_name'] = matchCopy.away.teamName;
            postObj['team_two_player'] = matchCopy.other.awayTeamPlayer;
            postObj['team_two_image_url'] = process.env.heroProfileImage + matchCopy.away.logo;
            postObj['team_two_map_ban'] = matchCopy.mapBans.away;

            postObj['round'] = matchCopy.round.toString();
            postObj['division'] = getDivisionNameFromConcat(divisions, matchCopy.divisionConcat);
            postObj['game'] = (j + 1).toString();
            postObj['season'] = process.env.season.toString();

            let replayKeys = Object.keys(matchCopy.replays);
            for (var j = 0; j < replayKeys.length; j++) {
                let replayObj = matchCopy.replays[(j + 1).toString()];
                postObj['replay_url'] = process.env.heroProfileReplay + replayObj.url;
                let logObj = {};
                logObj.actor = 'SYSTEM; CRON; Hots-Profile Submit';
                logObj.target = 'Match Id: ' + matchObj.matchId + ', ReplayID: ' + replayInf.data;
                logObj.timeStamp = new Date().getTime();
                logObj.logLevel = 'STD';

                if (screenPostObject(postObj)) {
                    //     // call to hotsprofile
                    let posted = await postToHotsProfile(postObj).then(
                        reply => {
                            return reply;
                        },
                        err => {
                            return null;
                        }
                    );
                    //     // console.log('POSTED!')
                    logObj.action = ' logging reply from hots-profile ' + JSON.stringify(posted.data);
                    logger(logObj);

                    if (posted) {
                        match['replays'][localKey]['parsedUrl'] = posted.data.url;
                        postedReplays = true;
                    } else {
                        //if posted fails then do not set the match to fully reported
                        // postedReplays = false;
                    }
                } else {
                    // console.log('NOT POSTED!')
                    logObj.logLevel = "ERROR";
                    logObj.error = "This replay failed the screen, NOT SENT TO HEROSPROFILE!!";
                    logger(logObj);
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
            if (savedArray.length == matches.length) {
                success = true;
            }

        }

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

function screenPostObject(postObj) {
    let retBool = true;
    let objKeys = Object.keys(postObj);
    objKeys.forEach(key => {
        let value = postObj[key];
        if (key != 'team_two_image_url' && key != 'team_two_image_url') {
            if (util.isNullorUndefined(value)) {
                retBool = false;
            } else {
                //do nothing
            }
        } else {
            //image can empty
        }
        let val = postObj[key];
    });
    return retBool;
}

function getDivisionNameFromConcat(divisionList, divConcat) {
    let returnDiv = '';
    divisionList.forEach(element => {
        if (element.divisionConcat == divConcat) {
            returnDiv = element.divisionDisplayName;
        }
    });
    return returnDiv;
}