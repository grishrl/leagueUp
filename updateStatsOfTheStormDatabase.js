require('dotenv').config();
const updateStatsOfTheStorm = require('./server/cron-routines/updateStatsOfTheStorm');

const run = async () => {
    await updateStatsOfTheStorm(console.log);
};

run().then(() => console.log('Finished.'));
