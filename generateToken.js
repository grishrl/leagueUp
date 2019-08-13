const jwt = require('jsonwebtoken');
const System = require('./server/models/system-models');
const mongoose = require('mongoose')
const teamSubs = require('./server/subroutines/team-subs');
const Archive = require('./server/models/system-models').archive;

let tokenObject = {};
// set this ID to the _id that the API key will be tied to
tokenObject.id = "5c62f9d8a55a147ce08c9674";

//set this to false to create a std JWToken for API calls, or true for an API key :)
//to remind you; the api key will only work in instances that are set to validate it IE it will fail jwt because
//it isn't signed by a user; 
//
var api = false;
var token
if (api) {
    token = jwt.sign(tokenObject, process.env.apiKey);
} else {
    token = jwt.sign(tokenObject, process.env.jwtToken, {
        expiresIn: '7d'
    });
}



console.log('token ', token);

// connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});


// new System.system({
//     'dataName': 'apiKey',
//     'value': token
// }).save().then(
//     saved => {
//         console.log('saved ', ' token ', token);
//         process.exit(0);
//     },
//     err => {
//         console.log('not saved ', ' token ', token);
//         process.exit(0);
//     }
// );

let query = {


    type: 'team'

};

Archive.find(query).then(found => {
    let ind = 0;

    for (let x = 0; x < found.length; x++) {
        console.log('updating ', x + 1, ' of ', found.length);
        let obj = found[x];

        obj['object']['teamId'] = obj['object']['_id'].toString();

        obj.markModified('object');

        obj.save().then(
            saved => {
                console.log('saved ', x + 1, ' of ', found.length);
            }
        )

    }
})