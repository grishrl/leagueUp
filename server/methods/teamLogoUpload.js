/**
 * Methods for handling uploading a team logo and archiving a team logo
 * 
 * reviewed: 10-5-2020
 * reviewer: wraith
 */

const Team = require("../models/team-models");
const AWS = require('aws-sdk');
const utils = require('../utils')
const CustomError = require('./customError');
const { s3deleteFile } = require('../methods/aws-s3/delete-s3-file');
const { s3putObject } = require('../methods/aws-s3/put-s3-file');
const { prepImage } = require('./image-upload-common');

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});


/**
 * @name uploadTeamLogo
 * @function
 * @description uploads team logo to s3 bucket and updates team profile with logo
 * @param {string} dataURI 
 * @param {string} teamName 
 */
async function uploadTeamLogo(dataURI, teamName) {

    let preppedImage = await prepImage(dataURI, { teamName });

    if (preppedImage) {
        let successObject = {};

        let s3await = await s3putObject(process.env.s3bucketImages, null, preppedImage.fileName, preppedImage.buffer).then(
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

        //continue if s3 upload worked
        if (s3await.cont) {
            let lower = teamName.toLowerCase();
            let foundTeam = await Team.findOne({
                teamName_lower: lower
            }).then((foundTeam) => {
                if (foundTeam) {
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
                //delete the exising logo
                var logoToDelete;
                if (foundTeam.logo) {
                    logoToDelete = foundTeam.logo;
                }
                if (logoToDelete) {
                    s3deleteFile(process.env.s3bucketImages, null, logoToDelete);
                }
                //set the team info to the new logo filename
                foundTeam.logo = preppedImage.fileName;
                let bubbleUp = await foundTeam.save().then((savedTeam) => {
                    return savedTeam;
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
    } else {
        let error = new CustomError('fileSize', 'File is too big!');
        throw error;
    }

}

/**
 * @name teamLogoArchive
 * @function
 * @description adds provided logo into the team logo archive
 * @param {string} logo 
 */
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
            console.log(s3fail);
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
        utils.errLogger('teamLogoUpload', s3await.eo, `${logo} Uploading team logo to archive failed.`)
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