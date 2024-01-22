/*
Archival methods - these methods are used for arching divisions and teams for the season
reviewed: 10-2-2020
reviewer: wraith
*/
const Team = require('../models/team-models');
const User = require('../models/user-models');
const Replays = require('../models/replay-parsed-models');
const Division = require('../models/division-models');
const Archive = require('../models/system-models').archive;
const archiveTeamLogo = require('./teamLogoUpload').archiveTeamLogo;
const CustomError = require('./customError');
const _ = require('lodash');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const util = require('../utils');
const removeTeamsFromDivisions = require('../methods/division/removeTeamsFromDivision');
const s3Archive = require('./aws-s3/archive-s3-object');

const location = 'archivalMethod';

/**
 * @name archiveDivisions
 * @function
 * @description archives all divisions and teams in the divisions; updates the players season played info
 */
async function archiveDivisions() {

    let returnObject = {};

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

    util.errLogger(location, null, 'finding divisions for archival...');

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

    util.errLogger(location, null, 'found divisions ' + divisions.eo.length + ' for archival')

    let dbTeams = {};

    if (divisions.cont) {

        for (var i = 0; i < divisions.eo.length; i++) {

            let division = divisions.eo[i];
            util.errLogger(location, null, 'archiving division ' + division.displayName)
            let divArch = await new Archive({
                type: 'division',
                season: seasonNum,
                object: division.toObject(),
                timeStamp: Date.now()
            }).save();

            //hide the division
            division.public = false;
            division.save();

            let divTeams = division.teams;
            dbTeams = await Team.find({ teamName: { $in: divTeams } }).then(
                foundTeams => {
                    return { cont: true, eo: foundTeams };
                },
                err => {
                    return { cont: false, eo: null };
                }
            )

            if (dbTeams.cont) {
                util.errLogger(location, null, 'archiving teams... ')

                for (var j = 0; j < dbTeams.eo.length; j++) {
                    let team = dbTeams.eo[j];
                    util.errLogger(location, null, 'archiving ' + team.teamName)
                    let teamObject = team.toObject();
                    teamObject.teamId = team._id.toString();

                    let teamArch = await new Archive({
                        type: 'team',
                        season: seasonNum,
                        object: teamObject,
                        timeStamp: Date.now()
                    }).save();

                    if (team.logo) {
                        archiveTeamLogo(team.logo);
                    }

                    //reset the team registration
                    team.questionnaire = {};
                    team.markModified('questionnaire');
                    team.save().then();
                }
                removeTeamsFromDivisions(division.divisionConcat, '*');
            } else {
                //error handling
            }
        }

        let playerFinalized = await playerSeasonFinalize(suc => { return suc; });
        returnObject.finalizedUsers = playerFinalized;
        util.errLogger(location, null, 'finished up archiving...')

    } else {
        //error handling
    }
    returnObject.archivedDivisions = divisions.eo.length;
    returnObject.archivedTeams = dbTeams.eo.length;
    return returnObject;

};


/**
 * @name playerSeasonFinalize
 * @function
 * @description go through each player in league and if they have replays; archive them into an object noted by the season; 
 * if they have replays OR they were a member of a team when this is run, increment their season counter
 */
async function playerSeasonFinalize() {

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

    let userFinialize = await User.find().then(
        found => {
            let count = 0;
            found.forEach(player => {
                let save = false;
                
                //set player to not LFG
                if(player.lookingForGroup){
                    save = true;
                    player.lookingForGroup = false;
                }
                
                //archive the replays in the user object (this just moves them in the obj)
                if (player.replays && player.replays.length > 0) {
                    let tO = {
                        season: seasonNum,
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
                //increment the seasons played
                if (save) {
                    if (player.seasonsPlayed) {
                        player.seasonsPlayed += 1;
                    } else {
                        player.seasonsPlayed = 1;
                    }
                    count++
                    player.save();
                }
            });
            return count;
        },
        err => {
            util.errLogger(location, err, 'playerSeasonFinalize');
        }
    )
    return { message: `${userFinialize} Users season finalized` };
}

/**
 * @name archiveUser
 * @function
 * @description this could also be known as a delete user; it moves user from the users table into the archive table, 
 * this helps up keep track of any smurfs up to nefarious ends
 * @param {User} user user to be archived (deleted)
 * @param {string} actor caller
 */
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
                //remove socials and personal info before archiving
                if (removed.hasOwnProperty('discordTag')) {
                    delete removed.discordTag;
                }

                if (removed.hasOwnProperty('twitch')) {
                    delete removed.twitch;
                }

                if (removed.hasOwnProperty('twitter')) {
                    delete removed.twitter;
                }

                if (removed.hasOwnProperty('youtube')) {
                    delete removed.twitter;
                }

                if (removed.hasOwnProperty('casterName')) {
                    delete removed.twitter;
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
                    }
                );

                //TODO: need to remove any pending avatars here in case someone deletes their account....

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

/**
 * @name retrieveAndRemoveArchiveUser
 * @function
 * @description gets a user from archive and deletes the archive version
 * @param {Object} user 
 */
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

    let picked = await Archive.findOne(query).then(
        found => {
            return found;
        },
        err => {
            util.errLogger(location, err, 'retrieveAndRemoveArchiveUser')

            throw err;
        }
    );
    if (picked) {
        archivedUser = picked.toObject().object;
        picked.remove();
    }
    return archivedUser;
}


/**
 * @name getTeamFromArchiveByNameSeason
 * @function
 * @description retrivies a team object from archive provided the teamName and season number
 * @param {string} teamName 
 * @param {number} season 
 */
async function getTeamFromArchiveByNameSeason(teamName, season) {
    teamName = teamName.toLowerCase();
    let query = {
        $and: [{
                season: season
            },

            {
                type: 'team'
            },

            {
                'object.teamName_lower': teamName
            }
        ]
    };
    return Archive.findOne(
        query
    ).lean().then(found => {
            if (found) {
                return found.object;
            } else {
                return null;
            }
        },
        err => {
            throw err;
        });
}

/**
 * @name getTeamFromArchiveByIdSesaon
 * @function
 * @description retrivies a team object from archive provided the teamName and season number
 * @param {string} teamId 
 * @param {number} season 
 */
async function getTeamFromArchiveByIdSeason(teamId, season) {
    teamName = teamName.toLowerCase();
    let query = {
        $and: [{
                season: season
            },
            {
                type: 'team'
            },
            {
                'object._id': teamId
            }
        ]
    };
    return Archive.findOne(
        query
    ).lean().then(found => {
            if (found) {
                return found.object;
            } else {
                return null;
            }
        },
        err => {
            throw err;
        });
}

async function archiveFullyAssociatedReplays(limit) {

    if (!limit) {
        limit = 20;
    }

    let replayItems = await Replays.find({
        fullyAssociated: true,
        leagueStats: true,
        archiveId: { $exists: false }
    }).limit(limit);

    for (var i = 0; i < replayItems.length; i++) {

        let replayItem = replayItems[i];
        let replayObject = util.objectify(replayItem);
        let putResult;
        try {
            putResult = await s3Archive.s3archivePut(replayObject);
        } catch (e) {
            console.log(e);
        }

        if (putResult) {
            replayItem.match = {};
            replayItem.players = {};
            replayItem.archiveId = putResult;
            replayItem.save();
        }

    }

}

module.exports = {
    archiveDivisions: archiveDivisions,
    archiveUser: archiveUser,
    retrieveAndRemoveArchiveUser: retrieveAndRemoveArchiveUser,
    getTeamFromArchiveByNameSeason: getTeamFromArchiveByNameSeason,
    getTeamFromArchiveByIdSeason: getTeamFromArchiveByIdSeason
};