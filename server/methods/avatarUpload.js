const User = require('../models/user-models');
const CustomError = require('../methods/customError');
const { s3deleteFile } = require('./aws-s3/delete-s3-file');
const { s3putObject } = require('./aws-s3/put-s3-file');

const avatarFolder = 'player-avatar/'


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
        uploadedFileName += displayName + stamp + "_avatar";

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

        let s3await = await s3putObject(process.env.s3bucketGeneralImages, avatarFolder, uploadedFileName, buf).then(
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