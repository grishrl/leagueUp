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
const System = require('../models/system-models').system;
const MatchMethods = require('../methods/matchCommon');

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

    //select replays that are not fully associated
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

    //make sure we have some replays selected
    if (parsedReplays.length > 0) {
        for (var i = 0; i < parsedReplays.length; i++) {
            //iterater
            var replay = parsedReplays[i];
            //make sure this is a good replay...
            if (replay.status == 1) {
                //give me a real object to work with
                var replayObj = replay.toObject();

                //create a arrays of player battle tags, another array that has their battle tags and toon handles
                let players = replayObj.players;
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
                });

                //gather the teams from the replay info:
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

                    let replayToSave = await Replay.findById(replay._id).then(
                        found => {
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

                        replayToSave.fullyAssociated = true;
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
/*
  ControlPoints: 'Sky Temple',
    TowersOfDoom: 'Towers of Doom',
    // HauntedMines: 'Haunted Mines',
    BattlefieldOfEternity: 'Battlefield of Eternity',
    // BlackheartsBay: "Blackheart's Bay",
    CursedHollow: 'Cursed Hollow',
    DragonShire: 'Dragon Shire',
    // HauntedWoods: 'Garden of Terror',
    Shrines: 'Infernal Shrines',
    Crypts: 'Tomb of the Spider Queen',
    Volskaya: 'Volskaya Foundry',
    // 'Warhead Junction': 'Warhead Junction',   // blizz why
    // BraxisHoldout: 'Braxis Holdout',
    // Hanamura: 'Hanamura',
    AlteracPass: 'Alterac Pass'
*/

async function leagueStatRunner() {

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
        found => {
            return found;
        }
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
    return true;
}

async function calcLeagueStats(replay) {

    let seasonSave;
    let overallSave;

    let objectiveInfo = {
        'globesGathered': 0,
        'minionsKilled': 0,
        'secondsPlayed': 0
    };

    console.log(replay.match.map);
    switch (replay.match.map) {
        case 'Braxis Holdout':
            objectiveInfo['zergWaves'] = braxCalc(replay);
            break;
        case 'Cursed Hollow':
            let cTemp = curseCalc(replay);
            objectiveInfo['tributesGathered'] = cTemp['tributesGathered'];
            objectiveInfo['curses'] = cTemp['curses'];
            break;
        case 'Volskaya Foundry':
            objectiveInfo['protectors-Summoned'] = volskCalc(replay);
            break;
        case 'Sky Temple':
            objectiveInfo['templeShots'] = skyCalc(replay);
            break;
        case 'Towers of Doom':
            objectiveInfo['altarsChanneled'] = towersCalc(replay);
            break;
        case 'Battlefield of Eternity':
            objectiveInfo['immortalsWon'] = boeCalc(replay);
            break;
        case 'Dragon Shire':
            objectiveInfo['dragonKnights-Summoned'] = dragonCalc(replay);
            break;
        case 'Garden of Terror':
            objectiveInfo['terrorsSummoned'] = gardenCalc(replay);
            break;
        case 'Infernal Shrines':
            let iTemp = shrinesCalc(replay);
            objectiveInfo['punishers-Summoned'] = iTemp['punishers-Summoned'];
            objectiveInfo['protectorsKilled'] = iTemp['protectorsKilled'];
            break;
        case 'Tomb of the Spider Queen':
            let tTemp = tombCalc(replay);
            objectiveInfo['spiderButtsTurnedIn'] = tTemp['spiderButtsTurnedIn'];
            objectiveInfo['spiders-Summoned'] = tTemp['spiders-Summoned'];
            break;
        case 'Hanamura Temple':
            objectiveInfo['payloadsPushed'] = hanCalc(replay);
            break;
        case 'Alterac Pass':
            objectiveInfo['calvaryCharges'] = alteracCalc(replay);
            break;
        case 'Warhead Junction':
            let wTemp = warheadCalc(replay);
            objectiveInfo['warheadsGathered'] = wTemp['warheadsGathered'];
            objectiveInfo['warheadsUsed'] = wTemp['warheadsUsed'];
            break;
        default:
            objectiveInfo['error'] = true;
            break;

    }

    objectiveInfo.secondsPlayed += Math.floor(replay.match.length);

    // let keys = Object.keys(replay.players);

    // keys.forEach(player => {
    //     let playerObj = replay.players[player];
    //     objectiveInfo.minionsKilled += playerObj.gameStats.MinionKills;
    //     objectiveInfo.globesGathered += playerObj.globes.count;
    // });

    _.forEach(replay.players, (value, key) => {
        objectiveInfo.minionsKilled += value.gameStats.MinionKills;
        objectiveInfo.globesGathered += value.globes.count;
    });

    let query = {
        $and: [{
                dataName: "leagueRunningFunStats"
            },
            {
                span: "overall"
            }
        ]
    }
    let overall = await System.findOne(query).then(
        rep => {
            return rep;
        }, err => {
            return null;
        }
    );

    if (overall) {
        _.forEach(objectiveInfo, (value, key) => {
            if (util.returnBoolByPath(overall.data, key)) {
                overall.data[key] += value;
            } else {
                overall.data[key] = value;
            }
        });
        // let keys = Object.keys(objectiveInfo);
        // keys.forEach(key => {
        //     if (util.returnBoolByPath(overall.data, key)) {
        //         overall.data[key] += objectiveInfo[key];
        //     } else {
        //         overall.data[key] = objectiveInfo[key];
        //     }
        // });
        overall.markModified('data');
        overallSave = await overall.save().then(
            rep => { return rep; },
            err => {
                return null;
            }
        )
    } else {
        let newObj = {
            span: "overall",
            dataName: "leagueRunningFunStats",
            data: {}
        }
        _.forEach(objectiveInfo, (value, key) => {
            newObj.data[key] = value;
        });
        // let keys = Object.keys(objectiveInfo);
        // keys.forEach(key => {
        //     newObj.data[key] = objectiveInfo[key];
        // });
        overallSave = await new System(newObj).save().then(
            res => {
                return res;
            },
            err => {
                return null;
            }
        )
    }
    query = {
        $and: [{
                dataName: "leagueRunningFunStats"
            },
            {
                span: process.env.season
            }
        ]
    };
    let season = await System.findOne(query).then(
        rep => {
            return rep;
        }, err => {
            return null;
        }
    );

    if (season) {
        _.forEach(objectiveInfo, (value, key) => {
            if (util.returnBoolByPath(season.data, key)) {
                season.data[key] += value;
            } else {
                season.data[key] = value;
            }
        });
        // let keys = Object.keys(objectiveInfo);
        // keys.forEach(key => {
        //     if (util.returnBoolByPath(season.data, key)) {
        //         season.data[key] += objectiveInfo[key];
        //     } else {
        //         season.data[key] = objectiveInfo[key];
        //     }
        // });
        season.markModified('data');
        seasonSave = await season.save().then(
            rep => {
                return rep;
            },
            err => {
                return null;
            }
        )
    } else {
        let newObj = {
            span: process.env.season,
            dataName: "leagueRunningFunStats",
            data: {}
        }
        _.forEach(objectiveInf, (value, key) => {
            newObj.data[key] = value;
        });
        // let keys = Object.keys(objectiveInfo);
        // keys.forEach(key => {
        //     newObj.data[key] = objectiveInfo[key];
        // });
        seasonSave = await new System(newObj).save().then(
            res => {
                return res;
            },
            err => {
                return null;
            }
        )
    }

    return [
        overallSave,
        seasonSave
    ];

}

function braxCalc(replay) {
    let obj = 0;
    if (replay) {
        obj = replay.match.objective.waves.length;
    }
    return obj;
}

function alteracCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += (replay.match.objective["0"].events.length / 3);
        obj += (replay.match.objective["1"].events.length / 3);
    }
    return obj;
}

function shrinesCalc(replay) {
    let obj = {
        'punishers-Summoned': 0,
        'protectorsKilled': 0
    };
    if (replay) {
        obj['punishers-Summoned'] = replay.match.objective.shrines.length;

        replay.match.objective.shrines.forEach(event => {
            obj['protectorsKilled'] += event["team0Score"];
            obj['protectorsKilled'] += event["team1Score"];
        })
    }
    return obj;
}

function gardenCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += replay.match.objective["0"].units.length / 3;
        obj += replay.match.objective["1"].units.length / 3;
    }
    return obj;
}

function dragonCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += replay.match.objective["0"].count;
        obj += replay.match.objective["1"].count;
    }
    return obj;
}

function hanCalc(replay) {
    let obj = 0;
    if (replay) {
        replay.match.objective.events.forEach(event => {
            if (event.hasOwnProperty('died')) {
                obj += 1;
            }
        })
    }
    return obj;
}

function skyCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += replay.match.objective["0"].count;
        obj += replay.match.objective["1"].count;
        // add this while i'm here in case we want dmg later
        // obj += replay.objective["0"].damage;
        // obj += replay.objective["1"].damage;
    }
    return obj;
}

function tombCalc(replay) {
    let obj = {
        'spiders-Summoned': 0,
        'spiderButtsTurnedIn': 0
    };

    if (replay) {
        obj['spiders-Summoned'] += replay.match.objective["0"].count;
        obj['spiders-Summoned'] += replay.match.objective["1"].count;

        // let keys = Object.keys(replay.players);
        // keys.forEach(key => {
        //     let player = replay.players[key];
        //     obj['spiderButtsTurnedIn'] += player.gameStats.GemsTurnedIn;
        // });
        _.forEach(replay.player, (value, key) => {
            obj['spiderButtsTurnedIn'] += value.gameStats.GemsTurnedIn;
        });

    }

    return obj;

}

function towersCalc(replay) {
    let obj = 0;
    obj += replay.match.objective["0"].count;
    obj += replay.match.objective["1"].count;
    return obj;
}

function warheadCalc(replay) {
    let info = {
        'warheadsGathered': 0,
        'warheadsUsed': 0
    };
    if (replay) {
        info.warheadsGathered += replay.match.objective["0"].count;
        info.warheadsGathered += replay.match.objective["1"].count;
        info.warheadsUsed += replay.match.objective["0"].success;
        info.warheadsUsed += replay.match.objective["1"].success;
    }
    return info;
}

function volskCalc(replay) {
    let obj = 0;
    obj += replay.match.objective["0"].events.length;
    obj += replay.match.objective["1"].events.length;
    return obj;
}

function curseCalc(replay) {
    let info = {
        'tributesGathered': 0,
        'curses': 0
    };

    if (replay) {
        info.tributesGathered += replay.match.objective["0"].events.length;
        info.tributesGathered += replay.match.objective["1"].events.length;

        info.curses += Math.floor(replay.match.objective["0"].events.length / 3);
        info.curses += Math.floor(replay.match.objective["1"].events.length / 3);
    }

    return info;

}

function boeCalc(replay) {
    let retinfo = 0;
    if (replay) {
        replay.match.objective.results.forEach(res => {
            if (res.hasOwnProperty('winner')) {
                retinfo += 1;
            }
        })
    }
    return retinfo;
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
    //connect to mongo db

    let teams = await Team.find({ parseStats: true }).then(
        found => { return found; },
        err => { return null; }
    );

    if (teams && teams.length > 0) {
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

    // console.log('matches.length ', matches.length);
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
        }).lean().then(
            reply => {
                return reply;
            },
            err => {
                console.log(err);
                return null;
            }
        );

        // console.log(matches);

        let savedArray = [];
        for (var i = 0; i < matches.length; i++) {
            let postedReplays = 0;
            let postObj = {};
            postObj['api_key'] = 'ngs!7583hh';
            let match = matches[i];
            // console.log('match ', match);

            let matchObj = match.toObject();

            // console.log('matchObj ', matchObj);

            let matchCopy = _.cloneDeep(matchObj);
            matchCopy = await MatchMethods.addTeamInfoToMatch(matchCopy).then(fufilled => { return fufilled }, err => { return null });

            if (matchCopy) {

                matchCopy = matchCopy[0];
                //check to make sure this match was not forfeit
                if (matchCopy.hasOwnProperty('forfeit') && matchCopy.forfeit) {

                    match['postedToHP'] = true;
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

                } else {

                    try {
                        postObj['division'] = getDivisionNameFromConcat(divisions, matchCopy.divisionConcat);

                        postObj['team_one_name'] = matchCopy.home.teamName;
                        postObj['team_one_image_url'] = process.env.heroProfileImage + matchCopy.home.logo;

                        postObj['team_one_player'] = matchCopy.other.homeTeamPlayer;

                        postObj['team_two_name'] = matchCopy.away.teamName;
                        postObj['team_two_player'] = matchCopy.other.awayTeamPlayer;
                        postObj['team_two_image_url'] = process.env.heroProfileImage + matchCopy.away.logo;

                        if (matchCopy.hasOwnProperty('mapBans')) {
                            postObj['team_one_map_ban'] = matchCopy.mapBans.homeOne;
                            postObj['team_one_map_ban_2'] = matchCopy.mapBans.homeTwo;
                            postObj['team_two_map_ban'] = matchCopy.mapBans.awayOne;
                            postObj['team_two_map_ban_2'] = matchCopy.mapBans.awayTwo;
                        }


                        if (matchCopy.hasOwnProperty('round')) {
                            postObj['round'] = matchCopy.round.toString();
                        } else {
                            postObj['round'] = 'T-1';
                        }

                        postObj['season'] = process.env.season.toString();

                    } catch (e) {
                        console.log(e);
                    }


                    let replayKeys = Object.keys(matchCopy.replays);

                    // console.log('replayKeys ', replayKeys);
                    for (var j = 0; j < replayKeys.length; j++) {
                        let localKey = j + 1;

                        postObj['game'] = (j + 1).toString();

                        let replayObj = matchCopy.replays[(j + 1).toString()];

                        if (!util.isNullorUndefined(replayObj)) {

                            postObj['replay_url'] = process.env.heroProfileReplay + replayObj.url;
                            let logObj = {};
                            logObj.actor = 'SYSTEM; CRON; Hots-Profile Submit';
                            logObj.target = 'Match Id: ' + matchObj.matchId
                            if (replayObj.data) {
                                logObj.target += ', ReplayID: ' + replayObj.data;
                            }
                            logObj.timeStamp = new Date().getTime();
                            logObj.logLevel = 'STD';

                            // console.log(postObj);
                            if (screenPostObject(postObj)) {

                                // if (false) {


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
                                    postedReplays += 1;
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

                    }

                    match['postedToHP'] = postedReplays > 0;
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
    postToHotsProfileHandler: postToHotsProfileHandler,
    calcLeagueStats: calcLeagueStats,
    leagueStatRunner: leagueStatRunner
}

function screenPostObject(postObj) {
    let retBool = true;
    _.forEach(postObj, (value, key) => {
        if (key != 'team_two_image_url' && key != 'team_two_image_url') {
            if (util.isNullorUndefined(value)) {
                retBool = false;
            } else {
                //do nothing
            }
        } else {
            //image can empty
        }
    });
    // let objKeys = Object.keys(postObj);
    // objKeys.forEach(key => {
    //     let value = postObj[key];
    //     if (key != 'team_two_image_url' && key != 'team_two_image_url') {
    //         if (util.isNullorUndefined(value)) {
    //             retBool = false;
    //         } else {
    //             //do nothing
    //         }
    //     } else {
    //         //image can empty
    //     }
    //     let val = postObj[key];
    // });
    return retBool;
}

function getDivisionNameFromConcat(divisionList, divConcat) {
    let returnDiv = '';
    divisionList.forEach(element => {
        if (element.divisionConcat == divConcat) {
            returnDiv = element.displayName;
        }
    });
    return returnDiv;
}

// async function returnTeamData(match){
//   let teamIds = [];
//   teamIds.push(match.home.id);
//   teamIds.push(match.away.id);
// }