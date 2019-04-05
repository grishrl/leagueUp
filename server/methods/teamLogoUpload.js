const Team = require("../models/team-models");
const AWS = require('aws-sdk');
const logger = require('../subroutines/sys-logging-subs');

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

const s3Bucket = new AWS.S3({
    params: {
        Bucket: process.env.s3bucketImages
    }
});

class CustomError extends Error {
    constructor(reason, message) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(message);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }

        this.name = 'CustomError';
        // Custom debugging information
        this.reason = reason;
        this.date = new Date();
    }
}

async function uploadTeamLogo(path, dataURI, teamName) {
    let uploadedFileName = '';
    var decoded = Buffer.byteLength(dataURI, 'base64');

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
        uploadedFileName += teamName + stamp + "_logo.png";
        var buf = new Buffer.from(dataURI.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        var data = {
            Key: uploadedFileName,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/png'
        };
        let x = 'aaaa'
            // s3Bucket.putObject(data, function(err, data) {
            //     if (err) {
            //         let sysObj = {};
            //         sysObj.actor = 'SYSTEM';
            //         sysObj.action = 'error uploading to AWS ';
            //         sysObj.logLevel = 'ERROR';
            //         sysObj.error = err;
            //         sysObj.location = path;
            //         sysObj.target = teamName;
            //         sysObj.timeStamp = new Date().getTime();
            //         logger(sysObj);
            //     } else {
            //         console.log('LOGGING X ', x);
            //         let sysObj = {};
            //         sysObj.actor = 'SYSTEM';
            //         sysObj.action = 'uploaded to AWS ';
            //         sysObj.logLevel = 'STD';
            //         sysObj.location = path;
            //         sysObj.target = teamName;
            //         sysObj.timeStamp = new Date().getTime();
            //         logger(sysObj);
            //     }
            // });
        let successObject = {};
        let putObjectPromise = s3Bucket.putObject(data).promise();
        let s3await = await putObjectPromise.then(
            s3pass => {
                return {
                    "cont": true,
                    "eo": s3pass
                };
                // console.log('s3 success!');
            },
            s3fail => {
                return {
                    "cont": false,
                    "eo": s3fail
                };
                // console.log('S3 failure!');
            }
        )
        if (s3await.cont) {
            let lower = teamName.toLowerCase();
            let foundTeam = await Team.findOne({
                teamName_lower: lower
            }).then((foundTeam) => {
                if (foundTeam) {
                    var logoToDelete;
                    if (foundTeam.logo) {
                        logoToDelete = foundTeam.logo;
                    }
                    if (logoToDelete) {
                        deleteFile(logoToDelete);
                    }
                    return foundTeam;
                } else {
                    deleteFile(filePath);
                    let error = new CustomError('queryError', 'Team not found!');
                    throw error;
                }
            }, (err) => {
                deleteFile(filePath);
                let error = new CustomError('queryError', 'Team not found!');
                throw error;
            });
            if (foundTeam) {
                foundTeam.logo = uploadedFileName;
                let bubbleUp = await foundTeam.save().then((savedTeam) => {
                    if (savedTeam) {
                        return savedTeam;
                    }
                }, (err) => {
                    deleteFile(filePath);
                    let error = new CustomError('genErr', 'Error uploading file!');
                    throw error;
                });
                if (bubbleUp) {
                    successObject.message = "File uploaded";
                    successObject.eo = bubbleUp.toObject();
                }
            }

        } else {
            let error = new CustomError('uploadError', 's3 upload failure!');
            throw error;
        }

        return successObject;
    }
}

function deleteFile(path) {
    let data = {
        Bucket: process.env.s3bucketImages,
        Key: path
    };
    s3Bucket.deleteObject(data, (err, data) => {
        if (err) {
            //log object
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'error deleting from AWS ';
            sysObj.location = 'team-route-deleteFile'
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
            sysObj.location = 'team-route-deleteFile'
            sysObj.logLevel = 'STD';
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
        }
    })
}

module.exports = {
    uploadTeamLogo: uploadTeamLogo,
    deleteFile: deleteFile
};