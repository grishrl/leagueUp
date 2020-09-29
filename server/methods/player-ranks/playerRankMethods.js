// const PlayerRank = require('../models/player-rank-models');

// function getPlayerRankData(id) {
//     return PlayerRank.findOne({ playerId: id }).then(
//         found => {
//             return found;
//         },
//         err => {
//             throw err;
//         }
//     )
// }

// async function playerRankCRUD(id, data) {
//     let playerRank = await getPlayerRankData(id);
//     if (playerRank) {
//         playerRank.ranks.push(data)
//         return playerRank.save().then(
//             saved => {
//                 return saved;
//             },
//             err => {
//                 throw err;
//             }
//         );
//     } else {
//         return new PlayerRank({
//             playerId: id,
//             ranks: [
//                 data
//             ]
//         }).save().then(
//             saved => {
//                 return saved;
//             },
//             err => {
//                 throw err;
//             }
//         );
//     }
// }

// async function deletePlayerRankData(id, data) {
//     let playerRank = await getPlayerRankData(id);
//     if (playerRank) {
//         playerRank.ranks.forEach((item, index) => {
//             if (item.season == data.season) {
//                 playerRank.ranks.splice(index, 1);
//                 playerRank.markModified('ranks');
//             }
//         });
//         return playerRank.save().then(
//             saved => {
//                 return saved;
//             },
//             err => {
//                 throw err;
//             }
//         )
//     } else {
//         return null;
//     }
// }

// module.exports = {
//     getPlayerRankData,
//     playerRankCRUD,
//     deletePlayerRankData
// }