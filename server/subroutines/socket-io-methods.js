//import the config of socket IO
const socketIo = require('./socket-io-config');

//accepts string: system user ID
//uses socked IO to send a ping to the client associated with the user
//the client uses this to request current new and pending messages to update the message notification in real time.
function dispatchMessage(recepient) {

    //check that there are clients
    if (socketIo.clients.length > 0) {
        let dispatchToId = null;

        //if this recipient is in the socket IO memory; get it's client ID
        if (socketIo.indexOfUser(socketIo.clients, recepient) > -1) {
            dispatchToId = socketIo.clients[socketIo.indexOfUser(socketIo.clients, recepient)].clientId;
        }
        //if we found the client ID dispatch message to it
        if (dispatchToId) {
            let namespace = null;
            let ns = socketIo.socketIo.of(namespace || "/");
            let socket = ns.connected[dispatchToId] // assuming you have  id of the socket
            if (socket) {
                let message = 'this client has a new message!';
                socket.emit("newMessage", message);
            }
        }

    }
}

module.exports = {
    dispatchMessage: dispatchMessage
}