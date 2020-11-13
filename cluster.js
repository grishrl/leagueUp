const cluster = require('cluster');
const worker = require('./worker');

if (cluster.isMaster) {

    //testing with two clusters until proofed in heroku
    worker.init();

    for (var i = 0; i < 2; i++) {
        console.log('forking cluster')
        cluster.fork();
    }

    cluster.on('exit', function(worker) {
        console.log('cleaning up fork');
        cluster.fork();
    })

} else {
    require('./server');
}