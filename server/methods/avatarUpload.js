const User = require('../models/user-models');
const AWS = require('aws-sdk');
const CustomError = require('../methods/customError');
const { s3deleteFile } = require('./aws-s3/delete-s3-file');

const avatarFolder = 'player-avatar/'

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

async function uploadAvatar(path, dataURI, displayName) {
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
        uploadedFileName += displayName + stamp + "_avatar.png";
        var buf = new Buffer.from(dataURI.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        var data = {
            Key: avatarFolder + uploadedFileName,
            Body: buf,
            ContentEncoding: 'base64'
        };
        let successObject = {};
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

            successObject.fileName = uploadedFileName;
            let foundUser = await User.findOne({
                displayName: displayName
            }).then((foundUser) => {
                if (foundUser) {
                    return foundUser;
                } else {

                    s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, filePath);
                    let error = new CustomError('queryError', 'User not found!');
                    throw error;
                }
            }, (err) => {

                s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, filePath);
                let error = new CustomError('queryError', 'User not found!');
                throw error;
            });
            if (foundUser) {
                let userObj = foundUser.toObject();
                if (userObj.avatar && userObj.avatar != 'defaultAvatar.png' && userObj.avatar != 'pendingAvatar') {
                    // foundUser.avatar = foundUser.avatar
                } else {
                    foundUser.avatar = 'pendingAvatar.png';
                }

                let bubbleUp = await foundUser.save().then((savedUser) => {
                    if (savedUser) {
                        return savedUser;
                    }
                }, (err) => {

                    s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, filePath);
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

//wrapping my new dry function because I'm dumb and screwed up. this is easier
function deleteAvatar(path) {
    return s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, path);
}

module.exports = {
    uploadAvatar: uploadAvatar,
    deleteAvatar: deleteAvatar
};