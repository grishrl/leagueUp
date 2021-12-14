/**
 * Season Info Methods
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 */

const System = require("../models/system-models");

/**
 * @name getSeasonInfo
 * @function
 * @description returns the current season info or returns a specified seasons info
 * @param {number} [season] - season to return info for
 */
async function getSeasonInfo(season) {
    let query = {};
    if (season) {
        query.$and = [{
                'dataName': 'seasonInfo'
            },
            {
                'data.value': season
            }
        ];
    } else {
        query.dataName = 'seasonInfo';
    }
    let seasonInfoObj = await System.system.find(query).lean().then(
        found => {
            found = found.sort((a, b) => {
                if (a.data.value > b.data.value) {
                    return -1;
                } else {
                    return 1;
                }
            });
            return found[0].data;
        },
        err => {
            return null;
        }
    );
    return seasonInfoObj;
}

module.exports = {
    getSeasonInfo: getSeasonInfo
}