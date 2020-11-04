const cluster = require('cluster');

if (cluster.isMaster) {

    //testing with two clusters until proofed in heroku

    for (var i = 0; i < 2; i++) {
        console.log('starting worker proc')
        cluster.fork();
    }

    cluster.on('exit', function(worker) {
        console.log('cleaning up worker');
        cluster.fork();
    })

} else {
    require('./server');
}