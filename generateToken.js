const jwt = require('jsonwebtoken');
const System = require('./server/models/system-models');
const mongoose = require('mongoose')

let tokenObject = {};
// set this ID to the _id that the API key will be tied to
tokenObject.id = "5c62f9d8a55a147ce08c9674";

//set this to false to create a std JWToken for API calls, or true for an API key :)
var api = true;

if (api) {
    var token = jwt.sign(tokenObject, process.env.apiKey);
} else {
    var token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '7d'
    });
}



console.log('token ', token);

//connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});

new System.system({
    'dataName': 'apiKey',
    'value': token
}).save().then(
    saved => {
        console.log('saved ', ' token ', token);
        process.exit(0);
    },
    err => {
        console.log('not saved ', ' token ', token);
        process.exit(0);
    }
);