//Load HTTP module
// const express = require("express");



// const io = require('socket.io');
// const http = require('http');



// const hostname = process.env.hostname;
// const port = process.env.PORT;

// const app = express();
const app = require('./serverConf')['app'];
const authRoutes = require('./server/routes/auth-routes');
const searchRoutes = require('./server/routes/search-routes');
const teamRoutes = require('./server/routes/team-routes');
const adminRoutes = require('./server/routes/admin-routes');
const adminTeam = require('./server/routes/admin-team');
const adminUser = require('./server/routes/admin-user');
const adminMatch = require('./server/routes/admin-match');
const adminDivision = require('./server/routes/admin-division');
const profileRoutes = require('./server/routes/profile-routes');
const divisionRoutes = require('./server/routes/division-routes');
const outreachRoutes = require('./server/routes/outreach-routes');
const scheduleRoutes = require('./server/routes/schedule-routes');
const standingRoutes = require('./server/routes/standing-routes');
const messageRoutes = require('./server/routes/message-routes');
const requestRoutes = require('./server/routes/request-routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportSetup = require('./server/configs/passport-setup');
const express = require("express");
const path = require('path');


app.use(bodyParser.json({
    limit: '2.5mb',
    extended: true
}));

app.use(bodyParser.urlencoded({ extended: false }));


// //initialize passport
// app.use(passport.initialize());

//connect to mongo db
mongoose.connect(process.env.mongoURI, { useNewUrlParser: true }, () => {
    console.log('connected to mongodb');
});

//setup Routes
app.use('/auth', authRoutes);
app.use('/user', profileRoutes);
app.use('/team', teamRoutes);
app.use('/admin', adminRoutes);
app.use('/division', divisionRoutes);
app.use('/search', searchRoutes);
app.use('/outreach', outreachRoutes);
app.use('/admin', adminTeam);
app.use('/admin', adminDivision);
app.use('/admin', adminUser);
app.use('/admin', adminMatch);
app.use('/schedule', scheduleRoutes);
app.use('/standings', standingRoutes);
app.use('/messageCenter', messageRoutes);
app.use('/request', requestRoutes);

// const seeding = require('./server/routes/seeding-route');
// app.use('/dev', seeding);

//initialize passport
app.use(passport.initialize());

app.use('/', express.static(path.join(__dirname, './client/dist/client/')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, './client/dist/client/index.html'));
});

//listen for request on port 3000, and as a callback function have the port listened on logged

// let server = app.listen(port, hostname, () => {
//     console.log(`Server ${hostname} running at on ${port}/`);
// });

// app.use('/', express.static(path.join(__dirname, './client/dist/client/')));

// app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, './client/dist/client/index.html'));
// });


// global.socketIo = io(server);
// socketIo.on('connection', client => {

//     client.on('storeClientInfo', function(data) {
//         let clientInfo = {};
//         clientInfo.userId = data.userId;
//         clientInfo.clientId = client.id;
//         clients.push(clientInfo);
//     });

// });

// setInterval(function() {
//     if (clients.length > 0 && clients[0].clientId) {
//         let namespace = null;
//         let ns = socketIo.of(namespace || "/");
//         let socket = ns.connected[clients[0].clientId] // assuming you have  id of the socket
//         if (socket) {
//             console.log("Socket Connected, sent through socket");
//             socket.emit("event", clients);
//         } else {
//             console.log("Socket not connected, sending through push notification");
//         }
//     }
// }, 5000);

// let teamsub = require('./server/subroutines/team-subs');
// teamsub.updateTeamMmr({ 'teamName_lower': 'wraithling test team' });