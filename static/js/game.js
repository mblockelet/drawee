var GameManager = {
    drawing: false,
    ws: null,

    init: function (sessionId, name) {
        this.ws = new WebSocket('ws://drawee.dgmil.net:9090/');
        EventsSender.init(this.ws);
        EventsReceiver.init(this.ws);

        var that = this;
        this.ws.onclose = function () {
            that.reconnect();
        }

        this.setLayout('lobby');
        this.ws.onopen = function () {
            that.ws.send(JSON.stringify({ type: 'connect', sessionId: sessionId, name: name }));
        }
    },

    reconnect: function () {
        // TODO
    },

    newPlayer: function (event) {
        $('.players').append('<li>' + event.name + '</li>');
    },

    startGame: function () {
        this.setLayout('drawing');
        initCanvas();
        EventsReceiver.registerCanvas(lcanvas);
        this.setDrawing(false);
    },

    startRound: function (event) {
        this.setDrawing(event.drawing);
        if (event.drawing) {
            WordSelector.displayWords(event.words);
        } else {
            WordSelector.displayChoosing(event.player);
        }
    },

    setLayout: function (layout) {
        $('.layout').hide();
        $('.layout-' + layout).show();
    },

    startNewRound: function () {
        clearCanvas(lcanvas);
        setLayout('drawing');
    },

    setDrawing: function (drawing) {
        this.drawing = !!drawing;
        $('.drawing-area').toggleClass('receiver', !this.drawing);
    }
}

function startSession() {
    EventsSender.addEvent({ type: 'start' });
}