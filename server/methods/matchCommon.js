const challoneAPI = require('../methods/challongeAPI');
const Scheduling = require('../models/schedule-models');
const Match = require('../models/match-model');
const util = require('../utils');

function promoteTournamentMatch(foundMatch) {
    if (foundMatch.type == 'tournament') {
        let winner = {};
        if (foundMatch.home.score > foundMatch.away.score) {
            winner['id'] = foundMatch.home.id;
            winner['teamName'] = foundMatch.home.teamName;
        } else {
            winner['id'] = foundMatch.away.id;
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
    let scores = match.home.score + "-" + match.away.score
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
    }
    return returnVal;
}

module.exports = {
    promoteTournamentMatch: promoteTournamentMatch
};