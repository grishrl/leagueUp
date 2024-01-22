require('dotenv').config();
const kickOffStatsOfTheStormUpdate = require('./server/cron-routines/kickOffStatsOfTheStormUpdate');

// Make the AWS SDK stop whining about V2 going into maintenance mode soon.
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const run = async () => {
    await kickOffStatsOfTheStormUpdate(console.log);
};

run().then(() => console.log('Finished.'));
