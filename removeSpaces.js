const mongoose = require('mongoose')
const Team = require('./server/models/team-models');
// connect to mongo db
mongoose.connect(process.env.mongoURI, () => {
    console.log('connected to mongodb');
});

Team.find({}).then(
    found => {
        if (found.length > 0) {
            console.log("found " + found.length + " teams");
            for (var i = 0; i < found.length; i++) {
                let team = found[i];

                let preTrimmed = team.teamName.length;
                let trimmedName = team.teamName.trim();
                let postTrimmed = trimmedName.length;
                console.log('team ' + (i + 1) + ' preTrimmed: ' + preTrimmed + " postTrimmed: " +
                    postTrimmed)
                if (preTrimmed != postTrimmed) {

                    team.teamName = trimmedName;
                    team.teamName_lower = trimmedName.toLowerCase();

                    console.log(trimmedName + " team name modified");
                    team.markModified('teamName')
                    team.markModified('teamName_lower')
                    team.save().then(
                        saved => {

                        },
                        err => {
                            console.log(err);
                        }
                    )
                }
            }



        } else {
            console.log('routine finished no teams found');
            process.exit(1);
        }
    },
    err => {
        console.log(err);
    }
);