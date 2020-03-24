const Division = require('../models/division-models');
const Match = require('../models/match-model');
const MatchMethods = require('../methods/matchCommon');
const hpAPI = require('../methods/heroesProfileAPI');
const _ = require('lodash');
const util = require('../utils');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const logger = require('../subroutines/sys-logging-subs');


const location = 'uploadToHeroesProfileHandler'

async function postToHotsProfileHandler(limNum) {

    // let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    // let seasonNum = currentSeasonInfo.value;

    //TODO:
    /*
     return "Replay did not save, unknown issue"

     If a player was provided that did not exist in the game I provide "Invalid parameter. A player provided was not in the game"

     If a game mode is not custom i provide "Game mode is not custom.  Invalid replay sent"
    */

    let success = false;

    if (!limNum) {
        limNum = 20;
    } else {
        limNum = parseInt(limNum);
    }

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

    // util.errLogger(location, null, 'matches.length ' + matches.length);
    try {
        let pq = promiseQueue();
        if (matches.length > 0) {
            let fallThroughCheck = true; //this will make sure this replay does not get stuck if someonthing was reported wrong
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
                    util.errLogger(location, err);
                    return null;
                }
            );

            util.errLogger(location, null, matches.length)

            let savedArray = [];
            for (var i = 0; i < matches.length; i++) {
                let logObj = {};
                logObj.actor = 'SYSTEM; CRON; Hots-Profile Submit';
                let postedReplays = 0;
                let postObj = {};
                // postObj['api_key'] = 'ngs!7583hh';
                let match = matches[i];
                // util.errLogger(location, null, 'match '+ match)

                let matchObj = match.toObject();

                // util.errLogger(location, null,'matchObj '+ matchObj )

                let matchCopy = _.cloneDeep(matchObj);
                matchCopy = await MatchMethods.addTeamInfoToMatch(matchCopy).then(fufilled => {
                    return fufilled
                }, err => {
                    return null
                });

                if (matchCopy) {

                    matchCopy = matchCopy[0];
                    //check to make sure this match was not forfeit
                    if (matchCopy.hasOwnProperty('forfeit') && matchCopy.forfeit) {

                        match['postedToHP'] = true;
                        //util.errLogger(location, null, 'match '+ match)
                        let saved = await match.save().then(
                            saved => {
                                fallThroughCheck = false;
                                return saved;
                            },
                            err => {
                                fallThroughCheck = false;
                                util.errLogger(location, err);
                                return null;
                            }
                        )
                        savedArray.push(saved);
                        if (savedArray.length == matches.length) {
                            success = true;
                        }

                    } else {

                        pq.addToQueue(
                            () => {
                                return sendToHp(postObj, divisions, matchCopy, match, matchObj, postedReplays, fallThroughCheck, savedArray, matches, success, logObj)
                            }
                        );
                        // ({ postedReplays, fallThroughCheck, success } = await sendToHp(postObj, divisions, matchCopy, match, matchObj, postedReplays, fallThroughCheck, savedArray, matches, success));

                    }

                } else {


                }


            }

        } else {
            //no matches found
        }
    } catch (e) {
        console.log(e);
    }


    return success;

}

module.exports = {
    postToHotsProfileHandler: postToHotsProfileHandler,
}

function promiseQueue() {

    let promiseQueue = {

    };

    promiseQueue.queue = [];

    promiseQueue.active = false;

    promiseQueue.doWork = function() {

        if (promiseQueue.queue.length > 0 && promiseQueue.active == false) {
            promiseQueue.active = true;
            let worker = promiseQueue.queue.shift();
            Promise.resolve(worker.apply()).then(
                doWorkResolved => {
                    promiseQueue.active = false;
                    // console.log('doWorkResolved ', doWorkResolved);
                    promiseQueue.doWork();
                });
        }

    }

    promiseQueue.addToQueue = function(fn) {
        promiseQueue.queue.push(fn);
        promiseQueue.doWork();
    }

    return promiseQueue;

}

async function sendToHp(postObj, divisions, matchCopy, match, matchObj, postedReplays, fallThroughCheck, savedArray, matches, success, logObj) {
    try {
        postObj['mode'] = process.env.heroProfileMode;
        //util.errLogger(location, null, 'matchCopy '+ matchCopy);
        postObj['division'] = getDivisionNameFromConcat(divisions, matchCopy.divisionConcat);
        postObj['team_one_name'] = matchCopy.home.teamName;
        postObj['team_one_image_url'] = process.env.heroProfileImage + matchCopy.home.logo;
        postObj['team_two_name'] = matchCopy.away.teamName;
        if (match.other) {
            postObj['team_one_player'] = matchCopy.other.homeTeamPlayer;
            postObj['team_two_player'] = matchCopy.other.awayTeamPlayer;
        }
        postObj['team_two_image_url'] = process.env.heroProfileImage + matchCopy.away.logo;
        if (matchCopy.hasOwnProperty('mapBans')) {
            postObj['team_one_map_ban_1'] = matchCopy.mapBans.homeOne;
            postObj['team_one_map_ban_2'] = matchCopy.mapBans.homeTwo;
            postObj['team_two_map_ban_1'] = matchCopy.mapBans.awayOne;
            postObj['team_two_map_ban_2'] = matchCopy.mapBans.awayTwo;
        }
        if (matchCopy.type == 'tournament') {
            postObj['round'] = 'T-' + matchCopy.round.toString();
        } else {
            postObj['round'] = matchCopy.round.toString();
        }
        postObj['season'] = matchCopy.season.toString();
    } catch (e) {
        util.errLogger(location, e);
    } finally {
        if (util.returnBoolByPath(matchCopy, 'replays')) {
            let replayKeys = Object.keys(matchCopy.replays);
            //util.errLogger(location, null, 'replayKeys '+ replayKeys)
            for (var j = 0; j < replayKeys.length; j++) {
                let localKey = j + 1;
                postObj['game'] = (j + 1).toString();
                let replayObj = matchCopy.replays[(j + 1).toString()];
                if (!util.isNullorUndefined(replayObj) && !util.returnBoolByPath(replayObj, 'parsedUrl')) {

                    postObj['replay_url'] = process.env.heroProfileReplay + replayObj.url;
                    logObj.target = 'Match Id: ' + matchObj.matchId;
                    if (replayObj.data) {
                        logObj.target += ', ReplayID: ' + replayObj.data;
                    }
                    logObj.timeStamp = new Date().getTime();
                    logObj.logLevel = 'STD';
                    //util.errLogger(location, null, postObj)
                    if (screenPostObject(postObj)) {
                        // if (false) {
                        //     // call to hotsprofile
                        let posted = await hpAPI.matchUpload(postObj).then(reply => {
                            return reply;
                        }, err => {
                            fallThroughCheck = false;
                            logObj.error = '';
                            if (err.message) {
                                logObj.error += err.message
                            }
                            if (err.response.data.message) {
                                logObj.error += ', ' + err.response.data.message
                            }
                            //if we get a known error then we need to remove this match and replay from the scrap...
                            if (err.response.data.message) {
                                if (err.response.data.message == 'Game mode is not custom.  Invalid replay sent') {
                                    postedReplays += 1;
                                }
                                if (err.response.data.message == 'Invalid parameter. A player provided was not in the game') {
                                    postedReplays += 1;
                                }
                            }
                            logObj.logLevel = 'ERROR';
                            logger(logObj);
                            return null;
                        });

                        if (posted && posted != 'null') {
                            fallThroughCheck = false;
                            logObj.action = ' logging reply from hots-profile ' + JSON.stringify(posted);
                            logger(logObj);
                            match['replays'][localKey]['parsedUrl'] = posted.url;
                            postedReplays += 1;
                        } else {
                            //if posted fails then do not set the match to fully reported
                            // postedReplays = false;
                        }
                    } else {
                        logObj.logLevel = "ERROR";
                        logObj.error = "This replay failed the screen, NOT SENT TO HEROSPROFILE!!";
                        logger(logObj);
                    }
                }
                if (fallThroughCheck) {
                    console.log('localKey', localKey);
                    logObj.logLevel = "WARNING";
                    logObj.error = "This replay did nothing, needs investigation.";
                    logger(logObj);
                }
            }
        }


        match['postedToHP'] = postedReplays > 0;
        //util.errLogger(location, null,'match ' + match )
        let saved = await match.save().then(saved => {
            fallThroughCheck = false;
            return saved;
        }, err => {
            fallThroughCheck = false;
            util.errLogger(location, err);
            return null;
        });
        savedArray.push(saved);
        if (savedArray.length == matches.length) {
            success = true;
        }

    }
    return { postedReplays, fallThroughCheck, success };
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