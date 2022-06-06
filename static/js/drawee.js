var EventsSender = {
    events: [],
    progressTimeout: null,
    websocket: null,
    init: function () {
        this.events = [];
        this.websocket = new WebSocket('ws://drawee.dgmil.net:9090/');
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
    init: function() {
        this.websocket = new WebSocket('ws://drawee.dgmil.net:9090/');
        this.websocket.onmessage = function(message) {
            var event = JSON.parse(message.data.toString());
            EventsReceiver.receiveEvent(event);
        };
    },
    registerCanvas: function (lcan) {
        this.lcan = lcan;
    },
    receiveEvent: function (event) {
        if (event.type == 'progress') {
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
        }
    }
}

var lcanvas = null;
var hoverShape = null;
function mouseMoved(event) {
    var strokeWidth = lcanvas.tool.strokeWidth;
    if (!strokeWidth) {
        mouseOut();
    }
    $('.hover-circle').show()
        .css('height', strokeWidth + 'px')
        .css('width', strokeWidth + 'px')
        .css('top', Math.floor(event.clientY - strokeWidth / 2 - 1) + 'px')
        .css('left', Math.floor(event.clientX - strokeWidth / 2 - 1) + 'px');
}

function mouseOut() {
    $('.hover-circle').hide();
}

function interceptProgress(lcan) {
    var dsip = lcan.drawShapeInProgress.bind(lcan);
    lcan.drawShapeInProgress = function (shape) {
        dsip(shape);
        EventsSender.addProgressShape(shape);
    }
}

function drawingShapeSave(shapeInfo) {
    EventsSender.addEvent({
        type: 'shape',
        shape: LC.shapeToJSON(shapeInfo.shape),
        previousShape: shapeInfo.previousShape && LC.shapeToJSON(shapeInfo.previousShape)
    });
}

function drawingClear() {
    EventsSender.addEvent({ type: 'clear' });
}

function drawingUndo() {
    EventsSender.addEvent({ type: 'undo' });
}

function drawingRedo() {
    EventsSender.addEvent({ type: 'redo' });
}

var lreceiver = null;
function init() {
    var el = $('.my-drawing');
    lcanvas = LC.init(
        el[0],
        {
            imageURLPrefix: '/static/img',
            secondaryColor: 'transparent',
            tools: [
                LC.tools.Pencil,
                LC.tools.Eraser,
                LC.tools.Line,
                LC.tools.Rectangle,
                LC.tools.Ellipse
            ]
        }
    );

    lreceiver = LC.init(
        $('.receiver')[0],
        {
            imageURLPrefix: '/static/img',
            secondaryColor: 'transparent',
            toolbar: 'hidden'
        }
    );

    EventsSender.init();
    EventsReceiver.init();
    EventsReceiver.registerCanvas(lreceiver);

    interceptProgress(lcanvas);
    lcanvas.on('shapeSave', drawingShapeSave);
    lcanvas.on('clear', drawingClear);
    lcanvas.on('undo', drawingUndo);
    lcanvas.on('redo', drawingRedo);
    el.mousemove(mouseMoved);
}

init();