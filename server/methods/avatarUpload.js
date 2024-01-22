/*
Methods for uploading player avatar images

reviewed: 10-2-2020
reviewer: wraith
*/
const User = require('../models/user-models');
const CustomError = require('../methods/customError');
const { s3deleteFile } = require('./aws-s3/delete-s3-file');
const { s3putObject } = require('./aws-s3/put-s3-file');
const { prepImage } = require('./image-upload-common');

const avatarFolder = 'player-avatar/'


/**
 * @name uploadAvatar
 * @function
 * @description upload avatar image to s3 and create a pending approval queue
 * 
 * @param {string} dataURI 
 * @param {string} displayName 
 */
async function uploadAvatar(dataURI, displayName) {

    //prep image for upload
    let preppedImage = await prepImage(dataURI, { displayName });

    if (preppedImage) {
        let successObject = {};

        //upload to s3 bucket
        let s3await = await s3putObject(process.env.s3bucketGeneralImages, avatarFolder, preppedImage.fileName, preppedImage.buffer).then(
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
        //if upload to s3 succedded
        if (s3await.cont) {

            successObject.fileName = preppedImage.fileName;
            let foundUser = await User.findOne({
                displayName: displayName
            }).then((foundUser) => {
                if (foundUser) {
                    return foundUser;
                } else {
                    //user was not found delete the image we just saved..
                    s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, filePath);
                    let error = new CustomError('queryError', 'User not found!');
                    throw error;
                }
            }, (err) => {
                //the query err'ed delete the image we just saved
                s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, filePath);
                let error = new CustomError('queryError', 'User not found!');
                throw error;
            });
            //we found a user
            if (foundUser) {
                let userObj = foundUser.toObject();
                if (userObj.avatar && userObj.avatar != 'defaultAvatar.png' && userObj.avatar != 'pendingAvatar') {
                    //dont delete or replace the current avatar if the user has one
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
    } else {
        //throw file size error
        let error = new CustomError('fileSize', 'File is too big!');
        throw error;
    }

}

/**
 * @name deleteAvatar
 * @function
 * @description wrapped delete function
 * @deprecated
 * @param {string} path 
 */
function deleteAvatar(path) {
    return s3deleteFile(process.env.s3bucketGeneralImages, avatarFolder, path);
}

module.exports = {
    uploadAvatar: uploadAvatar,
    deleteAvatar: deleteAvatar
};