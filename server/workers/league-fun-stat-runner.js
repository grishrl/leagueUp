const StatsJobs = require('../cron-routines/stats-routines');

function leagueStatRunnerWorker() {
    StatsJobs.leagueStatRunner().then(
        sucuess => {
            console.log('fun stats calced');
        },
        err => {
            console.log('fun stats failed calc', err);
        }
    );
}

module.exports = leagueStatRunnerWorker;