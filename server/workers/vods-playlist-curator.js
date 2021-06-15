const { google } = require('googleapis');
const util = require('../utils');
const location = 'vod-playlist-curator.js';
const compute = google.compute('v1');

async function vodCurator() {


    const privKey = process.env.sheets_private_key.replace(/\\n/g, '\n');
    const client = new google.auth.JWT(
        process.env.client_email, null, privKey, ['https://www.googleapis.com/auth/youtube']
    );


    // const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/youtube/v3'] });

    // const project = await google.auth.getProjectId();

    // const res = await compute.zones.list({ project, auth });
    // console.log('res', res)



    // const client = new google.auth.JWT(
    //     process.env.client_email, null, privKey, ['https://www.googleapis.com/youtube/v3']
    // );

    // const oauth2client = new google.auth.OAuth2()

    return client.authorize((err, tokens) => {
        if (err) {
            util.errLogger(location, err, 'error setting up client');
            throw err;
        } else {
            util.errLogger(location, null, 'JWT authorized..');
            return gsRun(client, tokens);
        }
    });

}

async function gsRun(client, tokens) {

    // console.log(client);

    // console.log('tokens', tokens);

    const CHANNELID = 'UCOf6CO75ePUy5Q5lCthv2Jg';
    // google.options({ auth: client });
    // //{ version: 'v3', auth: client }
    const gsapi = google.youtube("v3");
    gsapi.playlists.list({
        part: 'snippet, contentDetails',
        channelId: CHANNELID,
        maxResults: 50,
        auth: client
    }).then(
        dat => {
            console.log('data', dat.data);
        },
        err => {
            console.log('err', err);
        }
    );

    gsapi.playlists.insert({
        part: 'snippet',
        resource: {
            'snippet': {
                'title': 'wraiths test list'
            }
        },
        auth: client
    }).then(
        cre => {
            console.log('created list', cre);
        },
        err => {
            console.log('create failed', err);
        }
    )




}

module.exports = vodCurator;