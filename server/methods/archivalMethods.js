const Team = require('../models/team-models');
const User = require('../models/user-models');
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
        playerSeasonFinalize();
        console.log('finished up archiving...')

    } else {
        //error handling
    }

};

//go through each player and if they have replays; archive them into an object noted by the season;
//if they have replays OR they were a member of a team when this is run, increment their season counter
function playerSeasonFinalize() {
    User.find().then(
        found => {
            found.forEach(player => {
                let save = false;
                if (player.replays && player.replays.length > 0) {
                    let tO = {
                        season: process.env.season,
                        replays: player.replays
                    }
                    if (player.replayArchive) {
                        player.replayArchive.push(tO);
                    } else {
                        player.replayArchive = [tO];
                    }
                    player.replays = [];
                    player.markModified('replayArchive');
                    player.markModified('replays');
                    save = true;
                } else if (player.teamName) {
                    save = true;
                }
                if (save) {
                    if (player.seasonsPlayed) {
                        player.seasonsPlayed += 1;
                    } else {
                        player.seasonsPlayed = 1;
                    }
                    player.save();
                }
            });
        },
        err => {
            console.log(err);
        }
    )
}


module.exports = {
    archiveDivisions: archiveDivisions
};