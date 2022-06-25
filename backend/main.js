const ws = require('ws');

const server = new ws.Server({ port: 9090 });

var clients = [];
var games = {};

function newClient(ws) {
    var localId = clients.length;
    ws.localId = localId;
    clients.push(ws);

    var game = null;

    ws.on('message', function (message) {
        var event = JSON.parse(message);
        console.log('Received event type ' + event.type);
        if (event.type == 'connect') {
            if (!game) {
                if (!games[event.gameId]) {
                    games[event.gameId] = new Game(event.gameId);;
                }
                game = games[event.gameId];
            }
            game.addClient(ws, event.name)
        } else {
            if (game) {
                game.receiveEvent(ws, event);
            }
        }
    });
}

class Game {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.isDrawing = false;
        this.isStarted = false;
        this.clients = [];
        this.playerNames = [];
    }

    addClient(ws, name) {
        this.clients.push(ws);
        this.playerNames.push(name);
        this.sendInitialData(ws);
        console.log('Added client ' + name);
    }

    receiveEvent(ws, event) {
        if (event.type == 'start') {
            this.startGame();
        } else {
            this.sendEvent(event);
        }
    }

    sendEvent(event) {
        for (var i = 0; i < clients.length; i++) {
            var cws = clients[i];
            if (event.type == 'chat' || ws !== clients[i]) {
                clients[i].send(JSON.stringify(event));
            }
        }
    }

    sendInitialData(ws) {
        this.playerNames.forEach((name) => {
            ws.send(JSON.stringify({
                type: 'player',
                name: name
            }));
        });
    }

    startGame() {
        this.isStarted = true;
        this.sendEvent({
            type: 'start'
        });
        this.clientDrawing = -1;
        this.startRound();
    }

    startRound() {
        this.clientDrawing++;
        if (this.clientDrawing > this.clients.length - 1) { this.clientDrawing = 0; }
        this.clients.forEach((ws, idx) => {
            this.sendEvent({
                type: 'round',
                drawing: idx == this.clientDrawing,
                name: this.playerNames[this.clientDrawing],
                words: ["example", "whatever", "okay"]
            });
        })
    }
}

server.on('connection', (ws) => { newClient(ws) });