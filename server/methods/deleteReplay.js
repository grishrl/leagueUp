const Match = require('../models/match-model');
const Replay = require('../models/replay-parsed-models');
const Team = require('../models/team-models');
const utls = require('../utils');
const User = require('../models/user-models');
const AWS = require('aws-sdk');
const logger = require('../subroutines/sys-logging-subs').logger;
const HP = require('./heroesProfileAPI');

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

const notFound = 'not found';

async function deleteReplay(matchId, indexProp) {

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

                replayDeleteResult = await removeParsedFileFromDatabase(replayToDelete.data).then(res => {
                    return res;
                });

                removedFromTeamResult[0] = await removeParsedIdFromTeam(matchObj.home.id, replayToDelete.data).then(res => {
                    return res;
                });
                removedFromTeamResult[1] = await removeParsedIdFromTeam(matchObj.away.id, replayToDelete.data).then(res => {
                    return res;
                });
            }

            if (replayToDelete.url) {
                //remove from s3
                removedFromS3Result = await deleteFile(replayToDelete.url).then(answer => {
                    return answer;
                });
            }

            if (replayToDelete.parsedUrl) {
                //remove from hero profile
                removeFromHPResult = await HP.deleteReplayAPI(replayToDelete.parsedUrl).then(
                    res => {
                        return true;
                    },
                    err => {
                        return 'Error occured deleting this replay';
                    }
                );
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
            throw e;
        }
    } else {
        throw new Error('Replay property did not exist.');
    }



}

//remove parsed file from database;

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

//remove references to parsed file from team
async function removeParsedIdFromTeam(teamId, replayId) {
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
    if (utls.returnBoolByPath(teamObj, 'replays')) {
        let replayArr = utls.returnByPath(teamObj, 'replays');
        let index = replayArr.indexOf(replayId);
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
    removedFromUsers = await removeParsedFileFromUsersList(players, replayId);


    return {
        'removedFromTeam': savedResult,
        'teamName': teamObj.teamName,
        'removedFromUsers': removedFromUsers
    };
}

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

//remove reference to parsed file from player
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
//remove file from S3 
async function deleteFile(path) {
    let data = {
        Bucket: process.env.s3bucketReplays,
        Key: path
    };
    return new Promise((resolve, reject) => {
        s3replayBucket.deleteObject(data, (err, data) => {
            let returnVal = false;
            if (err) {
                //log object
                let sysObj = {};
                sysObj.actor = 'SYSTEM';
                sysObj.action = 'error deleting from AWS ';
                sysObj.location = 'delete replay'
                sysObj.logLevel = 'ERROR';
                sysObj.error = err;
                sysObj.target = path;
                sysObj.timeStamp = new Date().getTime();
                logger(sysObj);
            } else {
                returnVal = true;
                //log object
                let sysObj = {};
                sysObj.actor = 'SYSTEM';
                sysObj.action = 'deleted from AWS ';
                sysObj.location = 'delete replay'
                sysObj.logLevel = 'STD';
                sysObj.target = path;
                sysObj.timeStamp = new Date().getTime();
                logger(sysObj);
            }
            resolve(returnVal);
        });
    });
}

//remove the reference from match


//delete replay info from heroesprofile

module.exports = { deleteReplay };