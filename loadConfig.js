const aws = require("aws-sdk");
require('dotenv').config();

const serverPublicKey = process.env.serverConfigKey;
const serverSecretKey = process.env.serverConfigSecret;

const s3 = new aws.S3({
    accessKeyId: serverPublicKey,
    secretAccessKey: serverSecretKey,
    region: "us-east-1",
    params: {
        Bucket: 'ngs-configs'
    }
});


var timer;

function loadConfig() {
    return s3.getObject({
        Key: `${process.env.serverEnv}_server_config.json`
    }).promise().then(
        getRes => {
            const parsedVars = JSON.parse(getRes.Body.toString('utf-8'));

            Object.assign(global.process.env, parsedVars);

            clearTimeout(timer);
        },
        err => {
            console.log('Error loading process vars...',err);
        }
    );
}

module.exports = loadConfig;