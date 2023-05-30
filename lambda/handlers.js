const generateStatsOfTheStorm = require('./lib/generateStatsOfTheStorm');

exports.generateStatsOfTheStorm = async function () {
    console.log('Starting.');
    await generateStatsOfTheStorm();
    console.log('Finished.');
};
