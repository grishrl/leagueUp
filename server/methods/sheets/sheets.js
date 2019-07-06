const keys = require('./sheetKeys.json');
const {
    google
} = require('googleapis');

const client = new google.auth.JWT(
    keys.client_email, null, keys.private_key, ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize((err, tokens) => {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log('connected..');
        gsRun(client);

    }
});

async function gsRun(client) {
    const gsapi = google.sheets({ version: 'v4', auth: client });

    const opts = {
        spreadsheetId: '1BjRh6e5sUzIImocJNQAzj9zrS5MXnq6etqCVTYRZpqQ',
        range: 'Sheet1!A1:B10'
    };

    let returned = await gsapi.spreadsheets.values.get(opts);
    console.log(returned.data);
    let returnedData = returned.data.values;
    let newDataArray = returnedData.map((r) => {

        r.push('read');
        console.log('r ', r);
        return r;
    });

    console.log('newDataArray ', newDataArray);

    const updateOpts = {
        spreadsheetId: '1BjRh6e5sUzIImocJNQAzj9zrS5MXnq6etqCVTYRZpqQ',
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: newDataArray }
    };

    let update = await gsapi.spreadsheets.values.update(updateOpts);

    console.log(update);

}