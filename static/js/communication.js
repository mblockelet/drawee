var EventsSender = {
    events: [],
    progressTimeout: null,
    websocket: null,
    init: function (ws) {
        this.events = [];
        this.websocket = ws;
    },
    addEvent: function (event) {
        this.events.push(event);
        this.lastShape = null;
        this.websocket.send(JSON.stringify(event));
    },
    addProgressShape: function (shape) {
        if (this.progressTimeout) {
            return;
        }
        var self = this;
        if (shape.className == 'LinePath') {
            this.addEvent({ type: 'progresspoints', id: shape.id, points: shape.points });
        } else {
            this.addEvent({ type: 'progress', shape: LC.shapeToJSON(shape) });
        }
        this.progressTimeout = setTimeout(function () {
            self.progressTimeout = null;
        }, 200);
    }
}

var EventsReceiver = {
    lcan: null,
    progressPathId: null,
    progressPathShape: null,
    websocket: null,
    init: function (ws) {
        this.websocket = ws;
        this.websocket.onmessage = function (message) {
            var event = JSON.parse(message.data.toString());
            EventsReceiver.receiveEvent(event);
        };
    },
    registerCanvas: function (lcan) {
        this.lcan = lcan;
    },
    receiveEvent: function (event) {
        if (event.type == 'start') {
            GameManager.startGame();
        } else if (event.type == 'round') {
            GameManager.startRound(event);
        } else if (event.type == 'progress') {
            this.lcan.drawShapeInProgress(LC.JSONToShape(event.shape));
        } else if (event.type == 'progresspoints') {
            if (event.id != this.progressPathId) {
                this.progressPathShape = LC.createShape('LinePath');
            }
            for (var i = 0; i < event.points.length; i++) {
                this.progressPathShape.addPoint(event.points[i]);
            }
            this.lcan.drawShapeInProgress(this.progressPathShape);
        } else if (event.type == 'shape') {
            this.lcan.saveShape(
                LC.JSONToShape(event.shape),
                event.previousShape && LC.JSONToShape(event.previousShape)
            );
        } else if (event.type == 'clear') {
            this.lcan.clear();
        } else if (event.type == 'undo') {
            this.lcan.undo();
        } else if (event.type == 'redo') {
            this.lcan.redo();
        } else if (event.type == 'chat') {
            receiveChat(event);
        } else if (event.type == 'player') {
            GameManager.newPlayer(event);
        }
    }
}

