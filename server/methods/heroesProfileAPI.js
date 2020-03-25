const axios = require('axios');
const querystring = require('querystring');
const util = require('../utils');

const hpAPIbase = 'https://api.heroesprofile.com/api/';

const matchUpload = 'NGS/Games/Upload';

const playerMmr = 'Player/MMR?mode=json&battletag={btag}&region=1';

const highestStat = 'NGS/Leaderboard/Highest/Total/Stat?stat={stat}&season={season}';

const avgStat = 'NGS/Leaderboard/Highest/Average/Stat?stat={stat}&season={season}';

const playerProfile = 'Player?battletag={btag}&region=1';

const playerHeroStat = 'NGS/Hero/Stat?battletag={btag}&region=1&hero={hero}&season={season}&division={division}';

const ngsPlayerProfile = 'NGS/Player/Profile?battletag={btag}&region=1';

const replayDeleteUri = 'NGS/Games/Delete?replayID={replayId}';

const ngsPlayerProfileParams = {
    division: '&division={division}',
    season: '&season={season}'
}

const playerAllHero = 'Player/Hero/All?mode=json&battletag={btag}&region=1&api_token={token}&game_type=Storm League';



async function matchUploadFn(postObj) {

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };

    let url = hpAPIbase + matchUpload;

    url = appendApiToken(url);

    let returnUrl = await axios.get(url + '&' + querystring.stringify(postObj), config).then(
        success => {
            return success.data;
        },
        failure => {
            // console.log('failure', failure);
            // util.errLogger('HeroesProfileAPI', failure, 'matchUploadFn');
            throw failure;
        }
    );

    return returnUrl;

};

function deleteReplayAPI(replayUrl) {
    let url = hpAPIbase + replayDeleteUri;

    let replayId = getIdFromUrl(replayUrl);

    url = url.replace('{replayId}', encodeURIComponent(replayId));

    url = appendApiToken(url);

    return axios.get(url).then(
        (reply) => {
            return reply.data;
        },
        (err) => {
            util.errLogger('HeroProfileAPI: deleteReplayAPI', err);
            throw err;
        }
    );
}

function playerMmrAPI(battletag) {
    let url = hpAPIbase + playerMmr;

    url = url.replace('{btag}', encodeURIComponent(battletag));

    url = appendApiToken(url);

    return axios.get(url).then(
        (reply) => {
            return reply.data[battletag];
        },
        (err) => {
            throw err;
        }
    );
}

function playerProfileFn(btag) {
    let url = hpAPIbase + playerProfile;
    url = url.replace('{btag}', encodeURIComponent(btag));
    url = appendApiToken(url);
    return axios.get(url).then(
        rep => {
            return rep.data;
        }, err => {
            throw err;
        }
    );
}

async function highestStatFn(stat, season) {
    let url = hpAPIbase + highestStat;

    url = url.replace('{stat}', stat);
    url = url.replace('{season}', season);

    url = appendApiToken(url);

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }

    let returnUrl = 'null';

    try {
        returnUrl = await axios.get(url, config);
    } catch (error) {
        util.errLogger('HeroesProfileAPI', error, 'highestStatFn');
    }

    return returnUrl;

}


function appendApiToken(url) {
    if (url.indexOf('?') > -1) {
        url += '&';
    } else {
        url += '?';
    }
    url += 'api_token=' + process.env.heroProfileAPIkey;
    url += `&mode=${process.env.heroProfileMode}`;
    return url;
}

function getIdFromUrl(url) {

    let locate = '?replayID=';

    if (url.includes(locate)) {
        let ind = url.indexOf(locate);

        let nextChar = returnNextCharInd(url, ind);

        let endIndex = nextChar > -1 ? nextChar : url.length;

        let id = url.substring(ind + locate.length, endIndex);

        return id;
    }



}

function returnNextCharInd(str, startingIndex, searchChars) {
    if (searchChars == undefined || searchChars == null) {
        searchChars = ['?', '/', '&'];
    }
    if (startingIndex == undefined || startingIndex == null) {
        startingIndex = 0;
    }
    let index = -1;
    searchChars.forEach(
        (char) => {
            index = str.indexOf(char, startingIndex);
        });
    return index;
}


module.exports = {
    matchUpload: matchUploadFn,
    playerMmrAPI: playerMmrAPI,
    playerProfile: playerProfileFn,
    highestStat: highestStatFn,
    deleteReplayAPI: deleteReplayAPI
};