
var drawingApp = (function () {

	"use strict";

	var canvas,
		memCanvas,
		oldCanvas,
		tmpCanvas,
		rect,
		clearButton,
		eraserButton,
		downloadButton,
		textButton,
		offsetInput,
		widthInput,
		message,
		gallery,
		context,
		memContext,
		oldContext,
		tmpContext,
		stampImagesRed=[],
		stampImagesCyan=[],
		stamps,
		stampButton,
		colorNormal,
		colorRed = "#ff0000",
		colorCyan = "#00ffff",
		colorWhite = "#ffffff",
		colorBlack = "#000000",
		paint = false,
		erase = false,
		drawText = false,
		drawStamp = false,
		first = true,
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
			if (first) {clear(); first=false;}

			if (drawText) {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
				drawAnaglyphText(mouseX,mouseY);
				
				drawText=false;
				textButton.style.backgroundColor=colorNormal;
				textButton.style.color=colorBlack;	
				document.getElementById("stringValue").value='';
			}
			else if (drawStamp) {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
				drawAnaglyphStamp(mouseX,mouseY);
				
				drawStamp=false;
				stampButton.style.backgroundColor=colorNormal;
				stampButton.style.color=colorBlack;	} 
			else {
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
			
			if (drawStamp) {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
				drawAnaglyphStamp(mouseX,mouseY);
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
				if (first) {clear(); first=false;}
				drawText=true;
				textButton.style.backgroundColor=colorBlack;
				textButton.style.color=colorWhite;	
				oldCanvas.width = canvas.width;
				oldCanvas.height = canvas.height;
				oldContext.drawImage(canvas, 0, 0);
			}
			
		},
		
		placeStamp = function () {
			if (drawStamp) {
				drawStamp=false;
				stampButton.style.backgroundColor=colorNormal;
				stampButton.style.color=colorBlack;	
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				context.drawImage(oldCanvas, 0, 0); 
			} else {
				if (first) {clear(); first=false;}
				drawStamp=true;
				stampButton.style.backgroundColor=colorBlack;
				stampButton.style.color=colorWhite;	
				oldCanvas.width = canvas.width;
				oldCanvas.height = canvas.height;
				oldContext.drawImage(canvas, 0, 0);
			}
		},

		uploadCanvas = function() {
			
			message.innerHTML="Uploading ..";
			setTimeout(imgurUpload(),500);
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
		textButton.addEventListener("click", placeText, false);
		gallery.addEventListener("click", uploadCanvas, false);
		stampButton.addEventListener("click", placeStamp, false);
		
		
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
 
	// Drawing both stamps for anaglyph
	drawAnaglyphStamp = function (toX,toY) {
		
		var stamp = stamps.options[stamps.selectedIndex].value;
		var sx=stampImagesCyan[stamp].width*width/15.0;
		var sy=stampImagesCyan[stamp].height*width/15.0;
		
		context.lineWidth = width;
		context.globalCompositeOperation = "multiply";
		context.drawImage(stampImagesRed[stamp],toX,toY,sx,sy);
		context.drawImage(stampImagesCyan[stamp],toX+offset,toY,sx,sy);
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

	// Drawing start screen
	startScreen = function () {
		
		var base_image = new Image();
			base_image.src = 'images/DrawingPadStart.png';
			base_image.onload = function(){	
				var sw=base_image.width;
				var sh=base_image.height;
				if (sw>canvas.width) {
					sh=sh*(canvas.width/sw);
					sw=canvas.width;
				}
				context.drawImage(base_image, 0.5*(canvas.width-sw), 0.5*(canvas.height-sh), sw, sh);	
				first=true;
		}
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
	
	// Loads stamp images 
	loadStamps = function () {
		
		var path="https://tproffen.github.io/Anaglyphs/images/Stamps/";
		var stampUrlsRed = [path+"StormTrooperR.png",path+"3CPOR.png", path+"DarthVaderR.png", path+"DeathStarR.png",
						    path+"MilleniumFalconR.png", path+"R2D2R.png"];
		var stampUrlsCyan = [path+"StormTrooperGB.png",path+"3CPOGB.png", path+"DarthVaderGB.png", path+"DeathStarGB.png",
							path+"MilleniumFalconGB.png", path+"R2D2GB.png"];
		var stampLabs = ["Storm Trooper", "3-CPO", "Darth Vader", "Death Star", "Millenium Falcon", "R2D2"];

		for (var i=0; i < stampUrlsRed.length; i++) {
			var imgRed=new Image();
			var imgCyan=new Image();

			imgRed.src = stampUrlsRed[i];		
			imgCyan.src = stampUrlsCyan[i];	
			imgRed.setAttribute('crossOrigin', 'anonymous');
			imgCyan.setAttribute('crossOrigin', 'anonymous');

			stampImagesRed.push(imgRed);
			stampImagesCyan.push(imgCyan);

			var option = document.createElement('option');
			option.value = i;
			option.text = stampLabs[i];
			stamps.add(option);
		}
	},
	
	
	// Creates a canvas element and draws the canvas for the first time.
	init = function () {
						
		checkBrowser();

		clearButton = document.getElementById('clearCanvas');
		eraserButton = document.getElementById('eraser');
		textButton = document.getElementById('placeText');
		gallery = document.getElementById('gallery');
		message = document.getElementById('message');
		offsetInput = document.getElementById('offset');
		widthInput = document.getElementById('lineWidth');
		stamps = document.getElementById('stamps');
		stampButton = document.getElementById('placeStamp');
		
		canvas = document.getElementById('canvas');
		context = canvas.getContext("2d");
		context.opacity = 1.0;
		
		memCanvas = document.createElement('canvas');
		memContext = memCanvas.getContext('2d');
		oldCanvas = document.createElement('canvas');
		oldContext = oldCanvas.getContext('2d');
		tmpCanvas = document.createElement('canvas');
		tmpContext = tmpCanvas.getContext('2d');

		colorNormal = eraserButton.style.backgroundColor;
		
		resizeCanvas();
		createUserEvents();
		loadStamps();
		//startScreen();
		
		offset=offsetInput.valueAsNumber;
		width=widthInput.valueAsNumber;
	};
	
	return {
		init: init
	};
}());
