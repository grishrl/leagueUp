/**
 * Heroes Profile API WRAPPERS
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 * 
 */
const axios = require('axios');
const querystring = require('querystring');
const util = require('../utils');

//base hp url
const hpAPIbase = 'https://api.heroesprofile.com/api/';

//URI segment for match upload
const matchUpload = 'NGS/Games/Upload';

//uri segment for player mmr
const playerMmr = 'Player/MMR?mode=json&battletag={btag}&region=1';

//uri segment for getting highest stats
const highestStat = 'NGS/Leaderboard/Highest/Total/Stat?stat={stat}&season={season}';

//uri segment for getting average stats
const avgStat = 'NGS/Leaderboard/Highest/Average/Stat?stat={stat}&season={season}';

//uri segment for player profile
const playerProfile = 'Player?battletag={btag}&region=1';

//uri segment for getting players hero stats
const playerHeroStat = 'NGS/Hero/Stat?battletag={btag}&region=1&hero={hero}&season={season}&division={division}';

//uri segment for getting player ngs profile
const ngsPlayerProfile = 'NGS/Player/Profile?battletag={btag}&region=1';

//uri segment for deleting replay
const replayDeleteUri = 'NGS/Games/Delete?replayID={replayId}';


const ngsPlayerProfileParams = {
    division: '&division={division}',
    season: '&season={season}'
}

//uri segment for getting players all hero stats
const playerAllHero = 'Player/Hero/All?mode=json&battletag={btag}&region=1&api_token={token}&game_type=Storm League';



/**
 * @name matchUploadFn
 * @function
 * @description sends data to heroes profile for a replay upload
 * @param {Object} postObj 
 */
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
            throw failure;
        }
    );

    return returnUrl;

};

/**
 * @name deleteReplayAPI
 * @function
 * @description deletes given url info from heroes profile
 * @param {string} replayUrl 
 */
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

/**
 * @name playerMmrAPI
 * @function
 * @description retrieves players MMR by battletag
 * @param {string} battletag 
 */
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

/**
 * @name playerProfileFn
 * @function
 * @description returns link to player profile @ heroes profile
 * @param {string} btag 
 */
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

/**
 * @name highestStatFn
 * @function
 * @description returns data for the highest stats of provided stat name / season (ex: highest kills)
 * @param {string} stat stat name
 * @param {number} season season number
 */
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


/**
 * @name appendApiToken
 * @function
 * @description appends the API key to provided URL string
 * @param {string} url 
 */
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


/**
 * @name getIdFromUrl
 * @function
 * @description parses a HP url string and returns the ID from that string
 * @param {string} url URL string that heroes profile provides back to us after parsing
 */
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

/**
 * @name returnNextCharInd
 * @function
 * @description returns the indexes of the next string that is not URL specific identifiers EG: not /, ?, &
 * @param {*} str 
 * @param {*} startingIndex 
 * @param {*} searchChars 
 */
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