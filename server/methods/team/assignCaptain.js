const Team = require('../../models/team-models');
const UserSub = require('../../subroutines/user-subs');
const util = require('../../utils');

async function assignNewCaptain(teamName, newCaptName, requestor) {

    let returnObject = {};

    let awaitReturnObject = await Team.findOne({
        teamName_lower: teamName
    }).then(
        (foundTeam) => {
            if (foundTeam) {
                if (requestor) {
                    if (foundTeam.assistantCaptain && foundTeam.assistantCaptain.indexOf(requestor) > -1) {
                        returnObject.logLevel = 'ERROR';
                        returnObject.error = 'Assistant Captain may not reassign Captain';
                        returnObject.message = 'Assistant Captain may not reassign captain; contact an admin';
                        throw returnObject;
                    }
                }
                let members = util.returnByPath(foundTeam.toObject(), 'teamMembers');
                let cont = false;
                if (members) {
                    members.forEach(element => {
                        if (element.displayName == newCaptName) {
                            cont = true;
                        }
                    });
                }
                if (cont) {
                    let oldCpt = foundTeam.captain;
                    foundTeam.captain = newCaptName;
                    let assCaptIndex = foundTeam.assistantCaptain.indexOf(newCaptName);
                    if (assCaptIndex > -1) {
                        foundTeam.assistantCaptain.splice(assCaptIndex, 1);
                    }
                    return foundTeam.save().then(
                        (savedTeam) => {
                            if (savedTeam) {
                                UserSub.removeCaptain(oldCpt);
                                UserSub.setCaptain(savedTeam.captain);
                                returnObject.foundTeam = savedTeam;
                                returnObject.message = 'Team captain changed';
                                return returnObject;
                            } else {
                                returnObject.logLevel = 'ERROR';
                                returnObject.error = 'Error occured in save';
                                returnObject.message = 'Team captain not changed';
                                throw returnObject;
                            }
                        }, (err) => {
                            returnObject.logLevel = 'ERROR';
                            returnObject.error = err;
                            returnObject.message = 'Error changing team captain';
                            throw returnObject;
                        });

                } else {
                    returnObject.logLevel = 'ERROR';
                    returnObject.error = 'Provided user was not a member of the team';
                    returnObject.message = 'Provided user was not a member of the team';
                    throw returnObject;
                }


            }
        }, (err) => {
            returnObject.logLevel = 'ERROR';
            returnObject.error = err;
            returnObject.message = 'Error finding team';
            throw returnObject;
        }
    );
    return awaitReturnObject;
}

module.exports = { assignNewCaptain };