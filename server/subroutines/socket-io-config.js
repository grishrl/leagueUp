/**
 * socket io - methods for doing socket io... for whatever its used for... do we need this???
 * ostensibly it should send a ping to the clients socket IO connection to cause their messages counter to update; 
 * also performs a heartbeat to check the API key and see if they may have left client opened on a terminal for an extended amount of time; this causes
 * disgruntled users but .. if they left their ngs open on a shared terminal then they might expose their battle.net account and no one wants that.
 * 
 * 
 * reviewed: 10-1-2020
 * reviewer: wraith
 */

// /* 
// This creates in memory storage for the clients that connect to keep track of the user / client ID relation ship and allow us to send messages back to the client if needed
// */


// //memory storage for connected clients
// //stores an object that has client ID and the associated system user ID
// var clients = [];

// //create a websocket conenction
// wss.on('connection', function(client) {

//     //all messages in ws will need to be parsed
//     client.on('message', (msg) => {
//         const unwrapped = JSON.parse(msg).message;
//         if (typeof unwrapped == 'object') {
//             if (unwrapped.hasOwnProperty('storeClientInfo')) {
//                 // console.log(unwrapped.storeClientInfo.userId);
//                 let userIndex = indexOfUser(clients, unwrapped.storeClientInfo.userId);
//                 // console.log('userIndex', userIndex);
//                 if (userIndex > -1) {
//                     clients.splice(userIndex, 1);
//                 }
//                 client.clientId = unwrapped.storeClientInfo.userId
//                 clients.push(client);
//                 console.log('clients.length', clients.length);
//             }
//         }
//     });

//     //when a client disconnects remove it from memory
//     client.on('close', function() {
//         let index = indexOfClient(clients, client.id);
//         console.log('IND', index, ' client.id', client.id);
//         if (index > -1) {
//             clients.splice(indexOfClient(clients, client.id), 1)
//         }
//         console.log('.. disconnect > clients now');
//     });
// });

// //helper function that returns the index of client object based on the client id
// function indexOfClient(clients, cleintId) {
//     let ind = -1;
//     clients.forEach((clientIt, index) => {
//         if (clientIt.clientId == cleintId) {
//             ind = index;
//         }
//     });
//     return ind;
// }

// //helper method that returns index of client object based on the user id
// function indexOfUser(clients, user) {
//     let ind = -1;
//     clients.forEach((clientIt, index) => {
//         if (clientIt.clientId == user) {
//             ind = index;
//         }
//     });
//     return ind;
// }

// module.exports = {
//     wss: wss,
//     clients: clients,
//     indexOfClient: indexOfClient,
//     indexOfUser: indexOfUser
// };