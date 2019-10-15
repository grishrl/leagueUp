const axios = require('axios');
const querystring = require('querystring');

const hpAPIbase = 'https://api.heroesprofile.com/api/';

const matchUpload = 'NGS/Games/Upload/';

const playerMmr = 'Player/MMR?mode=json&battletag={btag}&region=1';

const highestStat = 'NGS/Leaderboard/Highest/Total/Stat?stat={stat}&season={season}';

const avgStat = 'NGS/Leaderboard/Highest/Average/Stat?stat={stat}&season={season}';

const playerProfile = 'Player?battletag={btag}&region=1';

const playerHeroStat = 'NGS/Hero/Stat?battletag={btag}&region=1&hero={hero}&season={season}&division={division}';

const ngsPlayerProfile = 'NGS/Player/Profile?battletag={btag}&region=1';

const ngsPlayerProfileParams = {
    division: '&division={division}',
    season: '&season={season}'
}

const playerAllHero = 'Player/Hero/All?mode=json&battletag={btag}&region=1&api_token={token}&game_type=Storm League';



async function matchUploadFn(postObj) {

    if (!postObj.hasOwnProperty('api_token')) {
        postObj['api_token'] = process.env.heroProfileAPIkey;
    }

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };

    let url = hpAPIbase + matchUpload;

    let returnUrl = 'null';
    try {
        returnUrl = await axios.get(postToHotsProfileURL + '?' + querystring.stringify(postObj), config);
    } catch (error) {
        console.log(error);
    }

    return returnUrl;

};

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
        console.log(error);
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
    return url;
}

module.exports = {
    matchUpload: matchUploadFn,
    playerMmrAPI: playerMmrAPI,
    playerProfile: playerProfileFn,
    highestStat: highestStatFn
};