// This updates JSON files that we want cached in S3 for use by lambdas.

const axios = require('axios');
const AWS = require('aws-sdk');
const statsBucket = process.env.s3bucketStats;
const publicApiUrl = process.env.publicApiUrl;

const getS3 = () => {
    const accessKeyId = process.env.S3accessKeyId;
    const secretAccessKey = process.env.S3secretAccessKey;
    const region = process.env.S3region;

    // If we have credentials in the environment, use them.  If not, assume
    // we are either in lambda, or the developer has credentials setup.
    if (accessKeyId) {
        credentials = new AWS.Credentials({ accessKeyId, secretAccessKey });
        return new AWS.S3({ region, credentials });
    } else {
        return new AWS.S3();
    }
};

const getCurrentSeasonFromApi = async () => {
    const {
        data: {
            returnObject: { value },
        },
    } = await axios({
        method: 'get',
        url: `${publicApiUrl}/admin/getSeasonInfo`,
    });

    return value;
};

const getReportedMatchesFromApi = async currentSeason => {
    const {
        data: { returnObject: matches },
    } = await axios({
        method: 'post',
        url: `${publicApiUrl}/schedule/fetch/reported/matches`,
        data: { season: currentSeason },
    });

    return matches.filter(m => m.reported);
};

const getTeamsFromApi = async () => {
    const {
        data: { returnObject: teams },
    } = await axios({
        method: 'get',
        url: `${publicApiUrl}/team/get/registered`,
    });

    return teams;
};

const publishJsonToS3 = async (s3, jsonObject, key) => {
    const contents = JSON.stringify(jsonObject);

    await s3
        .upload({
            Bucket: statsBucket,
            Key: key,
            Body: contents,
        })
        .promise();

    console.log(`Uploaded ${contents.length} bytes of JSON to S3 as ${key}.`);
};

module.exports = async () => {
    const s3 = getS3();

    const currentSeason = await getCurrentSeasonFromApi();
    console.log(`Current season is ${currentSeason}.`);
    const matches = await getReportedMatchesFromApi(currentSeason);
    console.log(`Found ${matches.length} reported matches.`);
    const teams = await getTeamsFromApi();
    console.log(`Found ${teams.length} teams.`);

    await publishJsonToS3(s3, currentSeason, 'currentSeason.json');
    await publishJsonToS3(s3, matches, `${currentSeason}/matches.json`);
    await publishJsonToS3(s3, teams, `${currentSeason}/teams.json`);
};
