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

async function heroesProfile(btag) {
    return null;
}

module.exports = {
    hotslogsMMR: hotslogs,
    heroesProfileMMR: heroesProfile
}