const Team = require("../models/team-models");
const AWS = require('aws-sdk');
const logger = require('../subroutines/sys-logging-subs').logger;
const CustomError = require('./customError');
const { s3deleteFile } = require('../methods/aws-s3/delete-s3-file');
const { s3putObject } = require('../methods/aws-s3/put-s3-file');

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});



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
        uploadedFileName += teamName + stamp + "_logo";

        if (png > -1) {
            uploadedFileName += ".png";
        } else if (jpg > -1) {
            uploadedFileName += ".jpg";
        } else if (jpeg > -1) {
            uploadedFileName += ".jpeg";
        } else if (gif > -1) {
            uploadedFileName += ".gif";
        } else {
            uploadedFileName += ".png";
        }

        var buf = new Buffer.from(dataURI.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        let successObject = {};

        let s3await = await s3putObject(process.env.s3bucketImages, null, uploadedFileName, buf).then(
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
                        s3deleteFile(process.env.s3bucketImages, null, logoToDelete);
                    }
                    return foundTeam;
                } else {
                    let error = new CustomError('queryError', 'Team not found!');
                    throw error;
                }
            }, (err) => {
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

async function teamLogoArchive(logo) {
    let aws = new AWS.S3({

    });
    let successObject = {};
    var params = {
        Bucket: process.env.s3bucketArchiveImages,
        CopySource: process.env.s3bucketImages + "/" + logo,
        Key: logo
    }

    let copyObjectPromise = aws.copyObject(params).promise();
    let s3await = await copyObjectPromise.then(
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
        successObject.message = "File uploaded";
        successObject.eo = {};
    } else {
        let error = new CustomError('uploadError', 's3 copy failure!');
        throw error;
    }
    return successObject;
}

//using this as a wrapper for my dry function
function teamLogoDelete(path) {
    return s3deleteFile(process.env.s3bucketImages, null, path);
}

module.exports = {
    uploadTeamLogo: uploadTeamLogo,
    archiveTeamLogo: teamLogoArchive,
    teamLogoDelete: teamLogoDelete
};