const Team = require('../../models/team-models');
const UserSub = require('../../subroutines/user-subs');
const TeamSub = require('../../subroutines/team-subs');

async function removeTeamMembers(lower, members, captRestrict) {
    if (Array.isArray(members) == false) {
        members = [members];
    }

    let returnObject = {};
    let awaitReturnObject = await Team.findOne({
        teamName_lower: lower
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
                // res.status(400).send(util.returnMessaging(path, "Can not remove team captain.", false, null, null, logObj));
            }

            for (var i = 0; i < foundTeam.teamMembers.length; i++) {
                if (members.indexOf(foundTeam.teamMembers[i].displayName) > -1) {
                    indiciesToRemove.push(i);
                }
            }

            if (indiciesToRemove.length == 0) {
                returnObject.level = 'ERROR';
                returnObject.error = 'User not found on team';
                throw returnObject;
                // res.status(400).send(
                //     util.returnMessaging(path, "User not found on team.", false, foundTeam, null, logObj)
                // );
            } else {

                indiciesToRemove.forEach(function(index) {
                    let userToRemove = foundTeam.teamMembers.splice(index, 1);
                    usersRemoved = usersRemoved.concat(userToRemove);
                    let assCapIndex = foundTeam.assistantCaptain.indexOf(userToRemove[0].displayName);
                    if (assCapIndex > -1) {
                        foundTeam.assistantCaptain.splice(assCapIndex, 1);
                    }
                });
                UserSub.clearUsersTeam(usersRemoved);
                return foundTeam.save().then((savedTeam) => {
                    if (savedTeam) {
                        TeamSub.updateTeamMmr(foundTeam);
                        returnObject.message = "Users removed from team";
                        returnObject.foundTeam = savedTeam;
                        return returnObject;
                        // res.status(200).send(
                        //     util.returnMessaging(path, "Users removed from team", false, savedTeam, null, logObj)
                        // );
                    } else {
                        returnObject.logLevel = 'ERROR';
                        returnObject.error = 'Error occured during save'
                        returnObject.message = 'users not removed from team';
                        throw returnObject;
                        // res.status(400).send(
                        //     util.returnMessaging(path, "users not removed from team", false, savedTeam, null, logObj));
                    }
                }, (err) => {
                    returnObject.logLevel = 'ERROR';
                    returnObject.message = 'Unable to save team';
                    returnObject.error = err;
                    throw err;
                    // res.status(400).send(util.returnMessaging(path, "Unable to save team", err, null, null, logObj));
                });
            }
        } else {
            //res.status(500).send(util.returnMessaging(path, 'Error saving user', err, null, null, logObj))
            returnObject.logLevel = 'ERROR';
            returnObject.message = 'User not found on team.';
            throw returnObject;
            // res.status(400).send(util.returnMessaging(path, "User not found on team.", false, null, null, logObj));
        }
    }, (err) => {
        returnObject.logLevel = 'ERROR';
        returnObject.message = 'Error finding team.';
        returnObject.error = err;
        throw returnObject;
        // res.status(400).send(util.returnMessaging(path, "Error finding team.", err));
    });
    return awaitReturnObject;
}

module.exports = { removeTeamMembers };