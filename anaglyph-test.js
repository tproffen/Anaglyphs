
var drawingApp = (function () {

	"use strict";

	var canvas,
		memCanvas,
		clearButton,
		eraserButton,
		offsetInput,
		widthInput,
		context,
		memContext,
		colorNormal,
		colorRed = "#ff0000",
		colorCyan = "#00ffff",
		colorWhite = "#ffffff",
		colorBlack = "#000000",
		paint = false,
		erase = false,
		offset, 
		width,
		oldX, oldY,
	   
	// Add mouse and touch event listeners to the canvas
	createUserEvents = function () {

		var press = function (e) {
			
			if (e.button) {
				if (e.button !=0) return;
			}
			var mouseX = e.pageX - canvas.offsetLeft;
			var mouseY = e.pageY - canvas.offsetTop;
  
			paint = true;
			oldX=mouseX; oldY=mouseY;
			drawAnaglyphLine(oldX,oldY,mouseX,mouseY);
		},

		drag = function (e) {
				
			var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - canvas.offsetLeft,
				mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - canvas.offsetTop;
			
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
		},

		toggleErase = function () {
			if (erase) {
				erase=false;
				eraserButton.style.backgroundColor=colorNormal;
				eraserButton.style.color=colorBlack;	
			} else {
				erase=true;
				eraserButton.style.backgroundColor=colorBlack;
				eraserButton.style.color=colorWhite;	
			}
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
		eraserButton.addEventListener("click", toggleErase, false);
		offsetInput.addEventListener("change", offsetValue, false);
		widthInput.addEventListener("change", widthValue, false);
		window.addEventListener("resize", resizeCanvas, false);
	},
	
	// Drawing both lines for anaglyph
	drawAnaglyphLine = function (fromX,fromY,toX,toY) {
		
		context.lineJoin = "round";

		if (erase) {
			context.lineWidth = width+Math.abs(offset);		
			context.globalCompositeOperation = "source-over";
			drawLine(fromX,fromY,toX,toY,colorWhite);
		} else {
			context.lineWidth = width;		
			context.globalCompositeOperation = "multiply";

			drawLine(fromX,fromY,toX,toY,colorRed);
			drawLine(fromX+offset,fromY,toX+offset,toY,colorCyan);
		}
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

		var topHeight = document.getElementById('header').offsetHeight;
		var topWidth = document.getElementById('header').offsetWidth;
		var footHeight = document.getElementById('footer').offsetHeight;
		
		canvas.width  = topWidth;
		canvas.height = window.innerHeight-topHeight-footHeight-20;
		context.drawImage(memCanvas, 0, 0); 
	},
		
	// Creates a canvas element and draws the canvas for the first time.
	init = function () {
		if (/Mobi/.test(navigator.userAgent)) {
			document.body.style.fontSize="2em";
		}
		clearButton = document.getElementById('clearCanvas');
		eraserButton = document.getElementById('eraser');
		offsetInput = document.getElementById('offset');
		widthInput = document.getElementById('lineWidth');
		canvas = document.getElementById('canvas');
		context = canvas.getContext("2d");
		
		memCanvas = document.createElement('canvas');
		memContext = memCanvas.getContext('2d');
		colorNormal = eraserButton.style.backgroundColor;
		
		createUserEvents();
		offset=offsetInput.valueAsNumber;
		width=widthInput.valueAsNumber;
		resizeCanvas();
	};
	
	return {
		init: init
	};
}());