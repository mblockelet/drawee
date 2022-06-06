const ws = require('ws');

const server = new ws.Server({ port: 9090 });

var clients = [];

function newClient(ws) {
    var localId = clients.length;
    clients.push(ws);

    ws.on('message', function (message) {
        var event = JSON.parse(message);
        console.log('Received event type ' + event.type);
        for (var i = 0; i < clients.length; i++) {
            if (i != localId) {
                clients[i].send(message.toString());
            }
        }
    });
}

server.on('connection', (ws) => { newClient(ws) });