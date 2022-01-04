/**
 * Season Info Methods
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 */
const util = require('../utils');
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
            if(found.length>0){
                            found = found.sort((a, b) => {
                                let both = util.returnBoolByPath(a, 'data.value') && util.returnBoolByPath(a, 'data.value');
                                let aOnly = util.returnBoolByPath(a, 'data.value');
                                let bOnly = util.returnBoolByPath(b, 'data.value')
                                if (both) {
                                    if (a.data.value > b.data.value) {
                                        return -1;
                                    } else {
                                        return 1;
                                    }
                                } else if (aOnly) {
                                    return -1;
                                } else if (bOnly) {
                                    return 1;
                                } else {
                                    return 0;
                                }

                            });
            }else{
                found = [{}];
            }

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