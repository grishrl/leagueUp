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
async function removeInvitedMembers(teamName, members) {
    if (Array.isArray(members) == false) {
        members = [members];
    }

    let returnObject = {};
    let awaitReturnObject = await Team.findOne({
        teamName_lower: teamName.toLowerCase()
    }).then((foundTeam) => {
        if (foundTeam) {
            returnObject.foundTeam = foundTeam;

            let indiciesToRemove = [];
            let usersRemoved = [];

            for (var i = 0; i < foundTeam.invitedUsers.length; i++) {
                if (members.indexOf(foundTeam.invitedUsers[i]) > -1) {
                    indiciesToRemove.push(i);
                }
            }

            if (indiciesToRemove.length == 0) {
                returnObject.level = 'ERROR';
                returnObject.error = 'User not found on team';
                throw returnObject;
            } else {

                indiciesToRemove.forEach(function(index) {
                    let userToRemove = foundTeam.invitedUsers.splice(index, 1);
                    usersRemoved = usersRemoved.concat(userToRemove);
                    let assCapIndex = foundTeam.assistantCaptain.indexOf(userToRemove[0].displayName);
                    if (assCapIndex > -1) {
                        foundTeam.assistantCaptain.splice(assCapIndex, 1);
                    }
                });
                UserSub.clearUsersTeam(usersRemoved);
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