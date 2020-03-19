const fs = require('fs');
const n_util = require('util');
const AWS = require('aws-sdk');
const logger = require('../subroutines/sys-logging-subs');
const util = require('../utils');

const path = 'S3ReplayUploader';

fs.readFileAsync = n_util.promisify(fs.readFile);

AWS.config.update({
    accessKeyId: process.env.S3accessKeyId,
    secretAccessKey: process.env.S3secretAccessKey,
    region: process.env.S3region
});

const s3replayBucket = new AWS.S3({
    params: {
        Bucket: process.env.s3bucketReplays
    }
});

async function uploadReplayToS3(file, fileName) {
    return new Promise((resolve, reject) => {
        fs.readFileAsync(file).then(
            buffer => {
                var data = {
                    Key: fileName,
                    Body: buffer
                };
                s3replayBucket.putObject(data, function(err, data) {
                    util.errLogger(path, data, 'replay data..');
                    if (err) {

                        //log object
                        let sysLog = {};
                        sysLog.actor = 'SYS';
                        sysLog.action = ' upload replay ';
                        sysLog.logLevel = 'ERROR';
                        sysLog.target = data.Key
                        sysLog.timeStamp = new Date().getTime();
                        sysLog.error = err;
                        logger(sysLog);

                        reject({ 'state': false, 'message': 'upload failed' });

                    } else {
                        //log object
                        let sysLog = {};
                        sysLog.actor = 'SYS';
                        sysLog.action = ' upload replay ';
                        sysLog.logLevel = 'SYSTEM';
                        sysLog.target = data.Key
                        sysLog.timeStamp = new Date().getTime();
                        logger(sysLog);

                        resolve({
                            'state': true,
                            'message': 'upload succeeded'
                        });
                    }
                });
            },
            err => {
                util.errLogger(path, err, 'replay upload error');
                reject({
                    'state': false,
                    'message': 'upload failed'
                });
            }
        )
    });

}

module.exports = {
    uploadReplayToS3
}