/**
 * Team - Remove members; 
 * Handles removing team members from team
 * reviewed: 10-5-2020
 * reviewer: wraith
 */
const Team = require('../../models/team-models');
const UserSub = require('../../subroutines/user-subs');
const TeamSub = require('../../subroutines/team-subs');

/**
 * @name removeTeamMembers
 * @function
 * @description removes the provided member or members from the provided team
 * @param {string} teamName team name
 * @param {Array.<string> | string} members member or list of members display name to remove
 * @param {boolean} captRestrict flag to enable or diable the removing a member if they are a captain
 */
async function removeTeamMembers(teamName, membersToRemove, captRestrict) {
    if (Array.isArray(membersToRemove) == false) {
        membersToRemove = [membersToRemove];
    }

    let returnObject = {};
    let awaitReturnObject = await Team.findOne({
        teamName_lower: teamName.toLowerCase()
    }).then((foundTeam) => {
        if (foundTeam) {
            returnObject.foundTeam = foundTeam;

            let indiciesToRemove = [];
            let usersRemoved = [];

            if (captRestrict && members.indexOf(foundTeam.captain) > -1) {
                returnObject.logLevel = 'ERROR';
                returnObject.error = 'Tried to remove captain';
                returnObject.message = 'Can not remove team captain.';
                throw returnObject;
            }

            for (var i = 0; i < foundTeam.teamMembers.length; i++) {
                if (membersToRemove.indexOf(foundTeam.teamMembers[i].displayName) > -1) {
                    indiciesToRemove.push(i);
                }
            }


            foundTeam.assistantCaptain.forEach(aC => {
                let acIndex = membersToRemove.indexOf(aC)
                if (acIndex > -1) {
                    foundTeam.assistantCaptain.splice(acIndex, 1);
                    foundTeam.markModified('assistantCaptain');
                }
            })

            if (indiciesToRemove.length == 0) {
                returnObject.level = 'ERROR';
                returnObject.error = 'User not found on team';
                throw returnObject;
            } else {

                let result = removeMultipleIndicies(foundTeam.teamMembers, indiciesToRemove);

                console.log('result.removed', result.removed);
                UserSub.clearUsersTeam(result.removed);
                foundTeam.teamMembers = result.modified;
                foundTeam.markModified('teamMembers');
                return foundTeam.save().then((savedTeam) => {
                    if (savedTeam) {
                        TeamSub.updateTeamMmrAsynch(foundTeam);
                        returnObject.message = "Users removed from team";
                        returnObject.foundTeam = savedTeam;
                        return returnObject;
                    } else {
                        returnObject.logLevel = 'ERROR';
                        returnObject.error = 'Error occured during save'
                        returnObject.message = 'users not removed from team';
                        throw returnObject;
                    }
                }, (err) => {
                    returnObject.logLevel = 'ERROR';
                    returnObject.message = 'Unable to save team';
                    returnObject.error = err;
                    throw err;
                });
            }
        } else {
            returnObject.logLevel = 'ERROR';
            returnObject.message = 'User not found on team.';
            throw returnObject;
        }
    }, (err) => {
        returnObject.logLevel = 'ERROR';
        returnObject.message = 'Error finding team.';
        returnObject.error = err;
        throw returnObject;
    });
    return awaitReturnObject;
}

module.exports = { removeTeamMembers };

function removeMultipleIndicies(arr, indices) {


    let modified = arr;
    let removed = [];

    for (var i = arr.length - 1; i > -1; i--) {
        if (indices.indexOf(i) > -1) {
            removed = removed.concat(modified.splice(i, 1));
        }
    }

    return { modified, removed };

}