const System = require('../models/system-models').system;
const logger = require('../subroutines/sys-logging-subs');
const hpAPI = require('../methods/heroesProfileAPI');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const utls = require('../utils');

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

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let season = currentSeasonInfo.value;

    //loop through the stats array to call each stat to update
    stats.forEach(stat => {
        promArr.push(
            hpAPI.highestStat(stat, season)
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
                let endIndex = stat.indexOf('&', fromIndex);
                stat = stat.substring(fromIndex + 1, endIndex);
                let query = {
                    '$and': [{
                            'dataName': 'TopStatList'
                        },
                        {
                            'span': season
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
                        "span": season,
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
                        utls.errLogger('getTopStats', err);
                    }
                )
            }

        }

    }
    return true;
}

module.exports = getTopStats;