/*******************************
This script has been written by Ozan
https://github.com/oynozan
https://www.oynozan.com
*******************************/

const gridSize = 10;
let canvas;
let grid;
let zoom;
let zoomMultiplier = 3;

let w = 3000, h = 1500;

let gridSelected = false;
let translateX, translateY;

let canvasContainer = document.getElementById("canvas-container");
let canvasContainerPadding = parseInt(window.getComputedStyle(canvasContainer, null).getPropertyValue('padding-left'));
let canvasContainerWidth = canvasContainer.offsetWidth - 2 * canvasContainerPadding;

function setup() {
    canvas = createCanvas(canvasContainerWidth, canvasContainerWidth/2);
    canvas.parent("canvas-container");
    
    grid = new Grid(gridSize);

    translateX = width/2;
    translateY = height/2;

    zoom = zoomMultiplier * width/w;
}

function draw() {
    background(210);

    translate(translateX, translateY);
    scale(zoom);

    //Grid background
    fill(255);
    rect(-w/2, -h/2, w, h);

    //Draw grid lines
    grid.draw();
    grid.hover();

    if (gridSelected && onCanvas()) grid.select(startX, startY);
}

class Grid {
    constructor(size) {
        this.size = size;
        this.strokeSize = 0.5;
        this.gridCountX = w / this.size;
        this.gridCountY = h / this.size;
    }

    draw() {
        stroke('#727272');
        strokeWeight(this.strokeSize);
        for (let i = -this.gridCountX / 2; i <= this.gridCountX / 2; i += 1) {
            line(i * (this.size), -h/2, i * (this.size), h/2);
        }
        for (let j = -this.gridCountY / 2; j <= this.gridCountY / 2; j += 1) {
            line(-w/2, j * (this.size), w/2, j * (this.size));
        }
    }

    hover() {
        if (gridSelected) return false;
        fill(210);
        noStroke();
        square(
            Math.ceil(((mouseX - translateX) / zoom) / this.size - 1) * (this.size) + this.strokeSize/2, 
            Math.ceil(((mouseY - translateY) / zoom) / this.size - 1) * (this.size) + this.strokeSize/2, 
            this.size - this.strokeSize
        );
    }

    select(dX, dY) {
        fill(color(1,191,74,150))

        this.selectedArea = [];
        
        this.direction = [];
        /* RIGHT: 1, LEFT: -1, TOP: 1, DOWN: -1 */

        this.dX = Math.floor(dX / zoom / (this.size)) * this.size;
        this.dY = Math.floor(dY / zoom / this.size) * this.size;

        if (this.dX > w/2) this.dX = w/2 - this.size;
        else if (this.dX < -w/2) this.dX = -w/2;
        if (this.dY > h/2) this.dY = h/2 - this.size;
        else if (this.dY < -h/2) this.dY = -h/2;

        this.selectedArea.push([this.dX, this.dY]);

        this.tX = Math.floor((mouseX-translateX) / zoom / (this.size)) * this.size;
        this.tY = Math.floor((mouseY-translateY) / zoom / (this.size)) * this.size;

        if (this.tX >= w/2) this.tX =  w/2 - this.size;
        else if (this.tX <= -w/2) this.tX =  -w/2;
        if (this.tY >= h/2) this.tY = h/2 - this.size;
        else if (this.tY <= -h/2) this.tY = -h/2;

        this.selectedArea.push([this.tX, this.tY]);

        //Drag Direction
        if (this.dX <= this.tX) this.direction.push(1);
        else this.direction.push(-1);

        if (this.dY >= this.tY) this.direction.push(1);
        else this.direction.push(-1);

        this.startOffsetX, this.startOffsetY;
        this.endOffsetX, this.endOffsetY;

        //Change origin position
        if (this.direction[0] == 1 && this.direction[1] == 1) {
            //Right-Top
            this.startOffsetX = 0;
            this.startOffsetY = this.size;
            this.endOffsetX = this.size;
            this.endOffsetY = -this.size;
        }

        else if (this.direction[0] == 1 && this.direction[1] == -1) {
            //Right-Down
            this.startOffsetX = 0;
            this.startOffsetY = 0;
            this.endOffsetX = this.size;
            this.endOffsetY = this.size;
        }

        else if (this.direction[0] == -1 && this.direction[1] == 1) {
            //Left-Top
            this.startOffsetX = this.size;
            this.startOffsetY = this.size;
            this.endOffsetX = -this.size;
            this.endOffsetY = -this.size;
        }

        else if (this.direction[0] == -1 && this.direction[1] == -1) {
            //Left-Down
            this.startOffsetX = this.size;
            this.startOffsetY = 0;
            this.endOffsetX = -this.size;
            this.endOffsetY = this.size;
        }
        
        rect(
            this.selectedArea[0][0]+this.startOffsetX,
            this.selectedArea[0][1]+this.startOffsetY,
            this.selectedArea[1][0]-this.selectedArea[0][0]+this.endOffsetX,
            this.selectedArea[1][1]-this.selectedArea[0][1]+this.endOffsetY,
        );

        this.pixelCount(this.selectedArea);
    }

    pixelCount(c) {
        this.count = (Math.abs(c[1][0] - c[0][0]) / this.size + 1) * (Math.abs(c[1][1] - c[0][1]) / this.size + 1);
        console.log(this.count);
    }
}

function Canvas(process) {
    let zoomFunc = function Zoom(d) {
        let zoomDirection;
        if (d > 0) zoomDirection = -1;
        else zoomDirection = 1;
        if ((zoom + zoomDirection * 0.07 >= 10 && zoomDirection == 1) || (zoom + zoomDirection * 0.07 <= 1/2 * width/w && zoomDirection == -1)) return false;
        zoom += zoom * zoomDirection * 0.07;
        changeSlider(zoom);
    }

    let moveFunc = function Move() {
        translateX -= prevX - mouseX;
        translateY -= prevY - mouseY;
        prevX = mouseX;
        prevY = mouseY;
    }

    switch(process) {
        case "zoom":
            return zoomFunc;
        case "zoomSlider":
            return zoomSliderFunc;
        case "move":
            return moveFunc;
    }
}

function onCanvas() {
    if (mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height) return true;
    return false;
}

function mouseWheel(e) {
    if (onCanvas()) {
        Canvas("zoom")(e.deltaY);
        return false;
    }
}

let isDraggingWithMiddleMouse = false;
let prevX, prevY, startX, startY;

window.mousePressed = e => {
    isDraggingWithMiddleMouse = mouseButton == CENTER;

    startX = mouseX - translateX;
    startY = mouseY - translateY;

    prevX = mouseX;
    prevY = mouseY;

    if (mouseButton == LEFT) {
        gridSelected = true;
    }

    if (onCanvas()) return false;
};

window.mouseDragged = e => {
    if (isDraggingWithMiddleMouse && onCanvas()) {
        Canvas("move")();
        return false;
    };
}

window.mouseReleased = e => {
    isDraggingWithMiddleMouse = false;
    isDraggingWithLeftMouse = false;
    gridSelected = false;

    if (onCanvas()) return false;
};

//Resize
window.onresize = function() {
    canvasContainerWidth = canvasContainer.offsetWidth - 2 * parseInt(window.getComputedStyle(canvasContainer, null).getPropertyValue('padding-left'));
    resizeCanvas(canvasContainerWidth, canvasContainerWidth/2);
}

//Reset
function resetCanvas() {
    translateX = width/2;
    translateY = height/2;
    zoom = zoomMultiplier * width/w;
}