const socketIo = require('./socket-io-config');

function dispatchMessage(recepient) {
    if (socketIo.clients.length > 0) {
        let dispatchToId = null;
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