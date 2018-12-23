//Load HTTP module
const express = require("express");
const passport = require('passport');
const authRoutes = require('./server/routes/auth-routes');
const searchRoutes = require('./server/routes/search-routes');
const teamRoutes = require('./server/routes/team-routes');
const adminRoutes = require('./server/routes/admin-routes');
const adminTeam = require('./server/routes/admin-team');
const adminUser = require('./server/routes/admin-user');
const adminDivision = require('./server/routes/admin-division');
const profileRoutes = require('./server/routes/profile-routes');
const divisionRoutes = require('./server/routes/division-routes');
const outreachRoutes = require('./server/routes/outreach-routes');
const scheduleRoutes = require('./server/routes/schedule-routes');
const path = require('path');
const passportSetup = require('./server/configs/passport-setup');
const mongoose = require('mongoose');
const https = require('https');
const http = require("http");
const keys = require('./server/configs/keys');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');


const hostname = '127.0.0.1';
const port = 3000;

const app = express();

const adminPort = 3444;
const admin = express();

admin.use(bodyParser.json({
    limit: '2.5mb',
    extended: true
}));
admin.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json({
    limit: '2.5mb',
    extended: true
}));
app.use(bodyParser.urlencoded({ extended: false }));

admin.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://localhost:3443']
}));
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://localhost:3443']
}));

//initialize passport
admin.use(passport.initialize());
app.use(passport.initialize());

//connect to mongo db
mongoose.connect(keys.mongodb.dbURI, () => {
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
app.use('/schedule', scheduleRoutes);



//listen for request on port 3000, and as a callback function have the port listened on logged
admin.listen(adminPort, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const options = {
    cert: fs.readFileSync(path.join('./server/ssl', 'server.crt')),
    key: fs.readFileSync(path.join('./server/ssl', 'server.key'))
}

const httpsPort = 3443;

https.createServer(options, admin).listen(adminPort, function() {
    console.log('https running on ' + adminPort);
});

https.createServer(options, app).listen(httpsPort, function() {
    console.log('https running on ' + httpsPort);
});

admin.use('/', express.static(path.join(__dirname + '/../../leagueUpAdmin/dist/')));
admin.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../../leagueUpAdmin/dist/index.html'));
});
app.use('/', express.static(path.join(__dirname + '/../client/dist/client/')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../client/dist/client/index.html'));
});

// const sched = require('./subroutines/schedule-subs');
// sched.generateRoundRobinSchedule(6);