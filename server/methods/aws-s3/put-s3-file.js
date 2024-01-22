/**
 * s3putfile
 */
const AWS = require('aws-sdk');
const logger = require('../../subroutines/sys-logging-subs').logger;

//remove file from S3 
AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

/**
 * @name s3putObject
 * @function
 * @description places file into s3 with specified bucket, folder, filename
 * @param {string} bucket 
 * @param {string} folder 
 * @param {string} fileName 
 * @param {buffer} body file data buffer
 */
function s3putObject(bucket, folder, fileName, body) {

    const s3Bucket = new AWS.S3({
        params: {
            Bucket: bucket
        }
    });

    let path = '';
    if (!folder) {
        path = `${fileName}`;
    } else if (folder.indexOf('/') != folder.length - 1) {
        path = `${folder}/${fileName}`;
    } else {
        path = `${folder}${fileName}`;
    }

    var data = {
        Key: path,
        Body: body,
        ContentEncoding: 'base64'
    };

    return s3Bucket.putObject(data).promise().then(
        success => {
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'uploaded to AWS ';
            sysObj.logLevel = 'STD';
            sysObj.location = 'AWS PUT FILE';
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
            return success;
        },
        failure => {
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'error uploading to AWS ';
            sysObj.logLevel = 'ERROR';
            sysObj.error = failure;
            sysObj.location = 'AWS PUT FILE';
            sysObj.target = path;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
            throw failure;
        }
    );
}

module.exports = { s3putObject };