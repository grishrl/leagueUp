const updateStatsOfTheStorm = require('../cron-routines/updateStatsOfTheStorm');
const logger = require('../subroutines/sys-logging-subs').logger;

module.exports = () => {
    updateStatsOfTheStorm(logger).then(
        success => {
            logger('Finished updating Stats of the Storm database.');
        },
        err => {
            console.log('Error updating Stats of the Storm database', err);
        }
    );
};
