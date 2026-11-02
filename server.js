const { app } = require('./serverConf');


if (process.env.runNewRelic != 'false') {
    console.log('run');
    require('newrelic');
}

const express = require("express");
//host name and port
// const hostname = process.env.hostname;
// const port = process.env.PORT;

//load route files
const authRoutes = require('./server/routes/auth-routes');
const searchRoutes = require('./server/routes/search-routes');
const teamRoutes = require('./server/routes/team-routes');
const adminRoutes = require('./server/routes/admin-routes');
const adminTeam = require('./server/routes/admin-team');
const adminLogs = require('./server/routes/admin-logs');
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
const history = require('./server/routes/historical-routes');
const blog = require('./server/routes/blog-routes');
const mvp = require('./server/routes/mvp-routes');
const notes = require('./server/routes/notes-routes');
const playerrank = require('./server/routes/player-rank-routes');
const s3clientUploads = require('./server/routes/s3-client-direct-upload-routes');

//load mongoose and other utilities 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportSetup = require('./server/configs/passport-setup');
const path = require('path');

const ApiLogger = require('./server/methods/aws-s3/api-logger');


function startApp() {

    var serverLogger;
    // //bootstrap express server
    // const app = express();

    // //create server listening on port
    // let server = app.listen(port, hostname, () => {
    //     console.log(`Server ${hostname} running at on ${port}`);
    // });

    //configs...
    app.use(bodyParser.json({
        limit: '2.5mb',
        extended: true
    }));

    app.use(bodyParser.urlencoded({
        extended: false
    }));

    //connect to mongo db
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(process.env.mongoURI, {
        useNewUrlParser: true
    }, () => {
        console.log('connected to mongodb');
    });

    var forceSsl = function(req, res, next) {

        if (process.env.environment !== 'local') {

            if (req.headers['x-forwarded-proto'] !== 'https') {
                return res.redirect(['https://', req.get('Host'), req.url].join(''));
            }
            return next();

        } else {
            return next();
        }

    };


    app.use(forceSsl);

                    var susStrings = [];

                    if (
                        process.env.suspectStrings &&
                        process.env.suspectStrings.length > 0
                    ) {
                        susStrings = process.env.suspectStrings.split(',');
                    }

    let blacklist = [];

    if(process.env.ipBlacklist && process.env.ipBlacklist.length>0){
        blacklist = process.env.ipBlacklist.split(',');
    }

    app.use(function(req, res, next) {


        //going to start rejecting losers for their request content when I have determined that it is not something I want to deal with..
        const paramStr = JSON.stringify(req.params);
        const queryStr = JSON.stringify(req.query);
        const bodyStr = JSON.stringify(req.body);

        const requestContents = [paramStr, queryStr, bodyStr];
        const isSuspicious = requestContents.some(content =>
            susStrings.some(suspicious =>
                content.includes(suspicious)
            )
        );

        if (isSuspicious) {
            console.log(isSuspicious);
            return res
                .status(403)
                .send(
                    'Request blocked due to suspicious activity.'
                );
        }

        const xForwardedFor = req.headers['x-forwarded-for'];
        let clientIps = xForwardedFor
            ? xForwardedFor.split(',').map(ip => ip.trim())
            : [];

        // Remove the IPv6 prefix from each IP if present and check against the blacklist
        let sentToBlacklist = clientIps.some(ip => {
            if (ip.startsWith('::ffff:')) {
                ip = ip.substring(7);
            }
            return blacklist.includes(ip);
        });

        if (sentToBlacklist) {
            return res
                .status(403)
                .send(
                    'You have been denied access to NGS for suspected malicious behavior. If you feel this is in error, please contact support.'
                );
        }

        if (
            process.env.enableApiDeepLogger &&
            process.env.enableApiDeepLogger != 'false'
        ) {
            serverLogger.addToLog(req, sentToBlacklist);
        }
        
        res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
        res.header(
            'Access-Control-Allow-Methods',
            'GET,PUT,POST,DELETE,PATCH,OPTIONS'
        );
        res.header(
            'Access-Control-Allow-Headers',
            'Authorization, Origin, X-Requested-With, Content-Type, Accept'
        );
        next();
    });


    //setup Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user', profileRoutes);
    app.use('/api/team', teamRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/division', divisionRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/outreach', outreachRoutes);
    app.use('/api/admin', adminTeam);
    app.use('/api/admin', adminLogs);
    app.use('/api/admin', adminDivision);
    app.use('/api/admin', adminUser);
    app.use('/api/admin', adminMatch);
    app.use('/api/schedule', scheduleRoutes);
    app.use('/api/standings', standingRoutes);
    app.use('/api/messageCenter', messageRoutes);
    app.use('/api/request', requestRoutes);
    app.use('/api/utility', utilityRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/history', history);
    app.use('/api/blog', blog);
    app.use('/api/mvp', mvp);
    app.use('/api/admin', notes);
    app.use('/api/playerrank', playerrank);
    app.use('/api/s3', s3clientUploads);

    //this is a special route that can be used for seeding teams and users into a dev env when needed
    // const seeding = require('./server/routes/seeding-route');
    // app.use('/api/dev', seeding);

    //initialize passport
    app.use(passport.initialize());

    app.use('/', express.static(path.join(__dirname, './client/dist/client/')));

    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, './client/dist/client/index.html'));
    });

    if (process.env.enableApiDeepLogger && process.env.enableApiDeepLogger != 'false') {
        serverLogger = ApiLogger(app);
    }


}
startApp();