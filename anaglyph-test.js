
var drawingApp = (function () {

	"use strict";

	var canvas,
		memCanvas,
		clearButton,
		offsetInput,
		widthInput,
		context,
		memContext,
		colorRed = "#ff0000",
		colorCyan = "#00ffff",
		paint = false,
		offset, 
		width,
		oldX, oldY,
	   
	// Add mouse and touch event listeners to the canvas
	createUserEvents = function () {

		var press = function (e) {
			
			if (e.button) {
				if (e.button !=0) return;
			}
			var mouseX = e.pageX - this.offsetLeft;
			var mouseY = e.pageY - this.offsetTop;
  
			paint = true;
			oldX=mouseX; oldY=mouseY;
			drawAnaglyphLine(oldX,oldY,mouseX,mouseY);
		},

		drag = function (e) {
				
			var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
				mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
			
			if (paint) {
				drawAnaglyphLine(oldX,oldY,mouseX,mouseY);
				oldX=mouseX; oldY=mouseY;
			}
			// Prevent the whole page from dragging if on mobile
			e.preventDefault();
		},

		release = function () {
			paint = false;
		},
		
		clear = function () {
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			resizeCanvas();
		},

		offsetValue = function () {
			offset=offsetInput.valueAsNumber;
		},
		
		widthValue = function () {
			width=widthInput.valueAsNumber;
		},

		cancel = function () {
			paint = false;
		};

		// Add mouse event listeners to canvas element
		canvas.addEventListener("mousedown", press, false);
		canvas.addEventListener("mousemove", drag, false);
		canvas.addEventListener("mouseup", release);
		canvas.addEventListener("mouseout", cancel, false);

		// Add touch event listeners to canvas element
		canvas.addEventListener("touchstart", press, false);
		canvas.addEventListener("touchmove", drag, false);
		canvas.addEventListener("touchend", release, false);
		canvas.addEventListener("touchcancel", cancel, false);
		
		// Add events to UI
		
		clearButton.addEventListener("click", clear, false);
		offsetInput.addEventListener("change", offsetValue, false);
		widthInput.addEventListener("change", widthValue, false);
		window.addEventListener("resize", resizeCanvas, false);
	},
	
	// Drawing both lines for anaglyph
	drawAnaglyphLine = function (fromX,fromY,toX,toY) {
		
		context.lineJoin = "round";
		context.lineWidth = width;		
		context.globalCompositeOperation = "multiply";

		drawLine(fromX,fromY,toX,toY,colorRed);
		drawLine(fromX+offset,fromY,toX+offset,toY,colorCyan);
	},
  
	// Drawing lines
	drawLine = function (fromX,fromY,toX,toY,Color) {
		
		context.strokeStyle = Color;
		
		context.beginPath();
		context.moveTo(fromX, fromY);
		context.lineTo(toX, toY);
		context.closePath();
		context.stroke();
	},

	// Resize canvas to fit screen
	resizeCanvas = function () {
		
		memCanvas.width = canvas.width;
		memCanvas.height = canvas.height;
		memContext.drawImage(canvas, 0, 0);

		canvas.width  = 0.95*window.innerWidth;
		canvas.height = 0.75*window.innerHeight;
		context.drawImage(memCanvas, 0, 0); 
	},
		
	// Creates a canvas element and draws the canvas for the first time.
	init = function () {
		
		clearButton = document.getElementById('clearCanvas');
		offsetInput = document.getElementById('offset');
		widthInput = document.getElementById('lineWidth');
		canvas = document.getElementById('canvas');
		context = canvas.getContext("2d");
		
		memCanvas = document.createElement('canvas');
		memContext = memCanvas.getContext('2d');
		
		createUserEvents();
		offset=offsetInput.valueAsNumber;
		width=widthInput.valueAsNumber;
		resizeCanvas();
	};
	
	return {
		init: init
	};
}());