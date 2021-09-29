/**
 * this does what it says; get's top stats ... from heroes profile and saves it into the system collection of NGS database,
 * this is wrapped in a utility API that is called by temporize on the server nightly to prevent the over burdening of the HeroesProfile APIs
 * 
 * reviewed:9-30-2020
 * reviewer: wraith
 * -some spacing to make it more readable
 *  
 */

const System = require('../models/system-models').system;
const logger = require('../subroutines/sys-logging-subs').logger;
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

/**
 * @name getTopStats
 * @function
 * @description get and save the top stats from hero profile...
 */
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
                            'data.span': season
                        },
                        {
                            'data.stat': stat
                        }
                    ]
                };

                const dataObj = {
                    span: season,
                    stat: stat,
                    list: rtval[i].data
                }

                System.findOneAndUpdate(
                    query, {
                        "dataName": "TopStatList",
                        "data": dataObj
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