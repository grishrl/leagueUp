const challoneAPI = require('../methods/challongeAPI');
const Scheduling = require('../models/schedule-models');
const Match = require('../models/match-model');
const util = require('../utils');

function promoteTournamentMatch(foundMatch) {
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
        Match.findOne({
            matchId: foundMatch.parentId
        }).then(found => {
            if (found) {
                let foundObj = found.toObject();
                if (util.returnBoolByPath(foundObj, 'away')) {
                    found.home = winner;
                } else {
                    found.away = winner;
                }
                found.save().then(saved => {
                    console.log(saved);
                }, err => {
                    console.log(err);
                });
            } else {
                console.log('the parent match was not found');
            }
        }, err => {
            console.log(err);
        });

        reportToChallonge(foundMatch, winner).then(returned => {
            console.log('returned ', returned);
        })

    }
}

async function reportToChallonge(match, winner) {
    let returnVal = null;
    console.log(match.challonge_tournament_ref);
    let winnerRef = await Scheduling.findOne({
        challonge_ref: parseInt(match.challonge_tournament_ref)
    }).lean().then(found => {
        console.log(found);
        return found;
    }, err => {
        console.log(err);
        return null;
    });
    console.log(winnerRef)
    if (winnerRef) {

        let winnerID
        console.log(winnerRef)
        winnerRef.participantsRef.forEach(
            reference => {
                if (reference.id == winner.id) {
                    winnerID = reference.challonge_ref;
                }
            }
        )

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
            if (winnerID == challongeMatch.player1_id) {
                if (winner.pos == 'home') {
                    scores = match.home.score + "-" + match.away.score
                } else {
                    scores = match.away.score + "-" + match.home.score;
                }
            } else {
                if (winner.pos == 'away') {
                    scores = match.away.score + "-" + match.home.score;
                } else {
                    scores = match.home.score + "-" + match.away.score
                }
            }
        }

        console.log('scores ', scores);


        if (winnerID) {
            let challongeRes = await challoneAPI.matchUpdate(match.challonge_tournament_ref, match.challonge_match_ref, scores, winnerID).then(
                res => {
                    console.log(res);
                    return true;
                },
                err => {
                    console.log(err);
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
    }
    return returnVal;
}

module.exports = {
    promoteTournamentMatch: promoteTournamentMatch
};