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
//const keys = require('./server/configs/keys');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');


const hostname = '127.0.0.1';
const port = process.env.PORT;

const app = express();

app.use(bodyParser.json({
    limit: '2.5mb',
    extended: true
}));
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(cors({
//     credentials: true,
//     origin: ['http://localhost:80', 'https://localhost:443']
// }));

//initialize passport
app.use(passport.initialize());

//connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
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

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// const options = {
//     cert: fs.readFileSync(path.join('./server/ssl', 'server.crt')),
//     key: fs.readFileSync(path.join('./server/ssl', 'server.key'))
// }

// const httpsPort = process.env.PORT;

// https.createServer(options, app).listen(httpsPort, function() {
//     console.log('https running on ' + httpsPort);
// });

app.use('/', express.static(path.join(__dirname + '/../client/dist/client/')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../client/dist/client/index.html'));
});

// const sched = require('./subroutines/schedule-subs');
// sched.generateRoundRobinSchedule(6);