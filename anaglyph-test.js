
var drawingApp = (function () {

	"use strict";

	var canvas,
		clearButton,
		offsetSlider,
		context,
		canvasWidth  = 0.95 * window.innerWidth, 
		canvasHeight = 0.75 * window.innerHeight,
		colorRed = "#ff0000",
		colorCyan = "#00ffff",
		paint = false,
		offset,
		clickXRed = [], clickXCyan = [],
		clickYRed = [], clickYCyan = [],
		clickDrag = [],
	   
	// Add mouse and touch event listeners to the canvas
	createUserEvents = function () {

		var press = function (e) {
			
			var mouseX = e.pageX - this.offsetLeft;
			var mouseY = e.pageY - this.offsetTop;
  
			paint = true;
			addClick(mouseX, mouseY, false);
			redraw();
		},

		drag = function (e) {
				
			var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
				mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
			
			if (paint) {
				addClick(mouseX, mouseY, true);
				redraw();
			}
			// Prevent the whole page from dragging if on mobile
			e.preventDefault();
		},

		release = function () {
			paint = false;
			redraw();
		},
		
		clear = function () {
			clearCanvas();
		},

		offsetValue = function () {
			offset=offsetSlider.valueAsNumber;
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
		offsetSlider.addEventListener("change", offsetValue, false);
	},
		
	// Adds a point to the drawing array.
	// @param x
	// @param y
	// @param dragging
	addClick = function (x, y, dragging) {

		clickXRed.push(x);
		clickYRed.push(y);
		clickXCyan.push(x+offset);
		clickYCyan.push(y);
		clickDrag.push(dragging);
	},
	
	// Redrawing canvas
	redraw = function () {
		
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.lineJoin = "round";
		context.lineWidth = 5;
		
		drawLine(clickXRed,clickYRed,clickDrag,colorRed);
		context.globalCompositeOperation = "multiply";
		drawLine(clickXCyan,clickYCyan,clickDrag,colorCyan);
		context.globalCompositeOperation = "source-over";
	},
  
	// Drawing lines
	drawLine = function (clickX,clickY,Drag,Color) {
		
		context.strokeStyle = Color;
		
		// Draw Red lines
		
		for(var i=0; i < clickX.length; i++) {		
			context.beginPath();
			if(clickDrag[i] && i){
				context.moveTo(clickX[i-1], clickY[i-1]);
			}else{
				context.moveTo(clickX[i]-1, clickY[i]);
			}
			context.lineTo(clickX[i], clickY[i]);
			context.closePath();
			context.stroke();
		}
	},
	
	// Clears the canvas.
	clearCanvas = function () {
		clickXRed = []; clickXCyan = [];
		clickYRed = []; clickYCyan = [];
		clickDrag = [];
		redraw();
	},
		
	// Creates a canvas element and draws the canvas for the first time.
	init = function () {
		
		clearButton = document.getElementById('clearCanvas');
		offsetSlider = document.getElementById('offsetSlider');
		canvas = document.getElementById('canvas');
		canvas.height = canvasHeight;
		canvas.width = canvasWidth;
		context = canvas.getContext("2d");
		
		createUserEvents();
		offset=offsetSlider.valueAsNumber;
	};
	
	return {
		init: init
	};
}());