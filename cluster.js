var cluster = require('cluster'); // Only required if you want the worker id
var sticky = require('sticky-session');
var app = require('express')();
var worker = require('./worker');
console.log('>>>>', worker)

var server = require('http').createServer(app);

const port = 5000;


//2 workers; 1 process ~ 256 mb ram with 512 available
if (!sticky.listen(server, port, { workers: 2 })) {
    // Master code
    server.once('listening', function() {
        console.log('server started on ' + port + ' port');
    });
} else {
    // Worker code
    worker(server, app);
    console.log('worker')
}