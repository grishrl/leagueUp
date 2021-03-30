const Match = require('./server/models/match-model');
const mongoose = require('mongoose')
const _ = require('lodash');
const math = require('./server/summarizeData/math');
const util = require('./server/utils');

// connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});

async function resetMatches() {
    let count = 0;
    let matches = await Match.find({
        season: 11
    }).then(
        (found) => {
            return found;
        }
    );

    console.log('matches', matches.length);

    for (var i = 0; i < matches.length; i++) {
        let match = matches[i];
        match.postedToHP = false;

        const replays = match.toObject().replays;
        _.forEach(replays, (v, k) => {
            if (v.parsedUrl) {
                v.parsedUrl = '';
            }
        });

        match.replays = replays;
        match.markModified('replays');

        let done = await match.save().then(
            (saved) => {
                return true;
            }
        )

        if (done) {
            count++;
            console.log('Updated ', count, ' of ', matches.length);
        }
    }
    return true;
}

resetMatches().then(
    () => {
        process.exit();
    }
)