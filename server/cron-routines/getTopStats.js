const System = require('../models/system-models').system;
const axios = require('axios');
const logger = require('../subroutines/sys-logging-subs');
// const mongoose = require('mongoose');

// mongoose.connect(process.env.mongoURI, () => {
//     console.log('connected to mongodb');
// });

const statusURL = 'https://heroesprofile.com/API/NGS/MostStat/?api_key=hc544!0&stat='
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
}
async function getTopHotsProfile(stat) {
    let returnUrl = 'null';
    try {
        returnUrl = await axios.get(statusURL + stat, config);
    } catch (error) {
        console.log(error);
    }

    return returnUrl;
}

const stats = [
    'kills'
];

getTopStats = async function() {

    //create an array to hold promises of returns from hp api
    let promArr = [];

    //loop through the stats array to call each stat to update
    stats.forEach(stat => {
        promArr.push(
            getTopHotsProfile(stat)
        );
    });
    //resolve each promise in the array
    let rtval = await Promise.all(promArr).then(
            resolved => {
                return resolved;
            },
            err => {
                return null;
            }
        )
        //loop through each returned promise and save the result
    if (rtval) {

        for (var i = 0; i < rtval.length; i++) {
            //check to make sure that data was returned from the call before continuing;
            if (rtval[i].data != undefined) {
                let stat = rtval[i].request.path;
                let fromIndex = stat.indexOf('stat=');
                stat = stat.substring(fromIndex, stat.length);
                fromIndex = stat.indexOf('=');
                stat = stat.substring(fromIndex + 1, stat.length);
                let query = {
                    '$and': [{
                            'dataName': 'TopStatList'
                        },
                        {
                            'stat': stat
                        }
                    ]
                };
                System.findOneAndUpdate(
                        query, {
                            "dataName": "TopStatList",
                            "stat": stat,
                            "data": rtval[i].data
                        }, {
                            new: true,
                            upsert: true
                        }
                    ).then(
                        saved => {
                            let logObj = {};
                            logObj.actor = 'getTopStatsCron';
                            logObj.action = 'updated stat';
                            logObj.target = 'top stats - ' + stat;
                            logObj.logLevel = 'STD';
                            logObj.timeStamp = Date.now();
                            logger(logObj);
                        },
                        err => {
                            console.log(err);
                        }
                    )
                    // new System({
                    //     "dataName": "TopStatList",
                    //     "stat": stat,
                    //     "data": rtval[i].data
                    // }).save().then(
                    //     saved => {
                    //         console.log(saved);
                    //         let logObj = {};
                    //         logObj.actor = 'getTopStatsCron';
                    //         logObj.action = 'updated stat';
                    //         logObj.target = 'top stats - ' + stat;
                    //         logObj.logLevel = 'STD';
                    //         logObj.timeStamp = Date.now();
                    //         logger(logObj);
                    //     },
                    //     err => {
                    //         console.log(err);
                    //     }
                    // )
            }

        }

    }
    return true;
}

module.exports = getTopStats;