const axios = require('axios');
const util = require('../utils');

const tournamnetCreateAPI = 'https://api.challonge.com/v1/tournaments.json';

const tournamentStartAPI = 'https://api.challonge.com/v1/tournaments/{tournament}/start.json';

const tournamnetFinalizeAPI = 'https://api.challonge.com/v1/tournaments/{tournament}/finalize.json';

const tournamnetShowAPI = 'https://api.challonge.com/v1/tournaments/{tournament}.json';

const participantBulkAddAPI = 'https://api.challonge.com/v1/tournaments/{tournament}/participants/bulk_add.json';

const matchUpdateAPI = 'https://api.challonge.com/v1/tournaments/{tournament}/matches/{match_id}.json';

const matchGetAPI = 'https://api.challonge.com/v1/tournaments/{tournament}/matches/{match_id}.json';

function replaceTournamentApi(api, param, key) {
    let s = api;
    return s.replace(param, key);
}

function matchGet(tournamentId, matchId) {
    let url = replaceTournamentApi(matchUpdateAPI, '{tournament}', tournamentId);
    url = replaceTournamentApi(url, '{match_id}', matchId);
    url += '?api_key=' + process.env.challongeApiKey;
    return axios.get(url).then(response => {
        return response.data;
    }, err => {
        return err.response.data
    });
}

function matchUpdate(tournamentId, matchId, scores, winner) {
    let url = replaceTournamentApi(matchUpdateAPI, '{tournament}', tournamentId);
    url = replaceTournamentApi(url, '{match_id}', matchId);

    postObj = {
        api_key: process.env.challongeApiKey,
        match: {
            scores_csv: scores,
            winner_id: winner,
        }
    }

    return axios.put(url, postObj).then(response => {
        return response.data;
    }, err => {
        return err.response.data
    });
}

function createTournament(name, url, description, type) {
    let postObj = {
        api_key: process.env.challongeApiKey,
        tournament: {
            name: name,
            url: url,
            description: description,
            tournament_type: type
        }
    }
    return axios.post(tournamnetCreateAPI, postObj).then(response => { return response.data; }, err => { return err.response.data });
}

function startTournament(tournamentId) {
    let url = replaceTournamentApi(tournamentStartAPI, '{tournament}', tournamentId);
    let postObj = {
        api_key: process.env.challongeApiKey,
        include_matches: 1,
        include_participants: 1
    }
    return axios.post(url, postObj).then(response => {
        return response.data;
    }, err => {
        return err.response.data
    });;
}

function showTournament(tournamentId) {
    let url = replaceTournamentApi(tournamnetShowAPI, '{tournament}', tournamentId);
    url += '?api_key=' + process.env.challongeApiKey;
    url += '&include_matches=1';
    url += '&include_participants=1';
    return axios.get(url).then(response => {
        return response.data;
    }, err => {
        return err.response.data
    });;
}

function finalizeTournament(tournamentId) {
    let url = replaceTournamentApi(tournamnetFinalizeAPI, '{tournament}', tournamentId);
    let postObj = {
        api_key: process.env.challongeApiKey
    };
    return axios.post(url, postObj).then(response => {
        return response.data;
    }, err => {
        return err.response.data
    });;
}

function bulkParticpantsAdd(tournamnetId, particpantsArray) {
    let url = replaceTournamentApi(participantBulkAddAPI, '{tournament}', tournamnetId);

    let postObj = {
        api_key: process.env.challongeApiKey,
        participants: particpantsArray
    }

    return axios.post(url, postObj).then(response => {
        return response.data;
    }, err => {
        return err.response.data
    });;
}

async function retriveTournaments(tournamentIds) {
    let promArr = [];
    for (var i = 0; i < tournamentIds.length; i++) {
        promArr.push(
            showTournament(tournamentIds[i])
        );
    }
    let returnArr = await Promise.all(promArr).then(
        resolves => {
            return resolves;
        },
        err => {
            util.errLogger('challongeApi', err, 'retriveTournaments');
        }
    )
    return returnArr;
}

module.exports = {
    createTournament: createTournament,
    startTournament: startTournament,
    showTournament: showTournament,
    finalizeTournament: finalizeTournament,
    bulkParticpantsAdd: bulkParticpantsAdd,
    matchUpdate: matchUpdate,
    retriveTournaments: retriveTournaments,
    matchGet: matchGet
}