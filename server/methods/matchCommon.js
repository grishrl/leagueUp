/**
 * Common Match Related Methods
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 * 
 */

const challoneAPI = require('../methods/challongeAPI');
const Scheduling = require('../models/schedule-models');
const Archive = require('../models/system-models').archive;
const Match = require('../models/match-model');
const util = require('../utils');
const Team = require('../models/team-models');


/**
 * @name promoteTournamentMatch
 * @function
 * @description takes a tournmaent match and calls the challonge API to promote it along the branch path in challonge; also promotes each team in the NGS match object
 * @param {Match} foundMatch 
 */
async function promoteTournamentMatch(foundMatch) {
    //make sure the received is plain old object
    foundMatch = util.objectify(foundMatch);
    let winnerID;
    let loserID;
    //grab the winner score and their position from the match
    if (foundMatch.type == 'tournament') {
        let winner = {};
        let loser = {};
        if (foundMatch.home.score > foundMatch.away.score) {
            winner['id'] = foundMatch.home.id;
            winner['pos'] = 'home';
            winner['teamName'] = foundMatch.home.teamName;
            loser['id'] = foundMatch.away.id;
            loser['pos'] = 'away';
            loser['teamName'] = foundMatch.away.teamName;
        } else {
            winner['id'] = foundMatch.away.id;
            winner['pos'] = 'away';
            winner['teamName'] = foundMatch.away.teamName;
            loser['id'] = foundMatch.home.id;
            loser['pos'] = 'home';
            loser['teamName'] = foundMatch.home.teamName;
        }


        //grab the parent match of the passed match;
        let parentMatch = await Match.findOne({
            matchId: foundMatch.parentId
        }).then(found => {
            if (found) {
                return found;
            } else {
                return null;
            }
        }, err => {
            return null;
        });

        let lossPathMatch
        if (util.returnBoolByPath(foundMatch, 'loserPath')) {
            lossPathMatch = await Match.findOne({
                matchId: foundMatch.loserPath
            }).then(found => {
                if (found) {
                    return found;
                } else {
                    return null;
                }
            }, err => {
                return null;
            });
        }

        //make sure we have a parent match before we continue;
        if (parentMatch) {

            let parentMatchObj = parentMatch.toObject();
            //get the parent match's information from challonge;
            let parentChallongeMatch = await challoneAPI.matchGet(parentMatchObj.challonge_tournament_ref, parentMatchObj.challonge_match_ref).then(
                res => {
                    return res;
                },
                err => {
                    return null;
                }
            )

            if (parentChallongeMatch) {
                //get the all the references from the schedule; and lets get the winner's partipants reference.
                let winnerRef = await Scheduling.findOne({
                    challonge_ref: parseInt(parentMatchObj.challonge_tournament_ref)
                }).lean().then(found => {
                    return found;
                }, err => {
                    return null;
                });
                if (winnerRef) {
                    //loop through the references
                    winnerRef.participantsRef.forEach(
                        reference => {
                            if (reference.id == winner.id) {
                                winnerID = reference.challonge_ref;
                            }
                        }
                    );

                    //match up the challonge parent match ID with the winner match
                    //this will allow us to have proper teams always promoted into a matching position to challonge
                    if (parentChallongeMatch.match.player1_prereq_match_id == foundMatch.challonge_match_ref) {
                        parentMatch.home = winner;
                        parentMatch.markModified('home');
                    } else {
                        parentMatch.away = winner;
                        parentMatch.markModified('away');
                    }

                    parentMatch.save().then(saved => {}, err => {});

                }

            }

        } else {
            console.log('the parent match was not found');
        }

        //make sure we have a parent match before we continue;
        if (lossPathMatch) {

            let lossPathMatchObj = lossPathMatch.toObject();
            //get the parent match's information from challonge;
            let parentChallongeMatch = await challoneAPI.matchGet(lossPathMatchObj.challonge_tournament_ref, lossPathMatchObj.challonge_match_ref).then(
                res => {
                    return res;
                },
                err => {
                    return null;
                }
            )

            if (parentChallongeMatch) {
                //get the all the references from the schedule; and lets get the winner's partipants reference.
                let loserRef = await Scheduling.findOne({
                    challonge_ref: parseInt(lossPathMatchObj.challonge_tournament_ref)
                }).lean().then(found => {
                    return found;
                }, err => {
                    return null;
                });
                if (loserRef) {
                    //loop through the references
                    loserRef.participantsRef.forEach(
                        reference => {
                            if (reference.id == winner.id) {
                                loserID = reference.challonge_ref;
                            }
                        }
                    );

                    //match up the challonge parent match ID with the winner match
                    //this will allow us to have proper teams always promoted into a matching position to challonge
                    if (parentChallongeMatch.match.player1_prereq_match_id == foundMatch.challonge_match_ref) {
                        lossPathMatch.home = loser;
                        lossPathMatch.markModified('home');
                    } else {
                        lossPathMatch.away = loser;
                        lossPathMatch.markModified('away');
                    }

                    lossPathMatch.save().then(saved => {}, err => {});

                }

            }

        } else {
            console.log('the loss path match was not found');
        }

        //hope reporting winner only does the trick
        reportToChallonge(foundMatch, winner, winnerID).then(returned => {})

    }
}

/**
 * @name
 * @function
 * @description 
 * @param {Match} match - NGS match object to be reported
 * @param {Object} winner - object for tracking winners position, id, teamname
 * @param {string} winner.id - database id
 * @param {string} winner.pos - position in the match (home/away)
 * @param {string} winner.teamName - teamname
 * @param {*} winnerID - challonge participant reference
 */
async function reportToChallonge(match, winner, winnerID) {
    let returnVal = null;

    let challongeMatch = await challoneAPI.matchGet(match.challonge_tournament_ref, match.challonge_match_ref).then(
        res => {
            return res;
        },
        err => {
            return null;
        }
    )
    let scores;
    if (challongeMatch) {

        if (winnerID == challongeMatch.match.player1_id) {
            if (winner.pos == 'home') {
                scores = match.home.score + "-" + match.away.score
            } else {
                scores = match.away.score + "-" + match.home.score;
            }
        } else {
            if (winner.pos == 'away') {
                scores = match.home.score + "-" + match.away.score;
            } else {
                scores = match.away.score + "-" + match.home.score;
            }
        }
    }

    if (winnerID) {
        let challongeRes = await challoneAPI.matchUpdate(match.challonge_tournament_ref, match.challonge_match_ref, scores, winnerID).then(
            res => {
                return true;
            },
            err => {
                return false;
            }
        )
    }

    if (!match.parentId) {
        let finalize = await challoneAPI.finalizeTournament(match.challonge_tournament_ref).then(
            res => {
                return true;
            },
            err => {
                return false;
            }
        )

        if (finalize) {
            let tournamentRef = await Scheduling.findOne({
                challonge_ref: parseInt(match.challonge_tournament_ref)
            }).then(found => {
                return found;
            }, err => {
                return null;
            });
            if (tournamentRef) {
                tournamentRef['active'] = false;
                tournamentRef.save();
            }
        }
    }
    // }
    return returnVal;
}

/**
 * @name findTeamIds
 * @function
 * @description Takes a list of matches and returns the ids of all teams participating in the list
 * @param {Array.<Match> | Match} matchesArray - list of matches to get the team ids from
 */
function findTeamIds(matchesArray) {
    let teams = [];

    //type checking make sure we have array
    if (!Array.isArray(matchesArray)) {
        matchesArray = [matchesArray];
    }

    matchesArray.forEach(match => {
        if (util.returnBoolByPath(match, 'home.id')) {
            if (match.home.id != 'null' && teams.indexOf(match.home.id.toString()) == -1) {
                teams.push(match.home.id.toString());
            }
        }
        if (util.returnBoolByPath(match, 'away.id')) {
            if (match.away.id != 'null' && teams.indexOf(match.away.id.toString()) == -1) {
                teams.push(match.away.id.toString());
            }
        }
    });
    return teams;
}

/**
 * @name addTeamInfoToMatch
 * @function
 * @description - adds the teams info into all the matches provided in the list
 * @param {Array.<Match>} matchesArray - list of matches to add team info to
 */
async function addTeamInfoToMatch(matchesArray) {
    //typechecking
    if (!Array.isArray(matchesArray)) {
        matchesArray = [matchesArray];
    }

    let teams = findTeamIds(matchesArray);

    return Team.find({
        _id: {
            $in: teams
        }
    }).then((matchesArrayTeams) => {
        if (matchesArrayTeams) {

            matchesArrayTeams.forEach(team => {
                let teamid = team._id.toString();
                matchesArray.forEach(match => {
                    let homeid, awayid;
                    if (util.returnBoolByPath(match, 'home.id')) {
                        homeid = match.home.id.toString();
                    }
                    if (util.returnBoolByPath(match, 'away.id')) {
                        awayid = match.away.id.toString();
                    }
                    if (teamid == homeid) {
                        match.home['teamName'] = team.teamName;
                        match.home['logo'] = team.logo;
                        match.home['teamName_lower'] = team.teamName_lower;
                        match.home['ticker'] = team.ticker;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['logo'] = team.logo;
                        match.away['teamName_lower'] = team.teamName_lower;
                        match.away['ticker'] = team.ticker;
                    }
                });
            });
            return matchesArray;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
};

/**
 * @name addTeamInfoFromArchiveToMatch
 * @function
 * @description Add provided season archived team info to the provided matches list
 * @param {Array.<Match>} matchesArray - list of matches to add team info to
 * @param {number} season - season archive from which to get the team info
 */
async function addTeamInfoFromArchiveToMatch(matchesArray, season) {
    //typechecking
    if (!Array.isArray(matchesArray)) {
        matchesArray = [matchesArray];
    }

    let teams = findTeamIds(matchesArray);
    let query = {
        $and: [{
                "season": season
            },
            {
                type: 'team'
            },
            {
                'object.teamId': { $in: teams }
            }
        ]
    }

    return Archive.find(query).then((matchesArrayTeams) => {
        if (matchesArrayTeams) {
            matchesArrayTeams.forEach(team => {
                let teamid = team.object.teamId;
                matchesArray.forEach(match => {
                    let homeid, awayid;
                    if (util.returnBoolByPath(match, 'home.id')) {
                        homeid = match.home.id.toString();
                    }
                    if (util.returnBoolByPath(match, 'away.id')) {
                        awayid = match.away.id.toString();
                    }
                    if (teamid == homeid) {
                        match.home['teamName'] = team.object.teamName;
                        match.home['logo'] = team.object.logo;
                        match.home['teamName_lower'] = team.object.teamName_lower;
                        match.home['ticker'] = team.object.ticker;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.object.teamName;
                        match.away['logo'] = team.object.logo;
                        match.away['teamName_lower'] = team.object.teamName_lower;
                        match.away['ticker'] = team.object.ticker;
                    }
                });
            });
            return matchesArray;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
};

module.exports = {
    promoteTournamentMatch: promoteTournamentMatch,
    addTeamInfoToMatch: addTeamInfoToMatch,
    addTeamInfoFromArchiveToMatch: addTeamInfoFromArchiveToMatch,
    findTeamIds: findTeamIds
};