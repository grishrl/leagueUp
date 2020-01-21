const { confirmCaptain } = require("../methods/confirmCaptain");

const util = require('../utils');
const router = require('express').Router();
const User = require("../models/user-models");
const Admin = require('../models/admin-models');
const QueueSub = require('../subroutines/queue-subs');
const TeamSub = require('../subroutines/team-subs');
const UserSub = require('../subroutines/user-subs');
const DivSub = require('../subroutines/division-subs');
const Team = require("../models/team-models");
const passport = require("passport");
const sysModels = require('../models/system-models');
const uploadTeamLogo = require('../methods/teamLogoUpload').uploadTeamLogo;
const Stats = require('../models/stats-model');
const logger = require('../subroutines/sys-logging-subs');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const TeamMethods = require('../methods/teamCommon');

/*
routes for team management --
GETS:
get - retrieves requested team

POSTS:
create - creates new team with calling user as captain
save - saves new team information
delete - deletes team
addMember - adds member
removeMember - removes member
uploadLogo - uploads logo 
reassignCaptian - moves captain to another team member
*/


//get
// path: /team/get
// URI query param - team
// URI query param - ticker
// finds team of passed team name or ticker
// returns found team
router.get('/get', (req, res) => {
    const path = '/team/get';
    var team = req.query.team;
    var ticker = req.query.ticker;
    var id = req.query.teamId;

    if (team) {
        team = decodeURIComponent(team);
        team = team.toLowerCase();
    }

    if (ticker) {
        ticker = ticker.toLowerCase();
    }

    if (id) {
        id = decodeURIComponent(id);
    }

    let query = {};
    if (id) {
        query = { "_id": id }
    } else if (team && ticker) {
        query['$and'] = [];
        query['$and'].push({ 'teamName_lower': team });
        query['$and'].push({ 'ticker': ticker });
    } else if (team && !ticker) {
        query['teamName_lower'] = team;
    } else {
        query['ticker_lower'] = ticker;
    }

    Team.findOne(query).lean().then(
        (foundTeam) => {
            if (foundTeam) {
                res.status(200).send(util.returnMessaging(path, 'Found team', false, foundTeam));
            } else {
                res.status(200).send(util.returnMessaging(path, "Team not found", false, {}));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error querying teams.", err));
        }
    );
});

//get
// path: /team/get
// URI query param - team
// URI query param - ticker
// finds team of passed team name or ticker
// returns found team
router.get('/get/registered', (req, res) => {
    const path = '/team/get/registered';

    Team.find({
        'questionnaire.registered': true
    }).lean().then(
        (foundTeam) => {
            if (foundTeam) {
                foundTeam = util.objectify(foundTeam);
                foundTeam = TeamMethods.removeDegenerateTeams(foundTeam);
                res.status(200).send(util.returnMessaging(path, 'Found team', false, foundTeam));
            } else {
                res.status(200).send(util.returnMessaging(path, "Team not found", false, {}));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error querying teams.", err));
        }
    );
});

//post
// path: /team/get
// URI query param - team
// finds team of passed team name
// returns found team
router.post('/getTeams', (req, res) => {
    const path = '/team/getTeams';
    var teams = req.body.teams;

    let searchArray = [];
    teams.forEach(element => {
        searchArray.push(element.toLowerCase());
    });
    Team.find({
        teamName_lower: { $in: searchArray }
    }).lean().then(
        (foundTeams) => {
            if (foundTeams && foundTeams.length > 0) {
                res.status(200).send(util.returnMessaging(path, 'Found team', false, foundTeams));
            } else {
                res.status(200).send(util.returnMessaging(path, "Team not found", false, foundTeams));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, "Error querying teams.", err));
        }
    );
});

// post
// path /team/delete
// accpets JSON body, must have teamName:""
// returns success or error http
router.post('/delete', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    const path = '/team/delete';
    var payloadTeamName = req.body.teamName;
    payloadTeamName = payloadTeamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'delete team ';
    logObj.target = payloadTeamName;
    logObj.logLevel = 'STD';

    Team.findOneAndDelete({
        teamName_lower: payloadTeamName
    }).then((deletedTeam) => {
        if (deletedTeam) {
            UserSub.clearUsersTeam(deletedTeam.teamMembers);
            TeamSub.updateTeamMatches(deletedTeam.toObject());
            DivSub.updateTeamNameDivision(deletedTeam.teamName, deletedTeam.teamName + ' (withdrawn)');
            //TODO: division sub to handle removing team from the division
            res.status(200).send(util.returnMessaging(path, 'Team has been deleted', false, false, null, logObj));
        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'Team was not found'
            res.status(500).send(util.returnMessaging(path, 'Team was not found for deletion', false, null, null, logObj));
        }
    }, (err) => {
        res.status(500).send(util.returnMessaging(path, 'There was an error deleting the team', err, null, null, logObj));
    });
});

// post 
// path /team/create
// accepts json body of team
// returns success or error HTTP plus the json object of the created team
router.post('/create', passport.authenticate('jwt', {
    session: false
}), async(req, res) => {
    const path = '/team/create';

    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'create team ';
    logObj.logLevel = 'STD';


    var callingUser = req.user;
    if (util.returnBoolByPath(callingUser, 'teamName')) {
        logObj.logLevel = 'ERROR';
        logObj.error = 'User was member of team'
        res.status(400).send(util.returnMessaging(path, 'This user all ready belongs to a team!', false, null, null, logObj));
    } else {
        var status;
        var message = {};
        var recievedTeam = req.body;

        recievedTeam.teamMembers = [];

        recievedTeam.captain = req.user.displayName;

        recievedTeam.teamMembers.push({
            _id: req.user._id,
            'displayName': req.user.displayName
        });

        if (!util.returnBoolByPath(recievedTeam, 'teamName')) {
            status = 400;
            message.nameError = "Null team name not allowed!";
        }

        if (recievedTeam.hasOwnProperty('_id')) {
            delete recievedTeam._id;
        }

        if (!util.isNullorUndefined(status) && !util.isNullorUndefined(message)) {
            //we were missing data so send an error back.
            logObj.logLevel = 'ERROR';
            logObj.error = 'Missing required data'
            res.status(status).send(util.returnMessaging(path, message, false, null, null, logObj));
        } else {
            recievedTeam.teamName = recievedTeam.teamName.trim();
            let lowerName = recievedTeam.teamName.toLowerCase();
            Team.findOne({
                teamName_lower: lowerName
            }).then((found) => {
                if (found) {
                    logObj.logLevel = "ERROR";
                    logObj.error = 'Team name was taken'
                    res.status(500).send(util.returnMessaging(path, 'This team name all ready exists!', false, null, null, logObj));
                } else {
                    recievedTeam.teamName_lower = recievedTeam.teamName.toLowerCase();
                    recievedTeam.history = [{
                        timestamp: Date.now(),
                        season: seasonNum,
                        action: 'Team Created',
                        target: recievedTeam.teamName
                    }];
                    new Team(
                        recievedTeam
                    ).save().then((newTeam) => {
                        TeamSub.updateTeamMmr(newTeam.toObject());
                        logObj.target = " " + newTeam.teamName;
                        res.status(200).send(util.returnMessaging(path, "Team created successfully", false, newTeam, null, logObj));
                        //this may need some refactoring if we add the ability for an admin to create a team!
                        User.findOne({
                            displayName: req.user.displayName
                        }).then((found) => {
                            if (found) {
                                found["teamId"] = newTeam._id,
                                    found["teamName"] = newTeam.teamName,
                                    found["isCaptain"] = true;
                                let userHistoryUpdate = {
                                    timestamp: Date.now(),
                                    season: seasonNum,
                                    action: 'Created Team',
                                    target: recievedTeam.teamName
                                }
                                if (found.history) {
                                    found.history.push(userHistoryUpdate);
                                } else {
                                    found.history = [{
                                        userHistoryUpdate
                                    }]
                                }
                                found.markModified('history');
                                found.save().then((save) => {
                                    if (save) {
                                        //log object
                                        let sysObj = {};
                                        sysObj.actor = 'SYSTEM';
                                        sysObj.action = 'user was update to cpt after creatign team ';
                                        sysObj.logLevel = 'STD';
                                        sysObj.location = path;
                                        sysObj.target = save.displayName;
                                        logger(sysObj);

                                    } else {
                                        let sysObj = {};
                                        sysObj.actor = 'SYSTEM';
                                        sysObj.action = 'user failed update to cpt after creatign team ';
                                        sysObj.logLevel = 'ERROR';
                                        sysObj.location = path;
                                        sysObj.target = found.displayName;
                                        sysObj.timeStamp = new Date().getTime();
                                        logger(sysObj);

                                    }
                                }, (err) => {
                                    let sysObj = {};
                                    sysObj.actor = 'SYSTEM';
                                    sysObj.action = 'user failed update to cpt after creatign team ';
                                    sysObj.logLevel = 'ERROR';
                                    sysObj.target = found.displayName;
                                    sysObj.error = err;
                                    sysObj.location = path;
                                    sysObj.timeStamp = new Date().getTime();
                                    logger(sysObj);
                                })
                            } else {
                                let sysObj = {};
                                sysObj.actor = 'SYSTEM';
                                sysObj.action = 'user failed update to cpt after creatign team ';
                                sysObj.logLevel = 'ERROR';
                                sysObj.target = found.displayName;
                                sysObj.error = 'mongo fialed to find user';
                                sysObj.location = path;
                                sysObj.timeStamp = new Date().getTime();
                                logger(sysObj);
                            }

                        }, (err) => {
                            //maybe add some error logging
                            let sysObj = {};
                            sysObj.actor = 'SYSTEM';
                            sysObj.action = 'user failed update to cpt after creatign team ';
                            sysObj.logLevel = 'ERROR';
                            sysObj.target = req.user.displayName;
                            sysObj.error = err;
                            sysObj.location = path;
                            sysObj.timeStamp = new Date().getTime();
                            logger(sysObj);
                        });
                    }, (err) => {
                        res.status(500).send(util.returnMessaging(path, "Error creating new team", err, null, null, logObj));
                    });
                }
            }, (err) => {
                res.status(500).send(util.returnMessaging(path, "We encountered an error saving the team!", err, null, null, logObj));
            });
        }
    }
});


// post
// path: /team/addMember
// accepts json body, must have teamName , plus string 'addMember' 
// this member needs to be all ready existing in the system
// returns http success or error plus json object of updated team
router.post('/addMember', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    const path = '/team/addMember';

    var payloadTeamName = req.body.teamName;
    var payloadMemberToAdd = req.body.addMember;
    payloadTeamName = payloadTeamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'invite member to team ';
    logObj.target = payloadTeamName + ' ' + payloadMemberToAdd;
    logObj.logLevel = 'STD';

    Team.findOne({
        teamName_lower: payloadTeamName
    }).then((foundTeam) => {
        if (foundTeam) {
            var cont = true;
            let pendingMembers = util.returnByPath(foundTeam, 'pendingMembers')
            if (pendingMembers && cont) {
                pendingMembers.forEach(function(member) {
                    if (member.displayName == payloadMemberToAdd) {
                        cont = false;
                        logObj.error = 'User was all ready pending team member';
                        res.status(403).send(
                            util.returnMessaging(path, "User " + payloadMemberToAdd + " exists in pending members currently", false, null, null, logObj)
                        );
                    }
                });
            }
            let currentMembers = util.returnByPath(foundTeam, 'teamMembers');
            if (currentMembers && cont) { //current members
                currentMembers.forEach(function(member) {
                    if (member.displayName == payloadMemberToAdd) {
                        cont = false;
                        logObj.error = 'User was all ready team member';
                        res.status(403).send(
                            util.returnMessaging(path, "User " + payloadMemberToAdd + " exists in members currently", false, null, null, logObj)
                        );
                    }
                });
            }
            if (cont) {
                User.findOne({
                    displayName: payloadMemberToAdd
                }).then((foundUser) => {
                    if (foundUser) {
                        if (!util.returnBoolByPath(foundTeam.toObject(), 'pendingMembers')) {
                            foundTeam.pendingMembers = [];
                        }

                        foundTeam.pendingMembers.push({
                            "displayName": foundUser.displayName
                        });

                        foundTeam.save().then((saveOK) => {
                            UserSub.togglePendingTeam(foundUser.displayName);
                            res.status(200).send(util.returnMessaging(path, "User added to pending members", false, saveOK, null, logObj));
                            QueueSub.addToPendingTeamMemberQueue(util.returnIdString(foundTeam._id), foundTeam.teamName_lower, until.returnIdString(foundUser._id), foundUser.displayName);
                        }, (teamSaveErr) => {
                            logObj.logLevel = 'ERROR';
                            res.status(500).send(
                                util.returnMessaging(path, "error adding user to team", teamSaveErr, null, null, logObj)
                            );
                        });
                    }
                }, (err) => {
                    res.status(500).send(
                        util.returnMessaging(path, "error finding user", err, null, null, logObj)
                    );
                })
            }

        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'team was not found'
            res.status(500).send(
                util.returnMessaging(path, "team was not found!", false, null, null, logObj)
            );
        }
    });

});


//post 
// path: /team/save
// accepts json body, must have JSON object of team and all properties being updated.
// returns http sucess or error, plus JSON object of updated team if success.
router.post('/save', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    const path = '/team/save';
    var payloadTeamName = req.body.teamName;
    var payload = req.body;
    payloadTeamName = payloadTeamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'updated team ';
    logObj.target = payloadTeamName;
    logObj.logLevel = 'STD';

    //team name was not modified; edit the properties we received.
    Team.findOne({
        teamName_lower: payloadTeamName
    }).then((foundTeam) => {
        if (foundTeam) {
            // this might be something to be changed later -
            var captainRec = false;
            // check the paylaod and update the found team if the foundTeam property if it existed on the payload

            if (util.returnBoolByPath(payload, 'lookingForMore')) {
                foundTeam.lookingForMore = payload.lookingForMore;
            }

            if (util.returnBoolByPath(payload, 'availability')) {
                foundTeam.availability = {};
                foundTeam.availability = payload.availability;
            }

            if (util.returnBoolByPath(payload, 'competitiveLevel')) {
                foundTeam.competitiveLevel = payload.competitiveLevel;
            }

            if (util.returnBoolByPath(payload, 'descriptionOfTeam')) {
                foundTeam.descriptionOfTeam = payload.descriptionOfTeam;
            }

            if (util.returnBoolByPath(payload, 'rolesNeeded')) {
                foundTeam.rolesNeeded = {};
                foundTeam.rolesNeeded = payload.rolesNeeded;
            }

            if (util.returnBoolByPath(payload, 'timeZone')) {
                foundTeam.timeZone = payload.timeZone;
            }

            if (util.returnBoolByPath(payload, 'twitch')) {
                foundTeam.twitch = payload.twitch;
            }
            if (util.returnBoolByPath(payload, 'twitter')) {
                foundTeam.twitter = payload.twitter;
            }
            if (util.returnBoolByPath(payload, 'youtube')) {
                foundTeam.youtube = payload.youtube;
            }

            if (util.returnBoolByPath(payload, 'ticker')) {
                foundTeam.ticker = payload.ticker;
                foundTeam.ticker_lower = payload.ticker.toLowerCase();
            }

            if (util.returnBoolByPath(payload, 'captain')) {
                //do stuff with this
                //send message back, we won't allow this to change here.
                captainRec = true;
            }

            if (util.returnBoolByPath(payload, 'assistantCaptain')) {
                //this will loop through any current assistant captains and toggle them out of captain status.
                let toggle = [];
                let tempAc;


                if (foundTeam.assistantCaptain) {
                    tempAc = foundTeam.assistantCaptain;
                    payload.assistantCaptain.forEach(player => {

                        if (tempAc.indexOf(player) > -1) {

                            //player from payload was all ready in the assistantCaptain list;
                        } else {

                            //new player;
                            tempAc.push(player);
                            toggle.push(player);
                        }
                    });
                    tempAc.forEach((player, delInd) => {
                        let index = payload.assistantCaptain.indexOf(player);

                        if (index == -1) {

                            //player was removed;
                            toggle.push(player);
                            tempAc.splice(delInd, 1);
                        }
                    });

                } else {
                    //new player
                    tempAc = [];
                    tempAc = payload.assistantCaptain;
                    toggle = payload.assistantCaptain;
                }
                foundTeam.assistantCaptain = tempAc;

                toggle.forEach(ele => {
                    UserSub.toggleCaptain(ele);
                })
                foundTeam.markModified('assistantCaptain');
            }

            foundTeam.save().then((savedTeam) => {
                var message = "";
                if (captainRec) {
                    message += "We do not allow captain to be changed here at this time please contact an admin! ";
                }
                message += "Team updated!";
                res.status(200).send(util.returnMessaging(path, message, false, savedTeam, null, logObj));
            }, (err) => {
                res.status(400).send(util.returnMessaging(path, 'Error saving team information', err, null, null, logObj));
            });
        } else {
            logObj.logLevel = 'ERROR';
            logObj.error = 'No team was found'
            res.status(400).send(util.returnMessaging(path, "Team not found", false, null, null, logObj));
        }
    }, (err) => {
        res.status(400).send(util.returnMessaging(path, 'Error finding team', err, null, null, logObj));
    })

});


//post
// path: /team/removeMemver
// requires teamName, and string or array of strings of members to remove
// returns http success or error; json object of updated team if save was successful.
router.post('/removeMember', passport.authenticate('jwt', {
    session: false
}), confirmCanRemove, (req, res) => {

    const path = '/team/removeMember';

    var payloadTeamName = req.body.teamName;
    var payloadUser = req.body.remove;

    if (!Array.isArray(payloadUser) && typeof payloadUser !== 'string') {
        res.status(400).send(
            util.returnMessaging(path, "User to remove must be string or array", payloadUser)
        );
    }

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'remove user from team ';
    logObj.target = payloadUser.toString() + ' ' + payloadTeamName;
    logObj.logLevel = 'STD';


    let lower = payloadTeamName.toLowerCase();
    Team.findOne({
        teamName_lower: lower
    }).then((foundTeam) => {
        if (foundTeam) {
            var indiciesToRemove = [];
            var usersRemoved = [];
            if (Array.isArray(payloadUser)) {
                if (payloadUser.indexOf(foundTeam.captain) > -1) {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Tried to remove captain';
                    res.status(400).send(util.returnMessaging(path, "Can not remove team captain.", false, null, null, logObj));
                }
                for (var i = 0; i < foundTeam.teamMembers.length; i++) {
                    if (payloadUser.indexOf(foundTeam.teamMembers[i].displayName) > -1) {
                        indiciesToRemove.push(i);
                    }
                }
            } else {
                if (payloadUser == foundTeam.captain) {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Tried to remove captain'
                    res.status(400).send(util.returnMessaging(path, "Can not remove team captain.", false, null, null, logObj));
                }
                for (var i = 0; i < foundTeam.teamMembers.length; i++) {
                    if (payloadUser == foundTeam.teamMembers[i].displayName) {
                        indiciesToRemove.push(i);
                    }
                }
            }
            if (indiciesToRemove.length == 0) {
                logObj.level = 'ERROR';
                logObj.error = 'User not found on team';
                res.status(400).send(
                    util.returnMessaging(path, "User not found on team.", false, foundTeam, null, logObj)
                );
            } else {
                indiciesToRemove.forEach(function(index) {
                    usersRemoved = usersRemoved.concat(foundTeam.teamMembers.splice(index, 1));
                });
                UserSub.clearUsersTeam(usersRemoved);
                foundTeam.save().then((savedTeam) => {
                    if (savedTeam) {
                        TeamSub.updateTeamMmr(foundTeam);
                        res.status(200).send(
                            util.returnMessaging(path, "Users removed from team", false, savedTeam, null, logObj)
                        );
                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Error occured during save'
                        res.status(400).send(
                            util.returnMessaging(path, "users not removed from team", false, savedTeam, null, logObj));
                    }
                }, (err) => {
                    res.status(400).send(util.returnMessaging(path, "Unable to save team", err, null, null, logObj));
                });
            }
        } else {
            //res.status(500).send(util.returnMessaging(path, 'Error saving user', err, null, null, logObj))
            res.status(400).send(util.returnMessaging(path, "User not found on team.", false, null, null, logObj));
        }
    }, (err) => {
        res.status(400).send(util.returnMessaging(path, "Error finding team.", err));
    });
});

//post
// path: /team/uploadLogo
// requires teamName, and base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/uploadLogo', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {

    const path = '/team/uploadLogo';
    let uploadedFileName = "";

    let teamName = req.body.teamName;
    let dataURI = req.body.logo;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'upload team logo ';
    logObj.target = teamName;
    logObj.logLevel = 'STD';

    uploadTeamLogo(path, dataURI, teamName).then(rep => {
            res.status(200).send(util.returnMessaging(path, "Image Uploaded.", false, rep.eo, null, logObj))
        },
        err => {
            res.status(500).send(util.returnMessaging(path, "err.message", err, null, null, logObj))
        });
});

router.post('/reassignCaptain', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    const path = '/team/reassignCaptain';
    var newCapt = req.body.username;
    var team = req.body.teamName;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'reassign team capt ';
    logObj.target = team + ': new capt: ' + newCapt + ' old capt: ' + req.user.displayName;
    logObj.logLevel = 'STD';

    Team.findOne({ teamName_lower: team }).then(
        (foundTeam) => {
            if (foundTeam) {
                if (foundTeam.assistantCaptain && foundTeam.assistantCaptain.indexOf(req.user.displayName) > -1) {
                    logObj.error = 'Assistant Captain may not reassign Captain';
                    res.status(500).send(util.returnMessaging(path, 'Assistant Captain may not reassign captain; contact an admin', false, null, null, logObj));
                } else {
                    let members = util.returnByPath(foundTeam.toObject(), 'teamMembers');
                    let cont = false;
                    if (members) {
                        members.forEach(element => {
                            if (element.displayName == newCapt) {
                                cont = true;
                            }
                        });
                    }
                    if (cont) {
                        let oldCpt = foundTeam.captain;
                        foundTeam.captain = newCapt;
                        foundTeam.save().then(
                            (savedTeam) => {
                                if (savedTeam) {
                                    UserSub.toggleCaptain(oldCpt);
                                    UserSub.toggleCaptain(savedTeam.captain);
                                    res.status(200).send(util.returnMessaging(path, 'Team captain changed', false, savedTeam, null, logObj));
                                } else {
                                    logObj.logLevel = 'ERROR';
                                    logObj.error = 'Error occured in save';
                                    res.status(500).send(util.returnMessaging(path, 'Team captain not changed', false, null, null, logObj));
                                }
                            }, (err) => {
                                res.status(500).send(util.returnMessaging(path, 'Error changing team captain', err, null, null, logObj));
                            });

                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Provided user was not a member of the team';
                        res.status(400).send(util.returnMessaging(path, 'Provided user was not a member of the team', false, null, null, logObj));
                    }
                }

            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error finding team', err, null, null, logObj));
        }
    )
});

//system
router.post('/get/sys/dat', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    let path = '/team/get/sys/dat'
    let request = req.body.data;
    sysModels.system.findOne({ 'dataName': request }).then(
        (found) => {
            if (found) {
                res.status(200).send(util.returnMessaging(path, 'Found sys data', false, found))
            } else {
                res.status(404).send(util.returnMessaging(path, 'Sys data not found', false));
            }
        }, (err) => {
            res.status(500).send(util.returnMessaging(path, 'error querying data', err));
        }
    )
});

//post route
//updates the team questionnaire related info
router.post('/questionnaire/save', passport.authenticate('jwt', {
    session: false
}), confirmCaptain, (req, res) => {
    const path = '/team/questionnaire/save';
    let payload = req.body.questionnaire;
    let teamName = req.body.teamName;
    teamName = teamName.toLowerCase();

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'saving team questionnaire ';
    logObj.target = teamName
    logObj.logLevel = 'STD';

    Team.findOne({ teamName_lower: teamName }).then(foundTeam => {
        if (foundTeam) {
            foundTeam.questionnaire = {};
            foundTeam.questionnaire = payload;
            foundTeam.save(saved => {
                res.status(200).send(util.returnMessaging(path, 'team saved', false, saved, null, logObj));
            }, err => {
                res.status(500).send(util.returnMessaging(path, 'error saving team', err, null, null, logObj));
            })
        } else {
            res.status(400).send(util.returnMessaging(path, 'team not found', null, foundTeam, null, logObj));
        }

    }, err => {
        res.status(500).send(util.returnMessaging(path, 'error querying team', err, null, null, logObj));
    })
});

router.get('/statistics', (req, res) => {

    const path = '/team/statistics';
    var id = decodeURIComponent(req.query.id);

    Team.findOne({
        teamName: id
    }).then(
        found => {
            if (found) {
                let id = found._id.toString();
                Stats.find({
                    associateId: id
                }).then(
                    foundStats => {
                        res.status(200).send(util.returnMessaging(path, 'Found stat', false, foundStats));
                    },
                    err => {
                        res.status(400).send(util.returnMessaging(path, 'Error finding stats.', err, null, null));
                    }
                )
            } else {
                res.status(400).send(util.returnMessaging(path, 'User ID not found.', false, null, null));
            }
        },
        err => {
            res.status(400).send(util.returnMessaging(path, 'Error finding user.', err, null, null));
        }
    )


});

//this confirms the calling user is the captain OR is themselves, for removing from team
//while a captain can not remove themselves a user can remove themsevles
function confirmCanRemove(req, res, next) {
    const path = 'canRemove';

    var callingUser = req.user;
    var payloadTeamName = req.body.teamName;
    var payloadUser = req.body.remove;

    let lower = payloadTeamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = ' validate caller ';
    logObj.logLevel = 'STD';
    logObj.target = payloadUser + ' : ' + payloadTeamName;

    if (req.body.remove) {
        Team.findOne({
            teamName_lower: lower
        }).then((foundTeam) => {
            if (foundTeam) {
                let acIndex = -1;
                if (foundTeam.assistantCaptain) {
                    acIndex = foundTeam.assistantCaptain.indexOf(req.user.displayName);
                }
                if (foundTeam.captain == callingUser.displayName || acIndex > -1) {
                    req.team = foundTeam;
                    next();
                } else if (callingUser.displayName == payloadUser || payloadUser.indexOf(callingUser.displayName) > -1) {
                    next();
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'user was not authorized for action';
                    res.status(403).send(
                        util.returnMessaging(path, "User not authorized remove.", false, null, null, logObj));
                }
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'there was a problem finding the team';
                res.status(400).send(util.returnMessaging(path, "Team not found.", false, null, null, logObj));
            }
        }, (err) => {
            res.status(500).send(
                util.returnMessaging(path, "Error finding team", err, null, null, logObj)
            );
        });
    } else {
        next();
    }

}

module.exports = router;