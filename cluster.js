// var sticky = require('sticky-session');
// var app = require('express')();
// var worker = require('./worker');

const cluster = require('cluster');

if (cluster.isMaster) {

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

// // var server = require('http').createServer(app);

// //2 workers; 1 process ~ 256 mb ram with 512 available
// if (!sticky.listen(server, process.env.PORT, {
//         workers: 2
//     })) {
//     // Master code
//     server.once('listening', function() {
//         console.log('server started on port: ' + process.env.PORT);
//     });
// } else {

//     // Worker code
//     // worker(server, app);
// }