//season 7 sheet: 1-dNFe8cJ7yZlb5aCDqKuKNlDNMll72RL3t_7rivVgk4
//season 8 sheet: 1-EYgbPXWCCFbgXv6S5lHLPBnPLHWyx7E4Qy7NNKR73w
const {
    google
} = require('googleapis');
const Match = require('../../models/match-model');
const logger = require('../../subroutines/sys-logging-subs');
const util = require('../../utils');

const location = 'sheets.js';
// const mongoose = require('mongoose');

// mongoose.connect(process.env.mongoURI, () => {
//     console.log('connected to mongodb');
// });


//const client = new google.auth.JWT(process.env.client_email, null, String(process.env.sheets_private_key), ['https://www.googleapis.com/auth/spreadsheets']);
function readInVods() {

    const privKey = process.env.sheets_private_key.replace(/\\n/g, '\n');

    const client = new google.auth.JWT(
        process.env.client_email, null, privKey, ['https://www.googleapis.com/auth/spreadsheets']
    );

    client.authorize((err, tokens) => {
        if (err) {
            util.errLogger(location, err, 'error setting up client');
            return;
        } else {
            util.errLogger(location, null, 'connected to g-sheet');
            gsRun(client);
        }
    });

}

// readInVods();



async function gsRun(client) {

    let returnStatus = true;

    let updateRequired = false;

    const gsapi = google.sheets({ version: 'v4', auth: client });
    //update this ID to the new sheet season over season!
    const opts = {
        spreadsheetId: process.env.caster_report_sheet_id,
        range: 'Form Responses 1!A2:Z100000'
    };

    let returned = await gsapi.spreadsheets.values.get(opts);

    let returnedData = returned.data.values;
    let x = 0;
    let newDataArray = returnedData.map((r) => {

        let obj = {
            timestamp: r[0],
            caster: r[1],
            additionalCasters: r[2],
            matchId: r[3],
            division: r[4],
            youtubeURL: r[5],
            vod1: r[6],
            vod2: r[7],

            issues: r[9],
            sysRead: r[10]
        }
        return obj;
    });

    for (var i = 0; i < newDataArray.length; i++) {
        let obj = newDataArray[i];
        if (obj.matchId && (obj.youtubeURL || obj.vod1 || obj.vod2) && readInRow(obj.sysRead)) {
            updateRequired = true;
            x += 1;

            let match = await Match.findOne({
                matchId: obj.matchId
            }).then(res => {
                return res;
            }, err => {
                return null;
            });

            if (match) {

                match.vodLinks = [];

                if (obj.youtubeURL) {
                    match.vodLinks.push(obj.youtubeURL);
                }
                if (obj.vod1) {
                    match.vodLinks.push(obj.vod1);
                }
                if (obj.vod2) {
                    match.vodLinks.push(obj.vod2);
                }

                match.markModified('vodLinks');

                let saveResult = await match.save().then(
                    saved => {
                        return saved;

                    },
                    err => {
                        return null;
                    }
                );

                if (saveResult) {
                    obj.sysRead = 'read';
                    let logObj = {};
                    logObj.actor = 'match-VOD-injestor';
                    logObj.action = 'update vod links';
                    logObj.target = saveResult.matchId;
                    logObj.logLevel = 'STD';
                    logObj.timeStamp = Date.now();
                    logger(logObj);
                }

            } else {
                //wrong match id
            }

            //update only if we read a row
            let objKeys = Object.keys(obj);

            objKeys.forEach((ele, ind) => {
                if (obj[ele]) {
                    returnedData[i][ind] = obj[ele];
                } else {
                    returnedData[i][ind] = '';
                }


            });

        } else {
            //nothing import was received here, move along
        }

    }



    //send a write to the sheet ONLY if we made read rows
    if (updateRequired) {
        //update this ID to the new sheet season over season!
        const updateOpts = {
            spreadsheetId: process.env.caster_report_sheet_id,
            range: 'Form Responses 1!A2:Z100000',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: returnedData
            }
        };

        let update = await gsapi.spreadsheets.values.update(updateOpts);
    }

    util.errLogger(location, null, `Read in VODs`);

    return returnStatus;

}

function readInRow(val) {
    if (val == undefined || val == null) {
        return true;
    } else {
        return !(val == 'read');
    }
}

module.exports = {
    readInVods: readInVods
};