const axios = require('axios');

const hpAPIbase = 'https://api.heroesprofile.com/api/';

const matchUpload = 'NGS/Games/Upload/';

const playerMmr = 'Player/MMR?mode=json&battletag={btag}&region=1';

const highestStat = 'NGS/Leaderboard/Highest/Total/Stat?stat={stat}&season={season}';

const avgStat = 'NGS/Leaderboard/Highest/Average/Stat?stat={stat}&season={season}';

const playerHeroStat = 'NGS/Player/Hero/Stat?battletag={btag}&region=1&hero={hero}&season={season}&division={division}';

const ngsPlayerProfile = 'NGS/Player/Profile?battletag={btag}&region=1';

const ngsPlayerProfileParams = {
    division: '&division={division}',
    season: '&season={season}'
}

const playerAllHero = 'Player/Hero/All?mode=json&battletag={btag}&region=1&api_token={token}&game_type=Storm League';