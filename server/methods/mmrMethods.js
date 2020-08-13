const axios = require('axios');
const https = require('https');
const util = require('../utils');
const hpAPI = require('./heroesProfileAPI');

const location = 'mmrMethods';

//helper function to return compatible user name for hotslogs
//replaces the # in a battle tag with _
function routeFriendlyUsername(username) {
    if (username != null && username != undefined) {
        return username.replace('#', '_');
    } else {
        return '';
    }
}


let hotslogsURL = 'https://api.hotslogs.com/Public/Players/1/';
//method to get back user mmr from hotslogs using their mmr
async function hotslogs(btag) {
    let val = 0;
    let id = null;
    try {
        //ignore hotslogs expired certs
        const agent = new https.Agent({
            rejectUnauthorized: false
        });
        const response = await axios.get(hotslogsURL + routeFriendlyUsername(btag), {
            httpsAgent: agent
        });
        let data = response.data;
        if (data['PlayerID']) {
            id = data.PlayerID
        }
        if (data.hasOwnProperty('LeaderboardRankings')) {
            data['LeaderboardRankings'].forEach(
                ranking => {
                    if (ranking['GameMode'] == 'StormLeague') {
                        val += ranking['CurrentMMR'] * .6;
                    } else if (ranking['GameMode'] == 'UnrankedDraft') {
                        val += ranking['CurrentMMR'] * .5;
                    }
                });
            val = Math.round(val);
        }
    } catch (error) {
        val = null;
    }
    return { playerId: id, mmr: val };
};

async function heroesProfile(btag) {
    let val = null;

    try {
        const response = await hpAPI.playerMmrAPI(btag);

        let data = response;

        let slMMR = 0;
        let tlMMR = 0;
        let hlMMR = 0;
        let urMMR = 0;
        let qmMMR = 0;

        let slGames = 0
        let tlGames = 0
        let hlGames = 0
        let urGames = 0
        let qmGames = 0

        if (util.returnBoolByPath(data, 'Storm League')) {
            slMMR = data["Storm League"].mmr;
            slGames = parseInt(data["Storm League"].games_played);
        }
        if (util.returnBoolByPath(data, 'Team League')) {
            tlMMR = data["Team League"].mmr;
            tlGames = parseInt(data["Team League"].games_played);
        }
        if (util.returnBoolByPath(data, 'Hero League')) {
            hlGames = parseInt(data["Hero League"].games_played);
            hlMMR = data["Hero League"].mmr;
        }
        if (util.returnBoolByPath(data, 'Unranked Draft')) {
            urGames = parseInt(data["Unranked Draft"].games_played);
            urMMR = data["Unranked Draft"].mmr;
        }
        if (util.returnBoolByPath(data, 'Quick Match')) {
            qmGames = parseInt(data["Quick Match"].games_played);
            qmMMR = data["Quick Match"].mmr;
        }
        let totalGames = slGames;
        if (totalGames > 150) {
            val = data["Storm League"].mmr;
        } else {
            totalGames += tlGames
            if (totalGames > 150) {
                val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames));
            } else {
                totalGames += hlGames
                if (totalGames > 150) {
                    val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames));
                } else {
                    totalGames += urGames;
                    if (totalGames > 150) {
                        val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames)) + (urMMR * (urGames / totalGames));
                    } else {
                        totalGames += qmGames;
                        if (totalGames > 150) {
                            val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames)) + (urMMR * (urGames / totalGames)) + (qmMMR * (qmGames / totalGames));
                        } else {
                            //return a negative MMR value this user had exteremely low games
                            let arr = [slMMR, tlMMR, hlMMR, urMMR, qmMMR];
                            arr.forEach(mmr => {
                                if (mmr > 0) {
                                    val = -1 * mmr;
                                }
                            })
                        }
                    }
                }
            }
        }
    } catch (error) {
        util.errLogger(location, error, 'heroesProfile');
        val = null;
    }
    if (val) {
        val = Math.ceil(val);
    }
    return val;
}

async function comboMmr(btag) {

    let hp = await heroesProfile(btag);

    return {
        'heroesProfile': hp
    };
}

module.exports = {
    hotslogsMMR: hotslogs,
    heroesProfileMMR: heroesProfile,
    comboMmr: comboMmr
}