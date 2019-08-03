const Team = require('../models/team-models');
const User = require('../models/user-models');
const Division = require('../models/division-models');
const Archive = require('../models/system-models').archive;
const archiveTeamLogo = require('./teamLogoUpload').archiveTeamLogo;
const CustomError = require('./customError');
const _ = require('lodash');

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
                    if (team.logo) {
                        archiveTeamLogo(team.logo).then(
                            succ => {
                                // console.log('image copied ', succ)
                            },
                            err => {
                                // console.log('image copy failed ', err)
                            }
                        )
                    }
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

//USER ARCHIVE METHODS:
//user shall be an object for querying user database
async function archiveUser(user, actor) {

    let success = null;
    let dbUser = await User.findOne(user).then(
        found => {
            return found
        },
        err => {
            let error = new CustomError('QueryError', 'Error querying!');
            throw error;
        }
    );
    if (dbUser) {
        if (dbUser.isCaptain) {
            //user was captain
            //throw error
            let error = new CustomError('CstErr', 'Can not delete captains!');
            throw error;
        } else {

            let removed = dbUser.remove().then(
                remove => {
                    return remove
                },
                err => {
                    let error = new CustomError('DeleteError', 'Error deleting!');
                    throw error;
                }
            )
            if (removed) {
                if (removed.hasOwnProperty('teamName')) {
                    let lower = removed.teamName.toLowerCase();
                    TeamSub.removeUser(lower, removed.displayName);
                }
                if (removed.hasOwnProperty('discordTag')) {
                    delete removed.discordTag;
                }
                let archived = await new Archive({
                    type: 'user',
                    object: dbUser.toObject(),
                    timeStamp: Date.now()
                }).save().then(
                    saved => {
                        return saved;
                    },
                    err => {
                        let logObj = {};
                        logObj.actor = actor;
                        logObj.action = ' create archived user ';
                        logObj.target = JSON.stringify(removed);
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Failed to create archive!'
                        logger(logObj);
                        // let error = new CustomError('ArchiveError', 'Error deleting user!');
                        // throw error;
                    }
                );
                if (archived) {
                    success = removed;
                }
            } else {
                //user was not found 
                //throw error
                let error = new CustomError('NotFound', 'User not found!');
                throw error;
            }

        }
    } else {
        //user was not found 
        //throw error
        let error = new CustomError('NotFound', 'User not found!');
        throw error;
    }

    return success;

}

async function retrieveAndRemoveArchiveUser(user) {
    let archivedUser = null;

    let query = {
        $and: []
    }
    query.$and.push({
        type: 'user'
    });

    _.forEach(user, (value, key) => {
        let str = 'object.' + key;
        let obj = {};
        obj[str] = value;
        query.$and.push(obj);
    });
    // let keys = Object.keys(user);
    // keys.forEach(key => {
    //     let str = 'object.' + key;
    //     let obj = {};
    //     obj[str] = user[key]
    //     query.$and.push(obj);
    // })

    let picked = await Archive.findOne(query).then(
        found => {
            return found;
        },
        err => {
            console.log(err);

            throw err;
        }
    );
    if (picked) {
        archivedUser = picked.toObject().object;
        picked.remove();
    }
    return archivedUser;
}



module.exports = {
    archiveDivisions: archiveDivisions,
    archiveUser: archiveUser,
    retrieveAndRemoveArchiveUser: retrieveAndRemoveArchiveUser
};