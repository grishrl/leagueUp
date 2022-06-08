const cluster = require('cluster');
const worker = require('./worker');
const loadConfig = require("./loadConfig");

var WORKERS = process.env.WEB_CONCURRENCY || 1;

// const s3 = new aws.S3({
//     accessKeyId: serverPublicKey,
//     secretAccessKey: serverSecretKey,
//     region: "us-east-1",
//     params: {
//         Bucket: 'ngs-configs'

//     }
// });


// var timer;
// function loadConfig(){
//        return s3.getObject({
//            Key: `${process.env.serverEnv}_server_config.json`
//        }).promise().then(
//            getRes => {

//                const parsedVars = JSON.parse(getRes.Body.toString('utf-8'));

//                Object.assign(global.process.env, parsedVars);

//                if (cluster.isMaster) {

//                    //testing with two clusters until proofed in heroku
//                    worker.init();

//                    for (var i = 0; i < WORKERS; i++) {
//                        console.log('forking cluster')
//                        cluster.fork();
//                    }

//                    cluster.on('exit', function (worker) {
//                        console.log('cleaning up fork');
//                        cluster.fork();
//                    })

//                } else {
//                    require('./server');
//                }

//                clearTimeout(timer);
//            },
//            err => {
//                console.log('Error loading process vars...');
//                timer = setTimeout(loadConfig(), 5000);
//            }
//        );
// }

loadConfig().then(
    function(){
                    if (cluster.isMaster) {

                        //testing with two clusters until proofed in heroku
                        worker.init();

                        for (var i = 0; i < WORKERS; i++) {
                            console.log('forking cluster')
                            cluster.fork();
                        }

                        cluster.on('exit', function (worker) {
                            console.log('cleaning up fork');
                            cluster.fork();
                        })

                    } else {
                        require('./server');
                    }
    }
);

 