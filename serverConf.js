//require express and socket io
const express = require("express");
const io = require('socket.io');

//host name and port
const hostname = process.env.hostname;
const port = process.env.PORT;

//bootstrap express server
const app = express();

//create server listening on port
let server = app.listen(port, hostname, () => {
    console.log(`Server ${hostname} running at on ${port}`);
});

//create socket server from express server
let socketIo = io(server);
socketIo.set('heartbeat timeout', 30);

//export these to be used in other configs; 1 for the routes for http and the other for socket.IO methods
module.exports = {
    app: app,
    socketIo: socketIo
};