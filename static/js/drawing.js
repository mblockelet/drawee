function clearCanvas(lcan) {
    lcan.clear();
    lcan.undoStack = [];
    lcan.redoStack = [];
    lcan.trigger('drawingChange', {});
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
    if (!GameManager.drawing) { return; }
    EventsSender.addEvent({
        type: 'shape',
        shape: LC.shapeToJSON(shapeInfo.shape),
        previousShape: shapeInfo.previousShape && LC.shapeToJSON(shapeInfo.previousShape)
    });
}

function drawingClear() {
    if (!GameManager.drawing) { return; }
    EventsSender.addEvent({ type: 'clear' });
}

function drawingUndo() {
    if (!GameManager.drawing) { return; }
    EventsSender.addEvent({ type: 'undo' });
}

function drawingRedo() {
    if (!GameManager.drawing) { return; }
    EventsSender.addEvent({ type: 'redo' });
}

function initCanvas() {
    var el = $('.drawing-area');
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

    interceptProgress(lcanvas);
    lcanvas.on('shapeSave', drawingShapeSave);
    lcanvas.on('clear', drawingClear);
    lcanvas.on('undo', drawingUndo);
    lcanvas.on('redo', drawingRedo);
    el.mousemove(mouseMoved);
}