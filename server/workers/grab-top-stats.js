const getTopStats = require('../cron-routines/getTopStats');

function grabTopStatsWorker() {
    getTopStats().then(
        sucuess => {
            console.log('grabbed new top stats');
        },
        err => {
            console.log('error grabbing new top stats', err);
        }
    )
}

module.exports = grabTopStatsWorker;