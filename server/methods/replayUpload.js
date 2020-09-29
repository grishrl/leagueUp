const fs = require('fs');
const n_util = require('util');
const util = require('../utils');
const { s3putObject } = require('../methods/aws-s3/put-s3-file');

const path = 'S3ReplayUploader';

fs.readFileAsync = n_util.promisify(fs.readFile);

async function uploadReplayToS3(file, fileName) {
    return new Promise((resolve, reject) => {
        fs.readFileAsync(file).then(
            buffer => {
                s3putObject(process.env.s3bucketReplays, null, fileName, buffer).then(
                    success => {
                        resolve({
                            'state': true,
                            'message': 'upload succeeded'
                        });
                    },
                    failure => {
                        reject({
                            'state': false,
                            'message': 'upload failed'
                        });
                    }
                );
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