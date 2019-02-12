const jwt = require('jsonwebtoken');
const System = require('./server/models/system-models');
const mongoose = require('mongoose')

let tokenObject = {};
tokenObject.id = "5c62f9d8a55a147ce08c9674";

var token = jwt.sign(tokenObject, process.env.jwtToken, {
    expiresIn: '7d'
});

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
    },
    err => {
        console.log('not saved ', ' token ', token);
    }
);