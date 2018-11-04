//Load HTTP module
const express = require("express");
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const searchRoutes = require('./routes/search-routes');
const teamRoutes = require('./routes/team-routes');
const adminRoutes = require('./routes/admin-routes');
const profileRoutes = require('./routes/profile-routes');
const divisionRoutes = require('./routes/division-routes');
const outreachRoutes = require('./routes/outreach-routes');
const httpsRedirect = require('express-https-redirect');
const path = require('path');
const passportSetup = require('./configs/passport-setup');
const mongoose = require('mongoose');
const https = require('https');
const http = require("http");
const keys = require('./configs/keys');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');


const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json({
    limit: '2.5mb',
    extended: true
}));
app.use(bodyParser.urlencoded({ extended: false }));


app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://localhost:3443']
}));

//initialize passport
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


//listen for request on port 3000, and as a callback function have the port listened on logged
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const options = {
    cert: fs.readFileSync(path.join('ssl', 'server.crt')),
    key: fs.readFileSync(path.join('ssl', 'server.key'))
}

const httpsPort = 3443;

https.createServer(options, app).listen(httpsPort, function() {
    console.log('https running on 3443');
});

console.log('xxxxxx ', __dirname);

app.use('/', express.static(__dirname + '/../client/dist/client'));

app.get('*', function(req, res) {
    // let host = req.headers.host.replace(port, httpsPort);
    // res.redirect('https://' + host + req.url);
    res.sendFile(path.join(__dirname, '/../client/dist/client/index.html'));
});

// app.use('/admin/', express.static(__dirname + '/../client/'));

// app.get('/admin', function(req, res) {
//     res.sendFile(path.join(__dirname, '../../client/dist/client/index.html'));
// });