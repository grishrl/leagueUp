const socketIo = require('../../serverConf')['socketIo'];

var clients = [];

socketIo.on('connection', function(client) {
    console.log('client connected ');
    client.on('storeClientInfo', function(data) {
        if (indexOfUser(clients, data.userId) == -1) {
            let clientInfo = {};
            clientInfo.userId = data.userId;
            clientInfo.clientId = client.id;
            clients.push(clientInfo);
        }
    });

    client.on('disconnect', function() {
        if (indexOfClient(clients, client.id) > -1) {
            clients.splice(indexOfClient(clients, client.id), 1)
        }
    });
});

function indexOfClient(clients, client) {
    let ind = -1;
    clients.forEach((clientIt, index) => {
        if (clientIt.clientId == client) {
            ind = index;
        }
    });
    return ind;
}

function indexOfUser(clients, user) {
    let ind = -1;
    clients.forEach((clientIt, index) => {
        if (clientIt.userId == user) {
            ind = index;
        }
    });
    return ind;
}

module.exports = { socketIo: socketIo, clients: clients };