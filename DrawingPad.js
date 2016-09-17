
var drawingApp = (function () {

	"use strict";

	var canvas,
		memCanvas,
		oldCanvas,
		rect,
		clearButton,
		eraserButton,
		fullScreenButton,
		textButton,
		offsetInput,
		widthInput,
		context,
		memContext,
		oldContext,
		colorNormal,
		colorRed = "#ff0000",
		colorCyan = "#00ffff",
		colorWhite = "#ffffff",
		colorBlack = "#000000",
		paint = false,
		erase = false,
		drawText = false,
		offset, 
		width,
		oldX, oldY,
	   
	// Add mouse and touch event listeners to the canvas
	createUserEvents = function () {

		var press = function (e) {
			
			if (e.button) {
				if (e.button !=0) return;
			}
			var mouseX = e.pageX - rect.left;
			var mouseY = e.pageY - rect.top;

			if (drawText) {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
				drawAnaglyphText(mouseX,mouseY);
				
				drawText=false;
				textButton.style.backgroundColor=colorNormal;
				textButton.style.color=colorBlack;	
				document.getElementById("stringValue").value='';
			} else {
				paint = true;
				oldX=mouseX; oldY=mouseY;
			}
		},

		drag = function (e) {
				
			var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - rect.left,
				mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - rect.top;
			
			
			if (paint) {
				drawAnaglyphLine(oldX,oldY,mouseX,mouseY);
				oldX=mouseX; oldY=mouseY;
			}
			
			if (drawText) {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
				drawAnaglyphText(mouseX,mouseY);
			}
			
			// Prevent the whole page from dragging if on mobile
			e.preventDefault();
		},
		
		placeText = function (e) {
			if (drawText) {
				drawText=false;
				textButton.style.backgroundColor=colorNormal;
				textButton.style.color=colorBlack;	
				document.getElementById("stringValue").value='';
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
			} else {
				drawText=true;
				textButton.style.backgroundColor=colorBlack;
				textButton.style.color=colorWhite;	
				oldCanvas.width = canvas.width;
				oldCanvas.height = canvas.height;
				oldContext.drawImage(canvas, 0, 0);
			}
			
		},

		release = function () {
			paint = false;
		},
		
		clear = function () {
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);		
			context.fillStyle=colorWhite;
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
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

		fullScreen = function () {
			var el = document.documentElement,
			rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
			rfs.call(el);
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
		fullScreenButton.addEventListener("click", fullScreen, false);
		textButton.addEventListener("click", placeText, false);
		
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
 
 	// Drawing both strings for anaglyph
	drawAnaglyphText = function (toX,toY) {
		

		context.lineWidth = width;		
		context.globalCompositeOperation = "multiply";

		drawString(toX,toY,colorRed);
		drawString(toX+offset,toY,colorCyan);
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
	
	// Drawing strings
	drawString = function (toX,toY,Color) {
		
		context.fillStyle = Color;
		context.font = width*6+"px sans";
		context.fillText(document.getElementById("stringValue").value, toX, toY);
		context.stroke();
	},


	// Resize canvas to fit screen
	resizeCanvas = function () {
		
		// Do not resize when text input is active (soft keyboards)
		if(document.activeElement.type == 'text') {return;}
		
		memCanvas.width = canvas.width;
		memCanvas.height = canvas.height;
		memContext.drawImage(canvas, 0, 0);
		
		canvas.width  = 0.80*window.innerWidth;
		canvas.height = 0.80*window.innerHeight;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);		
		context.fillStyle=colorWhite;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		rect = canvas.getBoundingClientRect();
		
		context.drawImage(memCanvas, 0, 0); 
	},
	
	// Save canvas to image file
	downloadCanvas = function (link, canvasId, filename) {
		link.href = document.getElementById(canvasId).toDataURL();
		link.download = filename;
	},

		
	// Creates a canvas element and draws the canvas for the first time.
	init = function () {
						
		clearButton = document.getElementById('clearCanvas');
		eraserButton = document.getElementById('eraser');
		fullScreenButton = document.getElementById('fullScreen');
		textButton = document.getElementById('placeText');
		offsetInput = document.getElementById('offset');
		widthInput = document.getElementById('lineWidth');
		canvas = document.getElementById('canvas');
		context = canvas.getContext("2d");
		context.opacity = 1.0;
		
		memCanvas = document.createElement('canvas');
		memContext = memCanvas.getContext('2d');
		oldCanvas = document.createElement('canvas');
		oldContext = oldCanvas.getContext('2d');
		colorNormal = eraserButton.style.backgroundColor;
		resizeCanvas();
		
		document.getElementById('download').addEventListener('click',downloadCanvas(this, 'canvas', 'doodle.png'), false);
		createUserEvents();

		offset=offsetInput.valueAsNumber;
		width=widthInput.valueAsNumber;
	};
	
	return {
		init: init
	};
}());
