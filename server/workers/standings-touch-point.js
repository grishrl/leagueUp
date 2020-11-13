const standingsMethods = require('../methods/standings-methods');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const getPublicDivs = require('../methods/division/getPublicDivs');
const { DateTime } = require('luxon');
const System = require('../models/system-models').system;
const utils = require('../utils');
const logger = require('../subroutines/sys-logging-subs').logger;

async function createStandingsTouchPoint() {

    let currentDay = DateTime.local().weekdayLong;

    currentDay = currentDay.toLowerCase();

    calculateDay = process.env.touchPointCalculateDay.toLowerCase();

    if (currentDay == calculateDay) {

        const logObj = {};
        logObj.logLevel = 'STD';
        logObj.timeStamp = new Date().getTime();
        logObj.location = 'createStandingsTouchPoint'
        logObj.action = 'Calculating standings touch point data..'
        logObj.actor = 'SYSTEM/Worker';
        logger(logObj);


        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let season = currentSeasonInfo.value;

        let divisions = await getPublicDivs();

        for (let i = 0; i < divisions.length; i++) {
            let division = divisions[i];

            standingsMethods.calulateStandings(division.divisionConcat, season, false, true).then(
                standing => {
                    const query = {
                        dataName: division.divisionConcat,
                        season: season
                    }
                    const document = utils.JSONCopy(query);
                    document.data = standing;
                    System.findOneAndUpdate(
                        query, document, {
                            new: true,
                            upsert: true
                        }
                    ).then(
                        saved => {
                            const logObj = {};
                            logObj.logLevel = 'SYSTEM/Worker';
                            logObj.timeStamp = new Date().getTime();
                            logObj.location = 'createStandingsTouchPoint'
                            logObj.action = `Created new weekly standings for ${division.divisionConcat}`
                            logger(logObj);
                            utils.errLogger('createStandingsTouchPoint', null, 'weekly standings upserted');
                        },
                        err => {
                            const logObj = {};
                            logObj.logLevel = 'ERR:SYSTEM/Worker';
                            logObj.timeStamp = new Date().getTime();
                            logObj.location = 'createStandingsTouchPoint'
                            logObj.action = `Error creating new weekly standings for ${division.divisionConcat}`
                            logger(logObj);
                            utils.errLogger('createStandingsTouchPoint, last standing', err);
                        }
                    );
                },
                err => {
                    throw err;
                }
            )
        }

    } else {
        utils.errLogger('createStandingsTouchPoint', 'skipping leg day')
    }

}

module.exports = createStandingsTouchPoint;