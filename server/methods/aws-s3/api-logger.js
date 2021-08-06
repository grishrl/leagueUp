const { getRoutes } = require('get-routes');
const s3put = require('./put-s3-file');

const APILogging = function(app, saveInterval) {

    const defaultLog = {
        summary: {},
        logList: []
    };

    // var born = Date.now();

    const APILogging = {};

    APILogging.routes = getRoutes(app);

    APILogging.log = JSON.parse(JSON.stringify(defaultLog));

    APILogging.addToLog = function(req) {
        if (req && this.checkLoggable(req.path, req.method.toLowerCase())) {
            this.tallyCalls(req);
            this.pushOnList(req);
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
            console.log('Logging to S3...');
            console.log(APILogging.log);
            APILogging.log = JSON.parse(JSON.stringify(defaultLog));
        },
        30000
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