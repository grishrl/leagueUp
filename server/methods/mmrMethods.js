const axios = require('axios');
const https = require('https');
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
        // console.log(url + btag);
        //ignore hotslogs expired certs
        const agent = new https.Agent({
            rejectUnauthorized: false
        });
        const response = await axios.get(hotslogsURL + routeFriendlyUsername(btag), {
            httpsAgent: agent
        });
        let data = response.data;
        id = data['PlayerID'];
        var inc = 0
        var totalMMR = 0;
        var avgMMR = 0;
        data['LeaderboardRankings'].forEach(element => {
            if (element['GameMode'] != 'QuickMatch') {
                if (element['CurrentMMR'] > 0) {
                    inc += 1;
                    totalMMR += element.CurrentMMR;
                }
            }
        });
        avgMMR = Math.round(totalMMR / inc);
        val = avgMMR;
    } catch (error) {
        val = null;
    }
    return { playerId: id, mmr: val };
};

let heroesProfileURL = 'https://heroesprofile.com/API/MMR/Player/?api_key=' + process.env.heroProfileAPIkey + '&region=1&p_b=';

async function heroesProfile(btag) {
    let val = 0;
    try {
        // console.log(url + btag);
        const response = await axios.get(heroesProfileURL + encodeURIComponent(btag));
        console.log('response ', response)
        let data = response.data[btag.toString()];
        let slGames = parseInt(data["Storm League"].games_played)
        if (slGames > 150) {
            val = data["Storm League"].mmr;
        } else {
            let slMMR = data["Storm League"].mmr;
            let tlMMR = data["Team League"].mmr;
            let tlGames = parseInt(data["Team League"].games_played);
            let totalGames = slGames + tlGames
            if (totalGames > 150) {
                val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames));
            } else {
                let hlGames = parseInt(data["Hero League"].games_played);
                let hlMMR = data["Hero League"].mmr;
                totalGames = hlGames + tlGames + slGames;
                if (totalGames > 150) {
                    val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames));
                } else {
                    let urGames = parseInt(data["Unranked Draft"].games_played);
                    let urMMR = data["Unranked Draft"].mmr;
                    totalGames = hlGames + tlGames + slGames + urGames;
                    if (totalGames > 150) {
                        val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames)) + (urMMR * (urGames / totalGames));
                    } else {
                        let qmGames = parseInt(data["Quick Match"].games_played);
                        let qmMMR = data["Quick Match"].mmr;
                        totalGames = hlGames + tlGames + slGames + urGames + qmGames;
                        if (totalGames > 150) {
                            val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames)) + (urMMR * (urGames / totalGames)) + (qmMMR * (qmGames / totalGames));
                        } else {
                            val = 0;
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log('err', error);
        val = null;
    }
    return val;
}

module.exports = {
    hotslogsMMR: hotslogs,
    heroesProfileMMR: heroesProfile
}