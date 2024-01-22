/**
 * remove invited members - dry function to handle removing invited members from team objects
 * reviewed: 10-5-2020
 * reviewer: wraith
 */
const Team = require('../../models/team-models');
const UserSub = require('../../subroutines/user-subs');
const TeamSub = require('../../subroutines/team-subs');

/**
 * @name removeInvitedMembers
 * @function
 * @description removes provided members from teams invited users arrau
 * @param {string} teamName 
 * @param {Array.<string> | string} members 
 */
async function removeInvitedMembers(teamName, membersToRemove) {
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

            for (var i = 0; i < foundTeam.invitedUsers.length; i++) {
                membersToRemove.forEach(member => {
                    if (member == foundTeam.invitedUsers[i]) {
                        indiciesToRemove.push(i);
                    };
                })
            }

            if (indiciesToRemove.length == 0) {
                returnObject.level = 'ERROR';
                returnObject.error = 'User not found on team';
                throw returnObject;
            } else {

                let result = removeMultipleIndicies(foundTeam.invitedUsers, indiciesToRemove);
                UserSub.clearUsersTeam(result.removed, true);
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

module.exports = { removeInvitedMembers };

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