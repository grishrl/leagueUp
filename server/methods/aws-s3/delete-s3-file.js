/**
 * s3deletefile method
 */
const AWS = require('aws-sdk');
const logger = require('../../subroutines/sys-logging-subs').logger;

/**
 * @name s3deleteFile
 * @function
 * @description deletes file from s3 matching the bucket, folder, filename
 * @param {string} bucket 
 * @param {string} folder 
 * @param {string} fileName 
 */
async function s3deleteFile(bucket, folder, fileName) {



    let path = '';
    if (!folder) {
        path = `${fileName}`;
    } else if (folder.indexOf('/') != folder.length - 1) {
        path = `${folder}/${fileName}`;
    } else {
        path = `${folder}${fileName}`;
    }


    let data = {
        Bucket: bucket,
        Key: path
    };



    return new Promise((resolve, reject) => {
        //remove file from S3 
        AWS.config.update({
            accessKeyId: process.env.S3accessKeyId,
            secretAccessKey: process.env.S3secretAccessKey,
            region: process.env.S3region
        });

        const s3Bucket = new AWS.S3({
            params: {
                Bucket: bucket
            }
        });

        s3Bucket.deleteObject(data, (err, data) => {
            let returnVal = false;
            if (err) {
                //log object
                let sysObj = {};
                sysObj.actor = 'SYSTEM';
                sysObj.action = 'error deleting from AWS ';
                sysObj.location = 'delete file'
                sysObj.logLevel = 'ERROR';
                sysObj.error = err;
                sysObj.target = path;
                sysObj.timeStamp = new Date().getTime();
                logger(sysObj);
                reject(returnVal);
            } else {
                returnVal = true;
                //log object
                let sysObj = {};
                sysObj.actor = 'SYSTEM';
                sysObj.action = 'deleted from AWS ';
                sysObj.location = 'deleted file'
                sysObj.logLevel = 'STD';
                sysObj.target = path;
                sysObj.timeStamp = new Date().getTime();
                logger(sysObj);
                resolve(returnVal);
            }
        });
    });
}

module.exports = {
    s3deleteFile
};