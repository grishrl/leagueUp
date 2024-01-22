/**
 * DELETE REPLAY
 * reviewed 10-2-2020
 * reviewer wraith
 */
const Match = require('../models/match-model');
const Replay = require('../models/replay-parsed-models');
const Team = require('../models/team-models');
const utls = require('../utils');
const User = require('../models/user-models');
const logger = require('../subroutines/sys-logging-subs').logger;
const HP = require('./heroesProfileAPI');
const { s3deleteFile } = require('../methods/aws-s3/delete-s3-file');

const notFound = 'not found';

/**
 * @name deleteReplay
 * @function
 * @description deletes the replay information of the match of the index provided; removes from heroes profile as well
 * @param {string} matchId 
 * @param {string} indexProp 
 */
async function deleteReplay(matchId, indexProp) {

    //get match
    let match = await Match.findOne({ matchId: matchId }).then(
        found => {
            if (found) {
                return found;
            } else {
                throw new Error('Match not found');
            }
        },
        err => {
            throw err;
        }
    );

    let matchObj = utls.objectify(match);


    let replayToDelete = matchObj.replays[indexProp];

    let replayDeleteResult;
    let removedFromTeamResult = [];
    let removeFromHPResult;
    let removedFromS3Result;

    if (replayToDelete) {
        try {

            if (replayToDelete.data) {
                try {
                    //remove the parsed data from database
                    replayDeleteResult = await removeParsedFileFromDatabase(replayToDelete.data).then(res => {
                        return res;
                    });

                    //remove association from home team
                    removedFromTeamResult[0] = await removeParsedIdFromTeam(matchObj.home.id, replayToDelete.data).then(res => {
                        return res;
                    });
                    //remove association from away team
                    removedFromTeamResult[1] = await removeParsedIdFromTeam(matchObj.away.id, replayToDelete.data).then(res => {
                        return res;
                    });
                } catch (e) {
                    console.log("catch1", e)
                }

            }

            if (replayToDelete.url) {
                //remove from s3
                try {
                    removedFromS3Result = await s3deleteFile(process.env.s3bucketReplays, null, replayToDelete.url).then(answer => {
                        return answer;
                    });
                } catch (e) {
                    console.log("catch2", e)
                }

            }

            if (replayToDelete.parsedUrl) {
                //remove from hero profile
                try {
                    removeFromHPResult = await HP.deleteReplayAPI(replayToDelete.parsedUrl).then(
                        res => {
                            return true;
                        },
                        err => {
                            return 'Error occured deleting this replay';
                        }
                    );
                } catch (e) {
                    console.log("catch3", e)
                }

            }

            delete matchObj.replays[indexProp];
            match.replays = matchObj.replays;
            match.markModified('replays');
            let matchMod = await match.save().then(
                saved => {
                    return true;
                },
                err => {
                    throw err;
                }
            );

            return {
                replayDeleteResult,
                removedFromTeamResult,
                removedFromS3Result,
                removeFromHPResult,
                matchMod
            };

        } catch (e) {
            console.log('try', e);
            throw e;
        }
    } else {
        throw new Error('Replay property did not exist.');
    }



}


/**
 * @name removeParsedFileFromDatabase
 * @function
 * @description remove parsed file from database
 * @param {string} dataId parsed replay id
 */
async function removeParsedFileFromDatabase(dataId) {
    return Replay.findOneAndDelete({ systemId: dataId }).lean().then(
        deleted => {
            if (deleted) {
                return true;
            } else {
                return notFound;
            }
        },
        err => {
            throw err;
        }
    )
}


/**
 * @name removeParsedIdFromTeam
 * @function
 * @description remove references to parsed file from team
 * @param {string} teamId 
 * @param {string} replayId 
 */
async function removeParsedIdFromTeam(teamId, replayId) {
    //get team
    let team = await Team.findById(teamId).then(
        found => {
            if (found) {
                return found;
            } else {
                throw new Error('Team not found');
            }
        },
        err => {
            throw err;
        }
    );
    let teamObj = utls.objectify(team);
    let savedResult;
    //check replays array 
    if (utls.returnBoolByPath(teamObj, 'replays')) {
        let replayArr = utls.returnByPath(teamObj, 'replays');
        let index = replayArr.indexOf(replayId);
        //remove the replay id from the array if its there
        if (index > -1) {
            replayArr = replayArr.splice(index);
            team.replays = replayArr;
            team.markModified('replays');
            savedResult = await team.save().then(
                saved => {
                    if (saved) {
                        return true;
                    } else {
                        return false;
                    }
                },
                err => {
                    throw err;
                }
            )
        } else {
            savedResult = notFound;
        }

    }
    let removedFromUsers

    let players = [];
    teamObj.teamMembers.forEach(teamMemb => {
        players.push(teamMemb.displayName);
    });

    //remove the replay ID from the team's players
    removedFromUsers = await removeParsedFileFromUsersList(players, replayId);


    return {
        'removedFromTeam': savedResult,
        'teamName': teamObj.teamName,
        'removedFromUsers': removedFromUsers
    };
}

/**
 * @name removeParsedFileFromUsersList
 * @function
 * @description removes association of provided replay from the list of users
 * @param {Array.<string>} users array of user displaynames
 * @param {string} replayid id of replay
 */
async function removeParsedFileFromUsersList(users, replayid) {
    let promArr = [];
    users.forEach(user => {
        promArr.push(removeParsedFileFromUser(user, replayid).then(
            answer => {
                let obj = {};
                obj[user] = answer;
                return obj;
            }
        ));
    });
    let x = await Promise.all(promArr).then(answer => { return answer; });
    return x;
}


/**
 * @name removeParsedFileFromUser
 * @function
 * @description remove reference to parsed file from player
 * @param {string} userName 
 * @param {string} replayId 
 */
async function removeParsedFileFromUser(userName, replayId) {
    let user = await User.findOne({ displayName: userName }).then(
        found => {
            if (found) {
                return found;
            } else {
                throw new Error('User not found.');
            }
        }
    );

    let savedResult;
    let userObj = utls.objectify(user);
    if (utls.returnBoolByPath(userObj, 'replays')) {
        let replayArr = utls.returnByPath(userObj, 'replays');
        let index = replayArr.indexOf(replayId);
        replayArr = replayArr.splice(index);
        if (index > -1) {
            user.replays = replayArr;
            user.markModified('replays');
            savedResult = await user.save().then(
                saved => {
                    if (saved) {
                        return true;
                    } else {
                        return false;
                    }
                },
                err => {
                    throw err;
                }
            )
        } else {
            savedResult = notFound;
        }
    } else {
        savedResult = notFound;
    }
    return savedResult;
}

module.exports = { deleteReplay };