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
const utilityRoutes = require('./server/routes/utility-routes');
const eventRoutes = require('./server/routes/event-routes');
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
app.use('/utility', utilityRoutes);
app.use('/events', eventRoutes);

// const seeding = require('./server/routes/seeding-route');
// app.use('/dev', seeding);

//initialize passport
app.use(passport.initialize());

app.use('/', express.static(path.join(__dirname, './client/dist/client/')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, './client/dist/client/index.html'));
});