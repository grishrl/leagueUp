const challoneAPI = require('../methods/challongeAPI');
const Scheduling = require('../models/schedule-models');
const Match = require('../models/match-model');
const util = require('../utils');

async function promoteTournamentMatch(foundMatch) {
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
                    // console.log('res ', res);
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
                    // console.log(err);
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
                    if (parentChallongeMatch.match.player1_id == winnerID) {
                        parentMatch.home = winner;
                    } else {
                        parentMatch.away = winner;
                    }

                    parentMatch.save().then(saved => {
                        //  console.log(saved);
                    }, err => {
                        // console.log(err);
                    });

                }

            }

        } else {
            console.log('the parent match was not found');
        }

        reportToChallonge(foundMatch, winner, winnerID).then(returned => {
            // console.log('returned ', returned);
        })

    }
}

async function reportToChallonge(match, winner, winnerID) {
    let returnVal = null;
    // console.log(match.challonge_tournament_ref);
    // let winnerRef = await Scheduling.findOne({
    //     challonge_ref: parseInt(match.challonge_tournament_ref)
    // }).lean().then(found => {
    //     console.log(found);
    //     return found;
    // }, err => {
    //     console.log(err);
    //     return null;
    // });
    // console.log('winnerRef ', winnerRef)
    // if (winnerRef) {

    // let winnerID

    // winnerRef.participantsRef.forEach(
    //     reference => {
    //         if (reference.id == winner.id) {
    //             winnerID = reference.challonge_ref;
    //         }
    //     }
    // )

    let challongeMatch = await challoneAPI.matchGet(match.challonge_tournament_ref, match.challonge_match_ref).then(
        res => {
            // console.log('res ', res);
            return res;
        },
        err => {
            return null;
        }
    )
    let scores;
    if (challongeMatch) {
        // console.log('challongeMatch ', challongeMatch);
        // console.log('challongeMatch.match.player1_id ', challongeMatch.match.player1_id);
        // console.log('winner obj ', winner);
        // console.log('winnerID ', winnerID);
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

    // console.log('scores ', scores);


    if (winnerID) {
        let challongeRes = await challoneAPI.matchUpdate(match.challonge_tournament_ref, match.challonge_match_ref, scores, winnerID).then(
            res => {
                // console.log(res);
                return true;
            },
            err => {
                // console.log(err);
                return false;
            }
        )
    }
    if (!match.parentId) {
        let finalize = challoneAPI.finalizeTournament(match.challonge_tournament_ref).then(
            res => {
                return true;
            },
            err => {
                return false;
            }
        )
    }
    // }
    return returnVal;
}

module.exports = {
    promoteTournamentMatch: promoteTournamentMatch
};