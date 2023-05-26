const updateStatsOfTheStorm = require('../cron-routines/updateStatsOfTheStorm');

module.exports = () => {
    updateStatsOfTheStorm(console.log).then(
        success => {
            console.log('Finished updating Stats of the Storm database.');
        },
        err => {
            console.log('Error updating Stats of the Storm database', err);
        }
    );
};
