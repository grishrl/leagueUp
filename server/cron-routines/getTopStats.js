const System = require('../models/system-models').system;
const axios = require('axios');
const logger = require('../subroutines/sys-logging-subs');
// const mongoose = require('mongoose');

// mongoose.connect(process.env.mongoURI, () => {
//     console.log('connected to mongodb');
// });

//todo replace with hpAPI methods
const statusURL = 'https://heroesprofile.com/API/NGS/MostStat/?api_key=hc544!0&stat={stat}&season={season}'
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
}
async function getTopHotsProfile(stat, season) {
    let returnUrl = 'null';
    let callUrl = statusURL;
    season = season ? season : process.env.season;
    try {
        callUrl = callUrl.replace('{stat}', stat);
        callUrl = callUrl.replace('{season}', season);
        returnUrl = await axios.get(callUrl, config);
    } catch (error) {
        console.log(error);
    }

    return returnUrl;
}

const stats = [
    'kills',
    'assists',
    'takedowns',
    'deaths',
    'highest_kill_streak',
    'hero_damage',
    'siege_damage',
    'structure_damage',
    'minion_damage',
    'creep_damage',
    'summon_damage',
    'time_cc_enemy_heroes',
    'healing',
    'self_healing',
    'damage_taken',
    'experience_contribution',
    'town_kills',
    'time_spent_dead',
    'merc_camp_captures',
    'watch_tower_captures',
    'meta_experience',
    'protection_allies',
    'silencing_enemies',
    'rooting_enemies',
    'stunning_enemies',
    'clutch_heals',
    'escapes',
    'vengeance',
    'outnumbered_deaths',
    'teamfight_escapes',
    'teamfight_healing',
    'teamfight_damage_taken',
    'teamfight_hero_damage',
    'multikill',
    'physical_damage',
    'spell_damage'
];

getTopStats = async function() {

    //create an array to hold promises of returns from hp api
    let promArr = [];

    //loop through the stats array to call each stat to update
    stats.forEach(stat => {
        promArr.push(
            getTopHotsProfile(stat, process.env.season)
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
        // console.log(rtval);
        for (var i = 0; i < rtval.length; i++) {
            //check to make sure that data was returned from the call before continuing;
            if (rtval[i].data != undefined) {
                let stat = rtval[i].request.path;
                let fromIndex = stat.indexOf('stat=');
                stat = stat.substring(fromIndex, stat.length);
                fromIndex = stat.indexOf('=');
                let endIndex = stat.indexOf('&', fromIndex);
                stat = stat.substring(fromIndex + 1, endIndex);
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
            }

        }

    }
    return true;
}

module.exports = getTopStats;