const util = require('../utils');
const router = require('express').Router();
const aws = require("aws-sdk");
const passport = require("passport");
const uuid = require("uniqid");

const serverPublicKey = process.env.s3clientUploaderAccesKey;
const serverSecretKey = process.env.s3clientUploaderS3secretAccessKey;

// Set these two values to match your environment
const uploadsBucket = "s3-client-uploads";




router.post("/sign", passport.authenticate('jwt', {
    session: false
}), function(req, res) {

    // Init S3, given your server-side keys.  Only needed if using the AWS SDK.
    // aws.config.update({
    //     accessKeyId: serverPublicKey,
    //     secretAccessKey: serverSecretKey,
    //     region: process.env.S3region
    // });

    const s3 = new aws.S3({
        accessKeyId: serverPublicKey,
        secretAccessKey: serverSecretKey,
        region: process.env.S3region
    });

    const expiry = 60 * 60;

    let fileInf = req.body.fileInfo;

    if (util.isNullOrEmpty(fileInf)) {
        res.status(500).send(util.returnMessaging('s3sig', 'Required Param Not Provided'));
    }

    if (!Array.isArray(fileInf)) {
        fileInf = [fileInf];
    }

    let promiseArray = [];
    fileInf.forEach(
        file => {

            fileAr = file.filename.split('.');
            let ext = fileAr[fileAr.length - 1];

            let newName = `${uuid()}.${ext}`

            const params = {
                Bucket: uploadsBucket,
                Key: newName,
                Expires: expiry,
                ContentType: file.type
            };

            promiseArray.push(s3.getSignedUrlPromise('putObject', params).then(
                sU => {
                    return {
                        clientName: file.filename,
                        file: params.Key,
                        signedUrl: sU
                    }
                },
                err => {
                    throw err;
                }
            ));
        }
    )

    Promise.all(promiseArray).then(
        resolved => {
            res.status(200).send(util.returnMessaging('s3sig', 'Generated Sig Success', null, resolved));
        },
        err => {
            res.status(500).send(util.returnMessaging('s3sig', 'Generated Sig Failed', err));
        }
    )

});


module.exports = router;