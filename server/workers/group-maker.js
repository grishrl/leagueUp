const groupMaker = require('../cron-routines/groupMaker');
const util = require('../utils');


function groupMakerWorker() {
    groupMaker.suggestUserToUser().then(
        res => {
            util.errLogger(path, err, 'free agents matched to free agents');
        },
        err => {
            util.errLogger(path, err, 'caught an error');
        }
    );

    groupMaker.suggestUserToTeam().then(
        res => {
            util.errLogger(path, err, 'free agents matched to team');
        },
        err => {
            util.errLogger(path, err, 'caught an error');
        }
    );
}

module.exports = groupMakerWorker;