/**
 * This methods is wrapped by utility routes; crons from teporize;
 * This handles the nightly uploads of replay files to heroes profile
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */
const Division = require('../models/division-models');
const Match = require('../models/match-model');
const MatchMethods = require('../methods/matchCommon');
const hpAPI = require('../methods/heroesProfileAPI');
const _ = require('lodash');
const util = require('../utils');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const logger = require('../subroutines/sys-logging-subs').logger;
const Scheduling = require('../models/schedule-models');

const TOURNAMENT = 'tournament';
const GRANDFINAL = 'grandfinal';
const SIMPLE = 'simple';
const NONSEAON = 'nonSeasonalTourn';

const location = 'uploadToHeroesProfileHandler'

/**
 * @name postToHotsProfileHandler
 * @function
 * @description Executes routine to submit replays to heroes profile
 * @param {number} limNum 
 */
async function postToHotsProfileHandler(limNum) {

    //reasonable default incase non is provided
    if (!limNum) {
        limNum = 20;
    } else {
        limNum = parseInt(limNum);
    }

    //find matches reported by captains but not send to heroes profile

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

    try {
        let pq = promiseQueue();
        if (matches.length > 0) {
            let divisionList = [];
            //get a list of divisions we need from the matches we have and get the division info from db
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

            //run through the array of matches to be reported
            for (var i = 0; i < matches.length; i++) {

                let logObj = {};
                logObj.actor = 'SYSTEM; CRON; Hots-Profile Submit';
                let match = matches[i];

                let matchCopy = _.cloneDeep(util.objectify(match));
                //get the team info for each team in the match in case it isnt there all ready
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
                        let saved = await match.save().then(
                            saved => {
                                return saved;
                            },
                            err => {
                                util.errLogger(location, err);
                                return null;
                            }
                        )

                    } else {

                        pq.addToQueue(
                            () => {
                                return sendToHp(divisions, matchCopy, match, logObj)
                            }
                        );

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

    return 'finished check logs for info';

}

module.exports = {
    postToHotsProfileHandler: postToHotsProfileHandler,
}

/**
 * Promise Queue
 * add a list of promises to the queue that get resolved and handled one at a time
 * why this and not a promise all? well i dont want to bombard the heroes profile 
 * API with a mass of requests at once; in theory this should allow the requests to 
 * go out one at a time as the prior resolves
 */
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

/**
 * @name sendToHp
 * @function
 * @description sends replay files to HP API
 * @param {Array<Object>} divisions -> array of division objects
 * @param {Object} matchCopy -> match object (objectified)
 * @param {Match} match -> match object mongoose
 * @param {Object} logObj -> logging object
 */
async function sendToHp(divisions, matchCopy, match, logObj) {
    let postObj = {};
    let fallThroughCheck = true; //this will make sure this replay does not get stuck if someonthing was reported wrong
    let postedReplays = 0;
    try {

        //reset log info
        logObj.action = '';
        logObj.error = '';

        //we will fill our post object with tasty data for heroes profile

        //dev/prod
        postObj['mode'] = process.env.heroProfileMode;

        //we will send division info depending on the type of match we're dealing with
        /**
         *  SIMPLE > this is a normal season match OR a coastal tournament match 
         *  NONSEAON > this is a tournament that is NOT part of NGS seasonal activities IE storm qualifiers or ... hopefully some community activities !!! This value will be the event name
         *  GRANDFINAL > this is a special match type for end of season games; generated to bring two divisions together in the grand finals
         */
        let det = await determineDivision(matchCopy, divisions).then(
            ret => {
                return ret;
            }
        );

        if (det.type == SIMPLE) {
            postObj['team_one_division'] = det.divName;
            postObj['team_two_division'] = det.divName;

        } else if (det.type == NONSEAON) {
            postObj['tournament'] = det.divName;

        } else if (det.type == GRANDFINAL) {
            postObj['team_one_division'] = _.find(det.divName, val => {
                if (val.teamName == matchCopy.home.teamName) {
                    return true;
                }
            }).divName;

            postObj['team_two_division'] = _.find(det.divName, val => {
                if (val.teamName == matchCopy.away.teamName) {
                    return true;
                }
            }).divName;

        } else {
            postObj['division'] = undefined;
        }

        //team names and logos
        postObj['team_one_name'] = matchCopy.home.teamName;
        postObj['team_one_image_url'] = process.env.heroProfileImage + matchCopy.home.logo;
        postObj['team_two_name'] = matchCopy.away.teamName;
        postObj['team_two_image_url'] = process.env.heroProfileImage + matchCopy.away.logo;

        //this is a special flag for heroes profile; knowing a player from each team allows HP to associate each replay to a team
        if (match.other) {
            postObj['team_one_player'] = matchCopy.other.homeTeamPlayer;
            postObj['team_two_player'] = matchCopy.other.awayTeamPlayer;
        }

        //send the map bans
        if (matchCopy.hasOwnProperty('mapBans')) {
            postObj['team_one_map_ban_1'] = matchCopy.mapBans.homeOne;
            postObj['team_one_map_ban_2'] = matchCopy.mapBans.homeTwo;
            postObj['team_two_map_ban_1'] = matchCopy.mapBans.awayOne;
            postObj['team_two_map_ban_2'] = matchCopy.mapBans.awayTwo;
        }

        //send the round
        if (matchCopy.type == TOURNAMENT) {
            postObj['round'] = 'T-' + matchCopy.round.toString();
        } else {
            postObj['round'] = matchCopy.round.toString();
        }

        //send season info
        postObj['season'] = matchCopy.season.toString();

        //does this match have replays?
        if (util.returnBoolByPath(matchCopy, 'replays')) {

            // get the replay keys; assume that _id will never be valid;
            delete matchCopy.replays._id;

            let replayKeys = Object.keys(matchCopy.replays);

            for (var j = 0; j < replayKeys.length; j++) {
                let localKey = j + 1;

                postObj['game'] = (j + 1).toString();

                let replayObj = matchCopy.replays[(j + 1).toString()];

                // if the specific replay object is not null or undefined and the replay does NOT have a valid submission to HP all ready
                if (!util.isNullorUndefined(replayObj) && !util.returnBoolByPath(replayObj, 'parsedUrl')) {


                    postObj['replay_url'] = process.env.heroProfileReplay + replayObj.url;
                    logObj.target = 'Match Id: ' + matchCopy.matchId;
                    if (replayObj.data) {
                        logObj.target += ', ReplayID: ' + replayObj.data;
                    }
                    logObj.timeStamp = new Date().getTime();
                    logObj.logLevel = 'STD';

                    if (screenPostObject(postObj)) {

                        //Post to Heroes Profile >>>>>>>>>>>>>>>>>>>>>>>>
                        let errorReturn = false;
                        let posted = await hpAPI.matchUpload(postObj).then(reply => {
                            return reply;
                        }, err => {
                            errorReturn = true;
                            return err;
                        });

                        //finished post to Heroes Profile >>>>>>>>>>>>>>>

                        if (!errorReturn) {
                            fallThroughCheck = false;
                            logObj.action = ' logging reply from hots-profile ' + JSON.stringify(posted);
                            logger(logObj);
                            match['replays'][localKey]['parsedUrl'] = posted.url;
                            postedReplays += 1;
                        } else {
                            try {
                                //if post fails then do not set the match to fully reported
                                fallThroughCheck = false;
                                logObj.action = '';
                                logObj.error = '';
                                if (posted.response.data.message) {
                                    logObj.error += posted.response.data.message
                                }
                                postedReplays += 1;
                                logObj.logLevel = 'ERROR';
                                logger(logObj);
                            } catch (e) {
                                console.log(e);
                            }

                        }

                    } else {
                        logObj.logLevel = "ERROR";
                        logObj.error = "This replay failed the screen, NOT SENT TO HEROSPROFILE!!";
                        logger(logObj);
                    }
                } // if this replay DOES HAVE a valid submission to HP then count it as submitted
                else if (util.returnBoolByPath(replayObj, 'parsedUrl')) {
                    postedReplays += 1;
                }
                if (fallThroughCheck) {
                    logObj.logLevel = "WARNING";
                    logObj.error = "This replay did nothing, needs investigation.";
                    logger(logObj);
                }
            }
            //end loop
        }

        // if we had any succes posting to HP then set reported flag to true to remove this match from submission queue; if problems are reported with it later check the logs.
        match['postedToHP'] = postedReplays > 0;
        //util.errLogger(location, null,'match ' + match )
        let saved = await match.save().then(saved => {
            return saved;
        }, err => {
            util.errLogger(location, err);
            return null;
        });

    } catch (e) {
        util.errLogger(location, e);
    }
    return null;
}

/**
 * @name screenPostObject
 * @function
 * @description check the heroes profile post object and make sure that we have some values in each or just dont send it
 * @param {Object} postObj 
 */
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

/**
 * @name getDivisionNameFromConcat
 * @function
 * @description return the division name of the accept the list of division concat name from divisions list
 * @param {Array.<Object>} divisionList 
 * @param {string} divConcat 
 */
function getDivisionNameFromConcat(divisionList, divConcat) {
    let returnDiv = '';
    divisionList.forEach(element => {
        if (element.divisionConcat == divConcat) {
            returnDiv = element.displayName;
        }
    });
    return returnDiv;
}

/**
 * @name determineDivision
 * @function
 * @description determine what match type this; SIMPLE, NONSEAON, or GRANDFINAL and return the division info for each time that goes with each value
 * @param {Object} match 
 * @param {Array.<Object>} divisions 
 */
async function determineDivision(match, divisions) {
    let divisionReturn = {};
    if (match.divisionConcat) {
        divisionReturn['type'] = SIMPLE;
        divisionReturn['divName'] = getDivisionNameFromConcat(divisions, match.divisionConcat);
    } else {
        if (match.type == TOURNAMENT) {
            divisionReturn['type'] = NONSEAON;
            let tournName = await Scheduling.findOne({
                challonge_ref: parseInt(match.challonge_tournament_ref)
            }).then(
                found => {
                    return util.returnByPath(util.objectify(found), 'name');
                },
                err => {
                    return undefined;
                }
            );

            divisionReturn['divName'] = tournName

        } else if (match.type == GRANDFINAL) {
            divisionReturn['type'] = GRANDFINAL;
            divisionReturn['divName'] = []

            divisionReturn.divName.push({
                teamName: match.away.teamName,
                divName: getDivisionByTeamName(divisions, match.away.teamName).displayName
            });

            divisionReturn.divName.push({
                teamName: match.home.teamName,
                divName: getDivisionByTeamName(divisions, match.home.teamName).displayName
            });
        }
    }
    return divisionReturn;
}
/**
 * @name
 * @function
 * @description return the appropriate division name for provided team
 * 
 * @param {Array.<Object>} divisionList 
 * @param {string} teamName 
 */
function getDivisionByTeamName(divisionList, teamName) {
    return _.find(divisionList, function(v) {
        if (v.teams.indexOf(teamName) > -1) {
            return true;
        }
    });
}