const express = require("express");
// const path = require('path');
// const passportSetup = require('./server/configs/passport-setup');
const io = require('socket.io');
// const http = require('http');
// const passport = require('passport');

const hostname = process.env.hostname;
const port = process.env.PORT;

const app = express();

let server = app.listen(port, hostname, () => {
    console.log(`Server ${hostname} running at on ${port}`);
});


let socketIo = io(server);

module.exports = {
    app: app,
    socketIo: socketIo
};

//listen for request on port 3000, and as a callback function have the port listened on logged