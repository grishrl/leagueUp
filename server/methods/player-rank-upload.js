const User = require('../models/user-models');
const AWS = require('aws-sdk');
const logger = require('../subroutines/sys-logging-subs').logger;
const CustomError = require('./customError');
const utils = require('../utils');
const PendingRankQueue = require('../models/admin-models').PendingRankQueue;
const _ = require('lodash');

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

const folder = 'player-ranks-images/';

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

const s3Bucket = new AWS.S3({
    params: {
        Bucket: process.env.s3bucketGeneralImages
    }
});

//upload image and return the path where the image will be stored
async function uploadRankImage(dataURI, user_id, seasonInfo) {
    let uploadedFileName = '';
    var decoded = Buffer.byteLength(dataURI, 'base64');
    const successObject = {};



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

    if (decoded.length > 2500000) {
        let error = new CustomError('fileSize', 'File is too big!');
        throw error;
    } else {
        var png = dataURI.indexOf('png');
        var jpg = dataURI.indexOf('jpg');
        var jpeg = dataURI.indexOf('jpeg');
        var gif = dataURI.indexOf('gif');
        var stamp = Date.now();
        stamp = stamp.toString();
        stamp = stamp.slice(stamp.length - 4, stamp.length);
        uploadedFileName += `${user_id}_${seasonInfo.year}_${seasonInfo.season}_${stamp}.png`;
        var buf = new Buffer.from(dataURI.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        var data = {
            Key: folder + uploadedFileName,
            Body: buf,
            ContentEncoding: 'base64'
        };

        let putObjectPromise = s3Bucket.putObject(data).promise();
        let s3await = await putObjectPromise.then(
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
        )

        if (s3await.cont) {

            successObject['fileName'] = `${uploadedFileName}`;

        } else {
            let error = new CustomError('uploadError', 's3 upload failure!');
            throw error;
        }

    }

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
            deleteFile(fileToDelete);
        } catch (e) {
            console.log(e);
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
            console.log(e);
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

}

function deleteFile(path) {

    let data = {
        Bucket: process.env.s3bucketGeneralImages,
        Key: folder + path
    };
    s3Bucket.deleteObject(data, (err, data) => {
        if (err) {
            //log object
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'error deleting from AWS ';
            sysObj.location = 'player-rank-deleteFile'
            sysObj.logLevel = 'ERROR';
            sysObj.error = err;
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
        } else {
            //log object
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'deleted from AWS ';
            sysObj.location = 'player-rank-deleteFile'
            sysObj.logLevel = 'STD';
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
        }
    })
}

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

                deleteFile(foundQ.fileName);

                successObject.saved = saved;
                successObject.success = true;

            }
        }

    } catch (e) {
        console.log('eee', e);
    }

    return successObject;

}

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
                // let rankScheme = {
                //     hlRankMetal: rankObj.hlRankMetal,
                //     hlRankDivision: rankObj.hlRankDivision,
                //     season: seasonInf.season,
                //     year: seasonInf.year,
                //     status: 'verified'
                // }
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

                deleteFile(foundQ.fileName);

                successObject.success = true;

            }

        }
    } catch (e) {
        console.log('zzz', e);
    }

    return successObject;
}


module.exports = {
    uploadRankImage,
    deleteFile,
    playerRankApproved,
    playerRankDenied,
};