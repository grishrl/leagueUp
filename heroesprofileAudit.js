/*
{
  $and: [{
    season: 8
  }, {
    postedToHP: true
  }, {
    $or: [{
      forfeit: {
        $exists: false
      }
    }, {
      forfeit: false
    }]
  }]
}
*/

const mongoose = require('mongoose');
const Match = require('./server/models/match-model');
const _ = require('lodash');
const fs = require('fs');


// connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});


Match.find({
    $and: [{
        season: 8
    }, {
        postedToHP: true
    }, {
        $or: [{
            forfeit: {
                $exists: false
            }
        }, {
            forfeit: false
        }]
    }]
}).then(
    found => {

        let replayList = [];
        let greif = [];

        found.forEach(
            match => {
                match = match.toObject();
                let replayObj = match.replays;
                _.forEach(replayObj, (val, key) => {
                    if (key != '_id') {
                        if (val.parsedUrl) {
                            let indOfEq = val.parsedUrl.indexOf('=') + 1;
                            let id = val.parsedUrl.substring(indOfEq, val.parsedUrl.length);
                            replayList.push(id);
                        } else {
                            greif.push(match.matchId);
                        }
                    }
                });
            }
        );


        fs.writeFile('audit.json', JSON.stringify(replayList), (err) => {
            console.log(err);
        });
        fs.writeFile('grief.json', JSON.stringify(greif), (err) => {
            console.log(err);
        });


    }
)