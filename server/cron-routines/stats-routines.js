/**
 * These methods are wrapped by crons from teporize; they mainly handle the business of associating replays to teams and users and also tabulating the league 
 * "fun stats" which are things like minions killed globes gathered etc..
 * reviewd: 10-1-2020
 * reviewr: wraith
 */
const Replay = require('../models/replay-parsed-models');
const User = require('../models/user-models');
const Team = require('../models/team-models');
const Stats = require('../models/stats-model');
const logger = require('../subroutines/sys-logging-subs').logger;
const summarizePlayerData = require('../summarizeData/summarize-player-data');
const summarizeTeamData = require('../summarizeData/summarize-team-data');
const _ = require('lodash');
const util = require('../utils');
const System = require('../models/system-models').system;
const SeasonInfoCommon = require('../methods/seasonInfoMethods');

const location = 'stats-routines';

/**
 * @name getToonHandle
 * @function
 * @description gets player toon handle from user object
 * @param {User} obj 
 * @param {string} name 
 */
function getToonHandle(obj, name) {
    let handle = null;
    obj.forEach(key => {
        if (key.btag == name) {
            handle = key.toonHandle;
        }
    });
    return handle;
}


/**
 * @name asscoatieReplays
 * @function
 * @description this will filter through the replay files and associate them to the players and teams that were involved
 */
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

                        if (thisUser.replays.indexOf(replayObj.systemId) == -1) {
                            thisUser.replays.push(replayObj.systemId);
                            thisUser.parseStats = true;
                            associatedCount += 1;
                            thisUser.save().then(
                                saved => {
                                    //empty promise return
                                },
                                err => {
                                    //empty promise return
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
                                    // empty promises
                                },
                                err => {
                                    // empty promises
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
                            // empty promises
                        },
                        err => {
                            // empty promises
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
    HauntedMines: 'Haunted Mines',
    BattlefieldOfEternity: 'Battlefield of Eternity',
    BlackheartsBay: "Blackheart's Bay",
    CursedHollow: 'Cursed Hollow',
    DragonShire: 'Dragon Shire',
    HauntedWoods: 'Garden of Terror',
    Shrines: 'Infernal Shrines',
    Crypts: 'Tomb of the Spider Queen',
    Volskaya: 'Volskaya Foundry',
    'Warhead Junction': 'Warhead Junction',   // blizz why
    BraxisHoldout: 'Braxis Holdout',
    Hanamura: 'Hanamura',
    AlteracPass: 'Alterac Pass'
*/

/**
 * @name leagueStatRunner
 * @function
 * @description runs through replays and tabulates 'fun' stats for NGS 
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
            util.errLogger(location, null, 'calculating fun stats ' + (i + 1) + ' of ' + replays.length);
            let replay = replays[i];
            try {
                let finishUpdate = await calcLeagueStats(replay);
                if (finishUpdate) {
                    replay.leagueStats = true;
                    replay.save().then(
                        saved => {
                            util.errLogger(location, null, 'done with ' + (i + 1) + ' of ' + replays.length)
                        }
                    )
                }
            } catch (error) {
                util.errLogger(location, error);
                let logObj = {};
                logObj.actor = 'SYSTEM; CRON; leagueStatRunner';
                logObj.target = replays[i].systemId;
                logObj.timeStamp = new Date().getTime();
                logObj.logLevel = 'ERROR';
                logObj.error = error;
                logger(logObj);
            }


        }
    }
    return true;
}

/**
 * @name calcLeagueStats
 * @function
 * @description helper method that accepts a replay JSON and calculates the 'fun' stats off that replay
 * @param {Object} replay 
 */
async function calcLeagueStats(replay) {

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

    let seasonSave;
    let overallSave;

    let objectiveInfo = {
        'globesGathered': 0,
        'minionsKilled': 0,
        'secondsPlayed': 0
    };

    if (!replay.match) {
        return 'null';
    }

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
                span: seasonNum
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
            span: seasonNum,
            dataName: "leagueRunningFunStats",
            data: {}
        }
        _.forEach(objectiveInfo, (value, key) => {
            newObj.data[key] = value;
        });

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

/**
 * @name braxCalc
 * @function
 * @description helper function to determine objective winner on braxis holdout
 * @param {Object} replay 
 */
function braxCalc(replay) {
    let obj = 0;
    if (replay) {
        obj = replay.match.objective.waves.length;
    }
    return obj;
}
/**
 * @name alteracCalc
 * @function
 * @description helper function to determine objective winner on alterac pass
 * @param {Object} replay 
 */
function alteracCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += (replay.match.objective["0"].events.length / 3);
        obj += (replay.match.objective["1"].events.length / 3);
    }
    return obj;
}
/**
 * @name shrinesCalc
 * @function
 * @description helper function to determine objective winner on infernal shrines
 * @param {Object} replay 
 */
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
/**
 * @name gardenCalc
 * @function
 * @description helper function to determine objective winner on garden of terror
 * @param {Object} replay 
 */
function gardenCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += replay.match.objective["0"].units.length / 3;
        obj += replay.match.objective["1"].units.length / 3;
    }
    return obj;
}
/**
 * @name dragonCalc
 * @function
 * @description helper function to determine objective winner on dragon shire
 * @param {Object} replay 
 */
function dragonCalc(replay) {
    let obj = 0;
    if (replay) {
        obj += replay.match.objective["0"].count;
        obj += replay.match.objective["1"].count;
    }
    return obj;
}
/**
 * @name hanCalc
 * @function
 * @description helper function to determine objective winner on hanamura temple
 * @param {Object} replay 
 */
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
/**
 * @name skyCalc
 * @function
 * @description helper function to determine objective winner on sky temple
 * @param {Object} replay 
 */
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
/**
 * @name tombCalc
 * @function
 * @description helper function to determine objective winner on tomb of the spider queen
 * @param {Object} replay 
 */
function tombCalc(replay) {
    let obj = {
        'spiders-Summoned': 0,
        'spiderButtsTurnedIn': 0
    };

    if (replay) {
        obj['spiders-Summoned'] += replay.match.objective["0"].count;
        obj['spiders-Summoned'] += replay.match.objective["1"].count;

        _.forEach(replay.players, (value, key) => {
            obj['spiderButtsTurnedIn'] += value.gameStats.GemsTurnedIn;
        });

    }

    return obj;

}
/**
 * @name towersCalc
 * @function
 * @description helper function to determine objective winner on towers of doom
 * @param {Object} replay 
 */
function towersCalc(replay) {
    let obj = 0;
    obj += replay.match.objective["0"].count;
    obj += replay.match.objective["1"].count;
    return obj;
}
/**
 * @name warheadCalc
 * @function
 * @description helper function to determine objective winner on warhead junction
 * @param {Object} replay 
 */
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
/**
 * @name volskCalc
 * @function
 * @description helper function to determine objective winner on volskaya foundry
 * @param {Object} replay 
 */
function volskCalc(replay) {
    let obj = 0;
    obj += replay.match.objective["0"].events.length;
    obj += replay.match.objective["1"].events.length;
    return obj;
}
/**
 * @name curseCalc
 * @function
 * @description helper function to determine objective winner on cursed hollow
 * @param {Object} replay 
 */
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
/**
 * @name boeCalc
 * @function
 * @description helper function to determine objective winner on battlefield of eternity
 * @param {Object} replay 
 */
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


/**
 * @name tabulateUserStats
 * @function
 * @description this will run through players with toon handles and tabulate their stats from replays
 */
async function tabulateUserStats() {

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

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
                //util.errLogger(location, null, replaysObj.length)
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
                            season: seasonNum
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
                        season: seasonNum
                    }
                    statResult = await new Stats(statObj).save().then(
                        saved => { return saved },
                        err => { return null }
                    )
                }

                if (statResult) {
                    util.errLogger(location, null, 'stats saved');
                } else {
                    util.errLogger(location, null, 'stats not saved');
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



/**
 * @name tabulateTeamStats
 * @function
 * @description this will run through teams and tabulate stats
 */
async function tabulateTeamStats() {

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
            if (replaysObj && replaysObj.length > 0) {

                let teamData = summarizeTeamData(thisTeam._id.toString(), replaysObj);

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

                } else {

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
    asscoatieReplays: asscoatieReplays,
    tabulateUserStats: tabulateUserStats,
    tabulateTeamStats: tabulateTeamStats,
    calcLeagueStats: calcLeagueStats,
    leagueStatRunner: leagueStatRunner
}