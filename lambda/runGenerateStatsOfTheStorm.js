// Use this to run the code from the command line or in the debugger.

require('dotenv').config();

const generateStatsOfTheStorm = require('./lib/generateStatsOfTheStorm');

generateStatsOfTheStorm()
    .then(() => console.log('Finished.'))
    .catch(e => {
        console.log(e);
        console.log(`Failed.`);
    });
