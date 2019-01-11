const Teamjobs = require('./server/schedule-routines/update-team');

Teamjobs.updateTeamsNotTouched(5).then(reply => {
    console.log('finished up');
    process.exit();
}, err => {
    console.log(err);
    process.exit();
});