const {
  confirmCaptain
} = require("../methods/confirmCaptain");

const utils = require('../utils');
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
const logger = require('../subroutines/sys-logging-subs').logger;
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const TeamMethods = require('../methods/team/teamCommon');
const getRegisteredTeams = require('../methods/team/getRegistered');
const {
  commonResponseHandler,
  requireOneInput,
  returnInvalidInputsMessage
} = require('./../commonResponseHandler');

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

  TeamMethods.getTeamBy(req, res);

});


//get
// path: /team/get
// URI query param - team
// URI query param - ticker
// finds team of passed team name or ticker
// returns found team
router.get('/get/registered', (req, res) => {
  const path = '/team/get/registered';

  commonResponseHandler(req, res, [], [], async (req, res) => {
    const response = {};
    return getRegisteredTeams().then(
      foundTeam => {
        foundTeam = foundTeam ? foundTeam : {};
        foundTeam = utils.objectify(foundTeam);
        foundTeam = TeamMethods.removeDegenerateTeams(foundTeam);
        foundTeam = TeamMethods.removeRegistrationInfo(foundTeam);
        response.status = 200;
        response.message = utils.returnMessaging(req.originalUrl, 'Found team', false, foundTeam);
        return response;
      },
      err => {
        response.status = 500;
        response.message = utils.returnMessaging(req.originalUrl, "Error querying teams.", err)
        return response;
      }
    )
    // return Team.find({
    //     'questionnaire.registered': true
    // }).lean().then(
    //     (foundTeam) => {
    //         foundTeam = foundTeam ? foundTeam : {};
    //         foundTeam = utils.objectify(foundTeam);
    //         foundTeam = TeamMethods.removeDegenerateTeams(foundTeam);
    //         response.status = 200;
    //         response.message = utils.returnMessaging(req.originalUrl, 'Found team', false, foundTeam);
    //         return response;
    //     }, (err) => {
    //         response.status = 500;
    //         response.message = utils.returnMessaging(req.originalUrl, "Error querying teams.", err)
    //         return response;
    //     }
    // );
  });

});

//post
// path: /team/get
// URI query param - team
// finds team of passed team name
// returns found team
router.post('/fetch/teams', (req, res) => {
  const path = '/team/fetch/teams';

  const optionalParameters = [{
    name: 'teams',
    type: 'array'
  }, {
    name: 'teamIds',
    type: 'array'
  }, {
    name: 'teamTickers',
    type: 'array'
  }]

  commonResponseHandler(req, res, [], optionalParameters,
    async (req, res, requiredParameters, o) => {
      const response = {};
      let query = {};

      if (requireOneInput(o)) {
        if (o.teams.valid) {
          let searchArray = [];
          o.teams.value.forEach(element => {
            searchArray.push(element.toLowerCase());
          });
          query['teamName_lower'] = {
            $in: searchArray
          };
        } else if (o.teamIds.valid) {
          let searchArray = [];
          o.teamIds.value.forEach(element => {
            searchArray.push(element.toLowerCase());
          });
          query['_ids'] = {
            $in: searchArray
          };
        } else if (o.teamTickers.valid) {
          let searchArray = [];
          o.teamTickers.value.forEach(element => {
            searchArray.push(element.toLowerCase());
          });
          query['ticker_lower'] = {
            $in: searchArray
          };
        }
        return Team.find(query).lean().then(
          (foundTeams) => {
            foundTeams = foundTeams && foundTeams.length > 0 ? foundTeams : [];
            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found teams', false, foundTeams)
            return response;
          }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, "Error querying teams.", err);
            return response;
          }
        );
      } else {
        return returnInvalidInputsMessage(req, o);
      }
    })
});

// post
// path /team/delete
// accpets JSON body, must have teamName:""
// returns success or error http
router.post('/delete', passport.authenticate('jwt', {
  session: false
}), confirmCaptain, (req, res) => {
  const path = '/team/delete';

  const requiredParameters = [{
    name: 'teamName',
    type: 'string'
  }]

  commonResponseHandler(req, res, requiredParameters, [], async (req, res, requiredParameters) => {
    const response = {};

    var payloadTeamName = requiredParameters.teamName.value;
    payloadTeamName = payloadTeamName.toLowerCase();

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'delete team ';
    logObj.target = payloadTeamName;
    logObj.logLevel = 'STD';

    return Team.findOneAndDelete({
      teamName_lower: payloadTeamName
    }).then((deletedTeam) => {
      if (deletedTeam) {
        //TODO: handle any dangling invited users!
        UserSub.clearUsersTeam(deletedTeam.teamMembers);
        TeamSub.markTeamWithdrawnInMatches(deletedTeam.toObject());
        DivSub.updateTeamNameDivision(deletedTeam.teamName, deletedTeam.teamName + ' (withdrawn)');
        //TODO: division sub to handle removing team from the division
        response.status = 200;
        response.message = utils.returnMessaging(req.originalUrl, 'Team has been deleted', false, false, null, logObj)
        return response;
        // res.status(200).send();
      } else {
        logObj.logLevel = 'ERROR';
        logObj.error = 'Team was not found';
        response.status = 500;
        response.message = utils.returnMessaging(req.originalUrl, 'Team was not found for deletion', false, null, null, logObj);
        return response;
        // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Team was not found for deletion', false, null, null, logObj));
      }
    }, (err) => {
      response.status = 500;
      response.message = utils.returnMessaging(req.originalUrl, 'There was an error deleting the team', err, null, null, logObj)
      return response;
      // res.status(500).send(utils.returnMessaging(path, 'There was an error deleting the team', err, null, null, logObj));
    });
    return response;
  })


});

// post 
// path /team/create
// accepts json body of team
// returns success or error HTTP plus the json object of the created team
router.post('/create', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {
  const path = '/team/create';

  try {
    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let seasonNum = currentSeasonInfo.value;

    //log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'create team ';
    logObj.logLevel = 'STD';


    var callingUser = req.user;
    if (utils.returnBoolByPath(callingUser, 'teamName')) {
      logObj.logLevel = 'ERROR';
      logObj.error = 'User was member of team'
      res.status(400).send(utils.returnMessaging(req.originalUrl, 'This user all ready belongs to a team!', false, null, null, logObj));
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

      if (!utils.returnBoolByPath(recievedTeam, 'teamName')) {
        status = 400;
        message.nameError = "Null team name not allowed!";
      }

      if (recievedTeam.hasOwnProperty('_id')) {
        delete recievedTeam._id;
      }

      if (!utils.isNullorUndefined(status) && !utils.isNullorUndefined(message)) {
        //we were missing data so send an error back.
        logObj.logLevel = 'ERROR';
        logObj.error = 'Missing required data'
        res.status(status).send(utils.returnMessaging(req.originalUrl, message, false, null, null, logObj));
      } else {
        recievedTeam.teamName = recievedTeam.teamName.trim();
        let lowerName = recievedTeam.teamName.toLowerCase();
        Team.findOne({
          teamName_lower: lowerName
        }).then((found) => {
          if (found) {
            logObj.logLevel = "ERROR";
            logObj.error = 'Team name was taken'
            res.status(500).send(utils.returnMessaging(req.originalUrl, 'This team name all ready exists!', false, null, null, logObj));
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
              TeamSub.updateTeamMmrAsynch(newTeam.toObject());
              logObj.target = " " + newTeam.teamName;
              res.status(200).send(utils.returnMessaging(req.originalUrl, "Team created successfully", false, newTeam, null, logObj));
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
              res.status(500).send(utils.returnMessaging(req.originalUrl, "Error creating new team", err, null, null, logObj));
            });
          }
        }, (err) => {
          res.status(500).send(utils.returnMessaging(req.originalUrl, "We encountered an error saving the team!", err, null, null, logObj));
        });
      }
    }
  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error'))
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

  try {
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
        let pendingMembers = utils.returnByPath(foundTeam, 'pendingMembers')
        if (pendingMembers && cont) {
          pendingMembers.forEach(function (member) {
            if (member.displayName == payloadMemberToAdd) {
              cont = false;
              logObj.error = 'User was all ready pending team member';
              res.status(403).send(
                utils.returnMessaging(req.originalUrl, "User " + payloadMemberToAdd + " exists in pending members currently", false, null, null, logObj)
              );
            }
          });
        }
        let currentMembers = utils.returnByPath(foundTeam, 'teamMembers');
        if (currentMembers && cont) { //current members
          currentMembers.forEach(function (member) {
            if (member.displayName == payloadMemberToAdd) {
              cont = false;
              logObj.error = 'User was all ready team member';
              res.status(403).send(
                utils.returnMessaging(req.originalUrl, "User " + payloadMemberToAdd + " exists in members currently", false, null, null, logObj)
              );
            }
          });
        }
        if (cont) {
          User.findOne({
            displayName: payloadMemberToAdd
          }).then((foundUser) => {
            if (foundUser) {
              if (!utils.returnBoolByPath(foundTeam.toObject(), 'pendingMembers')) {
                foundTeam.pendingMembers = [];
              }
              let fuid = foundUser._id.toString();
              foundTeam.pendingMembers.push({
                "id": fuid,
                "displayName": foundUser.displayName
              });

              foundTeam.save().then((saveOK) => {
                UserSub.togglePendingTeam(foundUser.displayName);
                res.status(200).send(utils.returnMessaging(req.originalUrl, "User added to pending members", false, saveOK, null, logObj));
                QueueSub.addToPendingTeamMemberQueue(utils.returnIdString(foundTeam._id), foundTeam.teamName_lower, until.returnIdString(foundUser._id), foundUser.displayName);
              }, (teamSaveErr) => {
                logObj.logLevel = 'ERROR';
                res.status(500).send(
                  utils.returnMessaging(req.originalUrl, "error adding user to team", teamSaveErr, null, null, logObj)
                );
              });
            }
          }, (err) => {
            res.status(500).send(
              utils.returnMessaging(req.originalUrl, "error finding user", err, null, null, logObj)
            );
          })
        }

      } else {
        logObj.logLevel = 'ERROR';
        logObj.error = 'team was not found'
        res.status(500).send(
          utils.returnMessaging(req.originalUrl, "team was not found!", false, null, null, logObj)
        );
      }
    });
  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
  }

});


//post 
// path: /team/save
// accepts json body, must have JSON object of team and all properties being updated.
// returns http sucess or error, plus JSON object of updated team if success.
router.post('/save', passport.authenticate('jwt', {
  session: false
}), confirmCaptain, (req, res) => {
  const path = '/team/save';

  try {

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

        if (utils.returnBoolByPath(payload, 'lookingForMore')) {
          foundTeam.lookingForMore = payload.lookingForMore;
        }

        if (utils.returnBoolByPath(payload, 'availability')) {
          foundTeam.availability = {};
          foundTeam.availability = payload.availability;
        }

        if (utils.returnBoolByPath(payload, 'competitiveLevel')) {
          foundTeam.competitiveLevel = payload.competitiveLevel;
        }

        if (utils.returnBoolByPath(payload, 'descriptionOfTeam')) {
          foundTeam.descriptionOfTeam = payload.descriptionOfTeam;
        }

        if (utils.returnBoolByPath(payload, 'rolesNeeded')) {
          foundTeam.rolesNeeded = {};
          foundTeam.rolesNeeded = payload.rolesNeeded;
        }

        if (utils.returnBoolByPath(payload, 'timeZone')) {
          foundTeam.timeZone = payload.timeZone;
        }

        if (utils.returnBoolByPath(payload, 'twitch')) {
          foundTeam.twitch = payload.twitch;
        }
        if (utils.returnBoolByPath(payload, 'twitter')) {
          foundTeam.twitter = payload.twitter;
        }
        if (utils.returnBoolByPath(payload, 'youtube')) {
          foundTeam.youtube = payload.youtube;
        }

        if (utils.returnBoolByPath(payload, 'ticker')) {
          foundTeam.ticker = payload.ticker;
          foundTeam.ticker_lower = payload.ticker.toLowerCase();
        }

        if (utils.returnBoolByPath(payload, 'captain')) {
          //do stuff with this
          //send message back, we won't allow this to change here.
          captainRec = true;
        }

        if (utils.returnBoolByPath(payload, 'assistantCaptain')) {
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
            UserSub.setCaptain(ele);
          });
          foundTeam.markModified('assistantCaptain');
        }

        foundTeam.save().then((savedTeam) => {
          var message = "";
          if (captainRec) {
            message += "We do not allow captain to be changed here at this time please contact an admin! ";
          }
          message += "Team updated!";
          res.status(200).send(utils.returnMessaging(req.originalUrl, message, false, savedTeam, null, logObj));
        }, (err) => {
          res.status(400).send(utils.returnMessaging(req.originalUrl, 'Error saving team information', err, null, null, logObj));
        });
      } else {
        logObj.logLevel = 'ERROR';
        logObj.error = 'No team was found'
        res.status(400).send(utils.returnMessaging(req.originalUrl, "Team not found", false, null, null, logObj));
      }
    }, (err) => {
      res.status(400).send(utils.returnMessaging(req.originalUrl, 'Error finding team', err, null, null, logObj));
    })

  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'User Search Error', e));
  }

});

//
// function getIndiciesToRemove(membersArray, predicateMember) {
//   let indiciesToRemove = [];
//   if (Array.isArray(predicateMember)) {

//     for (var i = 0; i < membersArray.length; i++) {
//       if (predicateMember.indexOf(membersArray[i].displayName) > -1) {
//         indiciesToRemove.push(i);
//       }
//     }

//   } else {
//     for (var i = 0; i < membersArray.length; i++) {
//       if (predicateMember == membersArray[i].displayName) {
//         indiciesToRemove.push(i);
//       }
//     }
//   }
//   return indiciesToRemove;
// }
//

//post
// path: /team/removeMemver
// requires teamName, and string or array of strings of members to remove
// returns http success or error; json object of updated team if save was successful.
router.post('/removeMember', passport.authenticate('jwt', {
  session: false
}), confirmCanRemove, (req, res) => {

  try {

    const path = '/team/removeMember';

    const removeTeamMembers = require('../methods/team/removeMemebers').removeTeamMembers;

    var payloadTeamName = req.body.teamName;
    var payloadUser = req.body.remove;

    if (!Array.isArray(payloadUser) && typeof payloadUser !== 'string') {
      res.status(400).send(
        utils.returnMessaging(req.originalUrl, "User to remove must be string or array", payloadUser)
      );
    }

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'remove user from team ';
    logObj.target = payloadUser.toString() + ' ' + payloadTeamName;
    logObj.logLevel = 'STD';


    let lower = payloadTeamName.toLowerCase();

    removeTeamMembers(lower, payloadUser, true).then(
      success => {
        let message = 'Default success.';

        if (success.message) {
          message = success.message;
        }

        res.status(200).send(utils.returnMessaging(req.originalUrl, message, false, success.foundTeam, null, logObj));

      },
      fail => {
        if (fail.error) {
          logObj.error = fail.error;
        }
        if (fail.logLevel) {
          logObj.logLevel = fail.logLevel;
        }
        let message = 'Default error message';
        if (fail.message) {
          message = fail.message;
        }

        res.status(400).send(utils.returnMessaging(req.originalUrl, message, fail.error, null, null, logObj));
      }
    );

  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
  }

});

//post
// path: /team/uploadLogo
// requires teamName, and base64 encoded image
// returns http success or error; json object of updated team if save was successful.
router.post('/uploadLogo', passport.authenticate('jwt', {
  session: false
}), confirmCaptain, (req, res) => {

  try {
    //TODO - replace this with direct to s3 method?
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

    uploadTeamLogo(dataURI, teamName).then(rep => {
        res.status(200).send(utils.returnMessaging(req.originalUrl, "Image Uploaded.", false, rep.eo, null, logObj))
      },
      err => {
        res.status(500).send(utils.returnMessaging(req.originalUrl, "err.message", err, null, null, logObj))
      });
  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
  }

});

router.post('/reassignCaptain', passport.authenticate('jwt', {
  session: false
}), confirmCaptain, (req, res) => {
  const path = '/team/reassignCaptain';

  try {
    var newCapt = req.body.username;
    var team = req.body.teamName;

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'reassign team capt ';
    logObj.target = team + ': new capt: ' + newCapt + ' old capt: ' + req.user.displayName;
    logObj.logLevel = 'STD';

    const assignNewCaptain = require('../methods/team/assignCaptain').assignNewCaptain;

    assignNewCaptain(team, newCapt, req.user.displayName).then(
      success => {
        let message = 'Default success.';

        if (success.message) {
          message = success.message;
        }

        res.status(200).send(utils.returnMessaging(req.originalUrl, message, false, success.foundTeam, null, logObj));

      },
      fail => {
        if (fail.error) {
          logObj.error = fail.error;
        }
        if (fail.logLevel) {
          logObj.logLevel = fail.logLevel;
        }
        let message = 'Default error message';
        if (fail.message) {
          message = fail.message;
        }

        res.status(400).send(utils.returnMessaging(req.originalUrl, message, fail.error, null, null, logObj));
      }
    );
  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
  }

});

//needs to be move to its own API path
router.post('/get/sys/dat', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  let path = '/team/get/sys/dat'

  try {
    let request = req.body.data;
    sysModels.system.findOne({
      'dataName': request
    }).then(
      (found) => {
        if (found) {
          res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found sys data', false, found))
        } else {
          res.status(404).send(utils.returnMessaging(req.originalUrl, 'Sys data not found', false));
        }
      }, (err) => {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'error querying data', err));
      }
    )
  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
  }


});

//post route
//updates the team questionnaire related info
router.get('/questionnaire', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const path = '/team/questionnaire';

    let teamId = req.query.teamId;


    Team.findOne({
      _id: teamId
    }).then(foundTeam => {
      if (foundTeam) {
        var captainOrAdmin = false;
        var callingUser = req.user;
        let aCindex = -1;
        if (foundTeam.assistantCaptain) {
          aCindex = foundTeam.assistantCaptain.indexOf(callingUser.displayName);
        }
        if (foundTeam.captain == callingUser.displayName || aCindex > -1) {
          captainOrAdmin = true;
        }
        if (!captainOrAdmin) {
          captainOrAdmin = utils.returnBoolByPath(callingUser, 'adminLevel.TEAM');
        }
        if (captainOrAdmin) {
          foundTeam = utils.objectify(foundTeam);
          let questionnaire = foundTeam.questionnaire;
          res.status(200).send(utils.returnMessaging(req.originalUrl, 'team found', false, questionnaire, null));
        } else {
          res.status(403).send(utils.returnMessaging(path, "User not authorized for this info.", false, null, null));
        }

      } else {
        res.status(400).send(utils.returnMessaging(req.originalUrl, 'team not found', null, {}, null));
      }

    }, err => {
      res.status(500).send(utils.returnMessaging(req.originalUrl, 'error querying team', err, null, null));
    }).catch(e=>{
      res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
    });

});

//post route
//updates the team questionnaire related info
router.post('/questionnaire/save', passport.authenticate('jwt', {
  session: false
}), confirmCaptain, (req, res) => {
  const path = '/team/questionnaire/save';

  try {
    let payload = req.body.questionnaire;
    let teamName = req.body.teamName;
    teamName = teamName.toLowerCase();

    //construct log object
    let logObj = {};
    logObj.actor = req.user.displayName;
    logObj.action = 'saving team questionnaire ';
    logObj.target = teamName
    logObj.logLevel = 'STD';

    Team.findOne({
      teamName_lower: teamName
    }).then(foundTeam => {
      if (foundTeam) {
        foundTeam.questionnaire = {};
        foundTeam.questionnaire = payload;
        foundTeam.save().then(saved => {
          res.status(200).send(utils.returnMessaging(req.originalUrl, 'team saved', false, saved, null, logObj));
        }, err => {
          res.status(500).send(utils.returnMessaging(req.originalUrl, 'error saving team', err, null, null, logObj));
        });
      } else {
        res.status(400).send(utils.returnMessaging(req.originalUrl, 'team not found', null, foundTeam, null, logObj));
      }

    }, err => {
      res.status(500).send(utils.returnMessaging(req.originalUrl, 'error querying team', err, null, null, logObj));
    })
  } catch (e) {
    res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e));
  }

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
            utils.returnMessaging(req.originalUrl, "User not authorized remove.", false, null, null, logObj));
        }
      } else {
        logObj.logLevel = 'ERROR';
        logObj.error = 'there was a problem finding the team';
        res.status(400).send(utils.returnMessaging(req.originalUrl, "Team not found.", false, null, null, logObj));
      }
    }, (err) => {
      res.status(500).send(
        utils.returnMessaging(req.originalUrl, "Error finding team", err, null, null, logObj)
      );
    });
  } else {
    next();
  }

}

module.exports = router;