const { getRoutes } = require('get-routes');
const { s3putObject } = require('./put-s3-file');

const LOGSBUCKET = 'ngs-api-logs';

const LOGGINGINTERVAL = (1000 * 60) * (process.env.logInterval ? process.env.logInterval : 30);

const APILogging = function(app, saveInterval) {
    console.log('LOGGINGINTERVAL', LOGGINGINTERVAL)
    const defaultLog = {
        summary: {},
        logList: [],
        callerSummary: {}
    };

    var born = Date.now();

    const APILogging = {};

    APILogging.routes = getRoutes(app);

    APILogging.log = JSON.parse(JSON.stringify(defaultLog));

    APILogging.addToLog = function(req) {
        if (req && this.checkLoggable(req.path, req.method.toLowerCase())) {
            this.tallyCalls(req);
            this.pushOnList(req);
            this.sumCaller(req);
        }
    }

    APILogging.sumCaller = function(req) {
        let tallyPath = `${req.ip}::${req.method}::${req.path}`;
        // if(req.header.authorization){
        //     tallyPath+=`::${}`
        // }
        if (this.log.callerSummary.hasOwnProperty(tallyPath)) {
            this.log.callerSummary[tallyPath] += 1;
        } else {
            this.log.callerSummary[tallyPath] = 1;
        }
    }

    APILogging.checkLoggable = function(uri, method) {
        let uris = this.routes[method];
        return uris.indexOf(uri) > -1
    }

    APILogging.tallyCalls = function(req) {
        let tallyPath = `${req.method}::${req.path}`
        if (this.log.summary.hasOwnProperty(tallyPath)) {
            this.log.summary[tallyPath] += 1;
        } else {
            this.log.summary[tallyPath] = 1;
        }
    }

    APILogging.pushOnList = function(req) {
        this.log.logList.push({ timestamp: Date.now(), path: req.path, method: req.method, params: JSON.stringify(req.params), query: JSON.stringify(req.query), body: JSON.stringify(req.body), ip: req.ip });
    }

    setInterval(
        function() {
            try {
                var death = Date.now();
                APILogging.log.start = born;
                APILogging.log.end = death;
                APILogging.log.env = process.env.environment;
                s3putObject(LOGSBUCKET, null, `${Date.now()}-log.json`, JSON.stringify(APILogging.log)).then().finally(() => {
                    APILogging.log = JSON.parse(JSON.stringify(defaultLog));
                    born = death;
                });
            } catch (e) {
                console.log(e);
            }

        },
        LOGGINGINTERVAL
    );


    return APILogging;

}

module.exports = APILogging;

//loglist
/**
 * 
 *  {timestamp:'',path:'',method:'',params:'',body:'',query:'', ip:''}
 * 
 */