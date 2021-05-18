/**
 * Methods to handle the uploading of a player rank image, approval of a player rank, and denial of player rank
 * 
 * This process flows as such:
 * Player or captain uploads a screen shot of a specific players rank for specific season -> an admin looks at this picture on the admin tools and approves or denies this; 
 * as part of the approval the admin will record the players ranked as Metal / numeric division as they see in the image; this will be saved into the players verified ranks; 
 * also this will be given an NGS number; laid out speficically for each metal/division in order to get an average rank of the players
 * 
 * Denied uploads will be deleted and the process will be reset
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 */

const User = require('../models/user-models');
const Team = require('../models/team-models');
const logger = require('../subroutines/sys-logging-subs').logger;
const CustomError = require('./customError');
const utils = require('../utils');
const PendingRankQueue = require('../models/admin-models').PendingRankQueue;
const _ = require('lodash');
const s3deleteFile = require('../methods/aws-s3/delete-s3-file').s3deleteFile;
const { s3putObject } = require('../methods/aws-s3/put-s3-file');
const { prepImage } = require('../methods/image-upload-common');
const Message = require('../subroutines/message-subs');


/**
 * @name rankToNumber
 * @function
 * @description parses the provided metal / division into an NGS specific rank number
 * @param {string} hlRankMetal 
 * @param {number} hlRankDivision 
 */
function rankToNumber(hlRankMetal, hlRankDivision) {
    let num = 0;

    switch (hlRankMetal) {
        case 'Grand Master':
            num = 27;
            break;
        case 'Master':
            num = 26;
            break;
        case 'Diamond':
            num += 25 - (hlRankDivision - 1);
            break;
        case 'Platinum':
            num += 20 - (hlRankDivision - 1);
            break;
        case 'Gold':
            num += 15 - (hlRankDivision - 1);
            break;
        case 'Silver':
            num += 10 - (hlRankDivision - 1);
            break;
        case 'Bronze':
            num += 5 - (hlRankDivision - 1);
            break;
    }
    return num;
}

const PLAYERRANKFOLDER = 'player-ranks-images/';

/**
 * @name uploadRankImage
 * @function
 * @description upload image and return the path where the image will be stored; sets a pending status on the user for the given season info
 * @param {string} dataURI 
 * @param {string} user_id 
 * @param {Object} seasonInfo 
 * @param {number} seasonInfo.year 
 * @param {number} seasonInfo.season 
 */
async function uploadRankImage(dataURI, user_id, seasonInfo) {

    let query = {
        $and: [{
                userId: user_id
            },
            {
                "year": seasonInfo.year
            },
            {
                "season": seasonInfo.season
            }
        ]
    }
    let existingPendingQueue = await PendingRankQueue.findOne(query).then(
        found => {
            return found;
        },
        err => {
            return null;
        }
    );

    let preppedImage = await prepImage(dataURI, {
        user_id: user_id,
        year: seasonInfo.year,
        season: seasonInfo.season,
    });

    if (preppedImage) {

        const successObject = {};

        let s3await = await s3putObject(process.env.s3bucketGeneralImages, PLAYERRANKFOLDER, preppedImage.fileName, preppedImage.buffer).then(
            s3pass => {
                return {
                    "cont": true,
                    "eo": s3pass
                };
            },
            s3fail => {
                return {
                    "cont": false,
                    "eo": s3fail
                };
            }
        );

        //did the s3 upload succeed?
        if (s3await.cont) {

            successObject['fileName'] = `${preppedImage.fileName}`;

            //update the existing pending queue
            if (existingPendingQueue) {
                try {

                    //this user had a pending all ready - we have to update the existing
                    let fileToDelete = existingPendingQueue.fileName;
                    existingPendingQueue.fileName = successObject.fileName;
                    let saved = await existingPendingQueue.save().then(
                        saved => {
                            //saved..
                            return saved;
                        }, err => {
                            throw err;
                        }
                    );
                    successObject['savedQueue'] = saved;

                    s3deleteFile(process.env.s3bucketGeneralImages, PLAYERRANKFOLDER, fileToDelete);
                } catch (e) {
                    console.log('catch delete pedning player rank', e);
                }

            } else {
                try {

                    // we need to make a new pending item;
                    let newQ = await new PendingRankQueue({
                        userId: user_id,
                        year: seasonInfo.year,
                        season: seasonInfo.season,
                        fileName: successObject.fileName,
                        timestamp: Date.now().toString()
                    }).save().then(
                        newQ => {

                            return newQ;
                        },
                        err => {

                            throw err;
                        }
                    );
                    successObject['savedQueue'] = newQ;
                } catch (e) {
                    console.log('catch create new pending player rank', e);
                }


            }

            if (utils.returnBoolByPath(successObject, 'savedQueue')) {

                User.findById(user_id).then(
                    foundUser => {
                        if (foundUser) {
                            let userObj = utils.objectify(foundUser);
                            let addObject;
                            if (utils.returnBoolByPath(userObj, 'verifiedRankHistory')) {
                                let ind = _.findIndex(userObj.verifiedRankHistory, (i) => {
                                    if (i.season == seasonInfo.season && i.year == seasonInfo.year) {
                                        return true;
                                    }
                                });

                                if (ind > -1) {
                                    let obj = userObj.verifiedRankHistory[ind];
                                    obj['status'] = 'pending';
                                    userObj.verifiedRankHistory[ind] = obj;
                                } else {
                                    addObject = {
                                        hlRankMetal: 'nil',
                                        hlRankDivision: 0,
                                        season: seasonInfo.season,
                                        year: seasonInfo.year,
                                        status: 'pending'
                                    };
                                    userObj.verifiedRankHistory.push(addObject);
                                }
                            } else {

                                userObj.verifiedRankHistory = [addObject];
                            }

                            foundUser.verifiedRankHistory = userObj.verifiedRankHistory;

                            foundUser.markModified('verifiedRankHistory');
                            foundUser.save().then(
                                saved => {
                                    console.log('rank: user saved ok')
                                },
                                err => {
                                    console.log('rank: user save failed')
                                }
                            )
                        }
                    },
                    err => {
                        throw err;
                    }
                )

            }
            return successObject;

        } else {

            let error = new CustomError('uploadError', 's3 upload failure!');
            throw error;

        }

    } else {
        let error = new CustomError('fileSize', 'File is too big!');
        throw error;
    }

}

/**
 * @name playerRankApproved
 * @function
 * @description deletes the image and queue for specified year/season/user currently and updates the user object with verified rank for specific season/year
 * @param {Object} rankObj 
 * @param {string} rankObj.userId id of user to modify
 * @param {number} rankObj.year specified year
 * @param {number} rankObj.season specified season
 * @param {string} rankObj.hlRankMetal - verified rank metal
 * @param {string} rankObj.hlRankDivision - verified rank division
 */
async function playerRankApproved(rankObj) {

    let successObject = {
        success: false
    };

    let query = {
        $and: [{
                userId: rankObj.userId
            },
            {
                season: rankObj.seasonInf.season
            },
            {
                year: rankObj.seasonInf.year
            }
        ]
    };
    try {

        let foundQ = await PendingRankQueue.findOneAndDelete(query).then(
            found => {
                return found;
            },
            err => {
                throw err;
            }
        );

        if (foundQ) {

            let user = await User.findById(foundQ.userId).then(
                found => {
                    return found;
                },
                err => {
                    throw err;
                }
            )
            let rankScheme = {
                hlRankMetal: rankObj.hlRankMetal,
                hlRankDivision: rankObj.hlRankDivision,
                season: rankObj.seasonInf.season,
                year: rankObj.seasonInf.year,
                level: rankToNumber(rankObj.hlRankMetal, rankObj.hlRankDivision),
                status: 'verified'
            }

            if (user) {
                let userObj = utils.objectify(user);
                if (utils.returnBoolByPath(userObj, 'verifiedRankHistory')) {
                    let i = _.findIndex(userObj.verifiedRankHistory, (i) => {
                        if (i.season == rankObj.seasonInf.season && i.year == rankObj.seasonInf.year) {
                            return true;
                        }
                    });
                    if (i > -1) {
                        user.verifiedRankHistory[i] = rankScheme;
                    } else {
                        user.verifiedRankHistory.push(rankScheme);
                    }
                } else {
                    user.verifiedRankHistory = [rankScheme];
                }

                let saved = await user.save().then(
                    saved => {

                        return saved;
                    }, err => {
                        throw err;
                    }
                )

                s3deleteFile(process.env.s3bucketGeneralImages, PLAYERRANKFOLDER, foundQ.fileName);

                successObject.saved = saved;
                successObject.success = true;

            }
        }

    } catch (e) {
        console.log('Pending Player Rank - Catch 3', e);
    }

    return successObject;

}

/**
 * @name playerRankDenied
 * @function
 * @description deletes the image and queue for specified year/season/user currently and resets the user object for specific season/year
 * @param {Object} rankObj 
 * @param {string} rankObj.userId id of user to modify
 * @param {number} rankObj.year specified year
 * @param {number} rankObj.season specified season
 * @param {string} rankObj.reason reason rank was denied
 * @param {string} rankObj.sender id of user who denied this rank image
 */
async function playerRankDenied(rankObj) {


    let successObject = {
        success: false
    };

    let query = {
        $and: [{
                userId: rankObj.userId
            },
            {
                season: rankObj.seasonInf.season
            },
            {
                year: rankObj.seasonInf.year
            }
        ]
    };

    try {
        let foundQ = await PendingRankQueue.findOneAndDelete(query).then(
            found => {
                return found;
            },
            err => {
                throw err;
            }
        );

        if (foundQ) {

            let user = await User.findById(foundQ.userId).then(
                found => {
                    return found;
                },
                err => {
                    throw err;
                }
            )

            if (user) {

                let userObj = utils.objectify(user);
                if (utils.returnBoolByPath(userObj, 'verifiedRankHistory')) {
                    let i = _.findIndex(userObj.verifiedRankHistory, (i) => {
                        if (i.season == rankObj.seasonInf.season && i.year == rankObj.seasonInf.year) {
                            return true;
                        }
                    });
                    if (i > -1) {
                        user.verifiedRankHistory.splice(i, 1);
                    }
                }
                let saved = await user.save().then(
                    saved => {

                        return saved;
                    }, err => {
                        throw err;
                    }
                )

                s3deleteFile(process.env.s3bucketGeneralImages, PLAYERRANKFOLDER, foundQ.fileName)

                successObject.success = true;

                rejectionMessaging(userObj, rankObj);

            }

        }

    } catch (e) {
        console.log('Pending player rank - catch 4', e);
    }

    return successObject;
}

function rejectionMessaging(userObj, rankObj) {
    const subject = 'Rank Verification Image Denied';

    const content = `${userObj.displayName} 's Year - ${rankObj.seasonInf.year} , Season - ${rankObj.seasonInf.season}:  Rank Image was denied because: ${rankObj.reason}`;
    Message(userObj._id, subject, content, rankObj.sender);
    Team.findById(userObj.teamId).then(
        foundTeam => {
            let teamObj = utils.objectify(foundTeam);
            if (userObj.displayName !== teamObj.captain) {
                User.findOne({ displayName: teamObj.captain }).then(
                    foundCapt => {
                        let capt = utils.objectify(foundCapt);
                        Message(capt._id, subject, content, rankObj.sender);
                    }
                );
            }
        }
    )
}

module.exports = {
    uploadRankImage,
    playerRankApproved,
    playerRankDenied,
};