const Team = require('../models/team-models');
const Division = require('../models/division-models');
const Archive = require('../models/system-models').archive;

async function archiveDivisions() {
    console.log('finding divisions for archival...')
    let divisions = await Division.find().then(
        foundDiv => {
            return { cont: true, eo: foundDiv };
        },
        err => {
            return {
                cont: false,
                eo: null
            };
        }
    );
    console.log('found divisions ' + divisions.eo.length + ' for archival');
    if (divisions.cont) {

        for (var i = 0; i < divisions.eo.length; i++) {

            let division = divisions.eo[i];
            console.log('archiving division ' + division.displayName);
            new Archive({
                type: 'division',
                season: process.env.season,
                object: division.toObject(),
                timeStamp: Date.now()
            }).save();
            let divTeams = division.teams;
            let dbTeams = await Team.find({ teamName: { $in: divTeams } }).then(
                foundTeams => {
                    return { cont: true, eo: foundTeams };
                },
                err => {
                    return { cont: false, eo: null };
                }
            )
            if (dbTeams.cont) {
                console.log('archiving teams... ')
                for (var j = 0; j < dbTeams.eo.length; j++) {
                    let team = dbTeams.eo[j];
                    console.log('archiving ' + team.teamName);
                    new Archive({
                        type: 'team',
                        season: process.env.season,
                        object: team.toObject(),
                        timeStamp: Date.now()
                    }).save();
                }
            } else {
                //error handling
            }
        }

        console.log('finished up archiving...')

    } else {
        //error handling
    }

};


module.exports = {
    archiveDivisions: archiveDivisions
};