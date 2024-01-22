const kickOffStatsOfTheStormUpdate = require('../cron-routines/kickOffStatsOfTheStormUpdate');

module.exports = () => {
    kickOffStatsOfTheStormUpdate(console.log).then(
        success => {
            console.log('Finished kicking off Stats of the Storm update.');
        },
        err => {
            console.log('Error kicking off Stats of the Storm update.', err);
        }
    );
};
