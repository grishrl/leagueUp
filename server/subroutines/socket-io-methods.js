// //import the config of socket IO
// const ws = require('./socket-io-config');

// //accepts string: system user ID
// //uses socked IO to send a ping to the client associated with the user
// //the client uses this to request current new and pending messages to update the message notification in real time.
// function dispatchMessage(recepient) {

//     //check that there are clients
//     if (ws.wss.clients.length > 0) {
//         let dispatchToId = null;

//         //if this recipient is in the socket IO memory; get it's client ID
//         let clientIndex = ws.indexOfUser(ws.clients, recepient)
//         if (clientIndex > -1) {
//             dispatchToClient = ws.clients[clientIndex];
//         }
//         //if we found the client ID dispatch message to it
//         if (dispatchToClient) {
//             // let namespace = null;
//             // let ns = ws.wss.of(namespace || "/");
//             // let socket = ns.connected[dispatchToClient] // assuming you have  id of the socket
//             // if (dispatchToClient) {
//             let message = 'this client has a new message!';
//             dispatchToClient.send(JSON.stringify({ message }));
//             // }
//         }

//     }
// }

// module.exports = {
//     dispatchMessage: dispatchMessage
// }