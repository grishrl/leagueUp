const challoneAPI = require('../methods/challongeAPI');
const Scheduling = require('../models/schedule-models');
const Archive = require('../models/system-models').archive;
const Match = require('../models/match-model');
const util = require('../utils');
const Team = require('../models/team-models');

async function promoteTournamentMatch(foundMatch) {
    //make sure the received is plain old object
    if (foundMatch.hasOwnProperty('toObject')) {
        foundMatch = foundMatch.toObject();
    }
    let winnerID
        //grab the winner score and their position from the match
    if (foundMatch.type == 'tournament') {
        let winner = {};
        if (foundMatch.home.score > foundMatch.away.score) {
            winner['id'] = foundMatch.home.id;
            winner['pos'] = 'home';
            winner['teamName'] = foundMatch.home.teamName;
        } else {
            winner['id'] = foundMatch.away.id;
            winner['pos'] = 'away';
            winner['teamName'] = foundMatch.away.teamName;
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

        reportToChallonge(foundMatch, winner, winnerID).then(returned => {})

    }
}

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

function findTeamIds(found) {
    let teams = [];

    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
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


async function addTeamInfoToMatch(found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }

    let teams = findTeamIds(found);

    return Team.find({
        _id: {
            $in: teams
        }
    }).then((foundTeams) => {
        if (foundTeams) {

            foundTeams.forEach(team => {
                let teamid = team._id.toString();
                found.forEach(match => {
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
            return found;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
};

async function addTeamInfoFromArchiveToMatch(found, season) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }

    let teams = findTeamIds(found);
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

    return Archive.find(query).then((foundTeams) => {
        if (foundTeams) {
            foundTeams.forEach(team => {
                let teamid = team.object.teamId;
                found.forEach(match => {
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
            return found;
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