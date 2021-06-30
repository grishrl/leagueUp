const { google } = require('googleapis');
const util = require('../../utils');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment')

const location = 'sheets_write.js';


function writeSheet(reportToWrite) {
    const privKey = process.env.sheets_private_key.replace(/\\n/g, '\n');

    const client = new google.auth.JWT(
        process.env.client_email, null, privKey, ['https://www.googleapis.com/auth/spreadsheets']
    );

    return client.authorize((err, tokens) => {
        if (err) {
            util.errLogger(location, err, 'error setting up client');
            throw err;
        } else {
            util.errLogger(location, null, 'connected to g-sheet');
            return gsRun(client, reportToWrite);
        }
    });
}


async function gsRun(client, reportToWrite) {

    const gsapi = google.sheets({ version: 'v4', auth: client });

    const FULL_RANGE = 'A1:Z1000';
    const CASTER_TOTALS = 'CasterTotals'
    const TEAM_CAST_TOTALS = 'TeamCastTotals'
    const UNCASTED_TEAMS = 'UncastedTeams'
    const LOWEST_20 = 'lowest_20'
    const MISSED_LAST_WEEK = 'missed_last_week'

    const RANGES = [CASTER_TOTALS, TEAM_CAST_TOTALS, UNCASTED_TEAMS, LOWEST_20, MISSED_LAST_WEEK];

    const opts = {
        spreadsheetId: '1RXgNjCp30Oz0_A3w_m1_LbOXBQleIto_j1HbEd7_M3E',
        ranges: RANGES
    };

    let returned = await gsapi.spreadsheets.values.batchGet(opts);

    const sheets = returned.data.valueRanges;

    const dictionary = {
        CasterTotals: _.find(sheets, { range: `${CASTER_TOTALS}!${FULL_RANGE}` }),
        TeamCastTotals: _.find(sheets, { range: `${TEAM_CAST_TOTALS}!${FULL_RANGE}` }),
        UncastedTeams: _.find(sheets, { range: `${UNCASTED_TEAMS}!${FULL_RANGE}` }),
        lowest_20: _.find(sheets, { range: `${LOWEST_20}!${FULL_RANGE}` }),
        missed_last_week: _.find(sheets, { range: `${MISSED_LAST_WEEK}!${FULL_RANGE}` }),
    }

    var data = [];



    for (index in RANGES) {
        let range = RANGES[index];

        if (range in reportToWrite) {
            let values = [];

            var ct = reportToWrite[range];

            var headers = Object.keys(ct[0]);

            values.push(['Last Updated', Date.now()])
            values.push(headers);

            for (objind in ct) {
                let obj = ct[objind];
                let tempArray = [];
                headers.forEach(hind => {

                    var dat = obj[hind];
                    if (Array.isArray(dat)) {
                        dat = dat.join(',');
                    }

                    dat = dat ? dat : '';
                    tempArray.push(dat);
                });
                values.push(tempArray);
            }
            data.push({
                range: range,
                values: values
            });
        }
    }


    const body = {
        data: data,
        valueInputOption: 'USER_ENTERED'
    }

    const writeOpts = {
        spreadsheetId: '1RXgNjCp30Oz0_A3w_m1_LbOXBQleIto_j1HbEd7_M3E',
        resource: body
    }

    return gsapi.spreadsheets.values.batchUpdate(writeOpts).then(
        succ => {
            return true;
        },
        e => {
            throw e;
        }
    );

}

module.exports = {
    writeSheet: writeSheet
};