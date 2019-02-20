const socketIo = require('./socket-io-config');

//accepts string: system user ID
//uses socked IO to send a ping to the client associated with the user
//the client uses this to request current new and pending messages to update the message notification in real time.
function dispatchMessage(recepient) {

    if (socketIo.clients.length > 0) {
        let dispatchToId = null;
        //todo: can probably replace this with the indexoffunctions
        socketIo.clients.forEach((clientIt) => {
            if (clientIt.userId == recepient) {
                dispatchToId = clientIt.clientId;
            }
        });
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