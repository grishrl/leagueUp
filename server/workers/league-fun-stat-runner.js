const StatsJobs = require('../cron-routines/stats-routines');

function leagueStatRunnerWorker() {
    StatsJobs.leagueStatRunner().then(
        sucuess => {
            console.log('fun stats calced')
        },
        err => {
            rconsole.log('fun stats failed calc')
        }
    );
}

module.exports = leagueStatRunnerWorker;