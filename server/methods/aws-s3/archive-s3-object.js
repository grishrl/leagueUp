/**
 * s3deletefile method
 */
const AWS = require('aws-sdk');
const utils = require('../../utils');
const logger = require('../../subroutines/sys-logging-subs').logger;
const uuid = require("uniqid");

async function s3archivePut(obj) {


    let archiveId = `${uuid()}.json`;

    let data = {
        Key: archiveId,
        Body: JSON.stringify(obj),
        ContentType: 'application/json',
        ContentEncoding: 'base64'
    };

    //remove file from S3 
    AWS.config.update({
        accessKeyId: process.env.S3accessKeyId,
        secretAccessKey: process.env.S3secretAccessKey,
        region: process.env.S3region
    });

    const s3Bucket = new AWS.S3({
        params: {
            Bucket: process.env.s3archiveObjects
        }
    });

    return s3Bucket.putObject(data).promise().then(
        putRes => {
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'uploaded to AWS ';
            sysObj.logLevel = 'STD';
            sysObj.location = 'AWS PUT FILE';
            sysObj.target = `${process.env.s3archiveObjects}/${archiveId}`;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
            return archiveId;
        },
        err => {
            let sysObj = {};
            sysObj.actor = 'SYSTEM';
            sysObj.action = 'error uploading to AWS ';
            sysObj.logLevel = 'ERROR';
            sysObj.error = err;
            sysObj.location = 'AWS PUT FILE';
            sysObj.target = `${process.env.s3archiveObjects}/${archiveId}`;
            sysObj.timeStamp = new Date().getTime();
            logger(sysObj);
            throw err;
        }
    );

}

async function s3archiveGet(archiveId) {

    let data = {
        Key: archiveId
    };

    //remove file from S3 
    AWS.config.update({
        accessKeyId: process.env.S3accessKeyId,
        secretAccessKey: process.env.S3secretAccessKey,
        region: process.env.S3region
    });

    const s3Bucket = new AWS.S3({
        params: {
            Bucket: process.env.s3archiveObjects
        }
    });

    return s3Bucket.getObject(data).promise().then(
        getRes => {
            return getRes;
        },
        err => {
            throw err;
        }
    );
}

module.exports = {
    s3archiveGet,
    s3archivePut
};