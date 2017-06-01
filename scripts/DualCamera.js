'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');
var videoRes1 = document.getElementById('resolution1');
var videoRes2 = document.getElementById('resolution2');
var snapButton = document.getElementById('snap');
var xOffset = document.getElementById('xOffset');
var contrast = document.getElementById('contrast');
var canvas = document.getElementById('canvas');
var title = document.getElementById("title");
var download = document.getElementById("download");
var message = document.getElementById("message");


var canvasLeft = document.createElement('canvas');
var canvasRight = document.createElement('canvas');
var canvasFish = document.createElement('canvas');

var contextLeft = canvasLeft.getContext('2d');
var contextRight = canvasRight.getContext('2d');
var contextFish = canvasFish.getContext('2d');
var context = canvas.getContext('2d');

// This is the capture size of the camera

var width=1280;
var height=720;

// Some colors

var	colorRed   = "#ff0000";
var colorCyan  = "#00ffff";
var colorBlack = "#000000";
var colorWhite = "#ffffff";

var titleFont = "bold 48pt Arial";
var titleHeight = 100;
var titleOffset = 10;

navigator.mediaDevices.enumerateDevices().then(gotDevices)
                                         .then(readValues)
										 .then(connectStream)
										 .then(setup)
										 .catch(handleError);

//================================================================================
// Functions below
//================================================================================

function setup () {
	
	canvas.height=height; 
	canvas.width=width;
	canvasLeft.height=height; 
	canvasLeft.width=width;
	canvasRight.height=height; 
	canvasRight.width=width;
	canvasFish.height=height; 
	canvasFish.width=width;

	determineSizes();

	videoSelect1.addEventListener("change", connectStream, false);
	videoSelect2.addEventListener("change", connectStream, false);

	snapButton.addEventListener("click", snapImage, false);
	xOffset.addEventListener("change", compositeImage, false);
	contrast.addEventListener("change", compositeImage, false);
	title.addEventListener("change", addTitle, false);
	
	window.addEventListener("resize", determineSizes, false);
	window.addEventListener("unload", writeValues, false);

	videoElement1.onloadedmetadata = function () {
		videoRes1.innerHTML=videoElement1.videoWidth + "x" + videoElement1.videoHeight;
	}
	videoElement2.onloadedmetadata = function () {
		videoRes2.innerHTML=videoElement2.videoWidth + "x" + videoElement2.videoHeight;
	}
	
	updateMessage("Ready");
}

function updateMessage (what,par) {
	
	if (what=='Ready') {
		download.innerHTML="<b>READY</b>";
		message.style.backgroundColor="#98ff9d";
	}

	if (what=='Updating') {
		download.innerHTML="<b>Updating ..</b>";
		message.style.backgroundColor="#ff9898";
	}
	
	if (what=='Download') {
		var name="Anaglyph"+Date.now()+".jpg";		
		download.innerHTML="<a href=\""+par+"\" download=\""+name+"\" onclick=\"updateMessage('Ready');\">Download image</a>";
		message.style.backgroundColor="#ff9898";
	}
}

function gotDevices(deviceInfos) {

  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
	  console.log('Video device: ', deviceInfo);
      var option = document.createElement('option');
	  option.value = deviceInfo.deviceId;
      option.text = deviceInfo.label || 'camera ' + (videoSelect1.length + 1);
      videoSelect1.add(option);

      var option = document.createElement('option');
	  option.value = deviceInfo.deviceId;
      option.text = deviceInfo.label || 'camera ' + (videoSelect2.length + 1);
      videoSelect2.add(option);
    }
  }
}

function connectStream() {
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {track.stop();});
	}
	
	var videoSource1 = videoSelect1.options[videoSelect1.selectedIndex].value;
	var constraints = {video: {deviceId: videoSource1 ? {exact: videoSource1} : undefined, 
			   width: {ideal: width}, height: {ideal: height}}};
	navigator.mediaDevices.getUserMedia(constraints)
		.then(function(mediaStream) {videoElement1.srcObject = mediaStream;}).catch(handleError);
  
	var videoSource2 = videoSelect2.options[videoSelect2.selectedIndex].value;
	var constraints = {video: {deviceId: videoSource2 ? {exact: videoSource2} : undefined, 
			   width: {ideal: width}, height: {ideal: height}}};
	navigator.mediaDevices.getUserMedia(constraints)
		.then(function(mediaStream) {videoElement2.srcObject = mediaStream;}).catch(handleError);
}

function snapImage () {
	
	contextRight.clearRect(0, 0, width, height);
	contextRight.drawImage(videoElement1, 0, 0, width, height);
	contextLeft.clearRect(0, 0, width, height);
	contextLeft.drawImage(videoElement2, 0, 0, width, height);

	compositeImage();
}

function canvasDownloadLink () {
	
	canvas.toBlob(function(blob) {
		var url=URL.createObjectURL(blob);
		updateMessage("Download",url);
	}, "image/jpg");
}

function drawString (toX,toY,Color) {
		
	context.fillStyle = Color;
	context.font = titleFont;
	context.textAlign = "center"; 
	context.textBaseline = "middle";

	context.fillText(title.value, toX, toY);
	context.stroke();
}

function compositeImage() {
	
	updateMessage("Updating");
	doComposeImage();
}

function doComposeImage() {
	
	var wR=0.21, wG=0.72, wB=0.07, caddLeft=0.0, caddRight=0.0;
	var offX= xOffset.valueAsNumber * width;
	
	var imageRight = contextRight.getImageData(0, 0,width, height);
	var imageLeft = contextLeft.getImageData(0, 0, width, height);
	
	context.clearRect(0, 0, width, height);
	context.putImageData(imageLeft, offX, 0);
	imageLeft = context.getImageData(0, 0, width, height);
	
	for (var i = 0; i < imageLeft.data.length; i += 4) {
 		var brightLeft  = wR * imageLeft.data[i]  + wG * imageLeft.data[i + 1]  + wB * imageLeft.data[i + 2];
 		var brightRight = wR * imageRight.data[i] + wG * imageRight.data[i + 1] + wB * imageRight.data[i + 2];
		if (contrast.valueAsNumber > 0) 
		{
			caddLeft=(255-brightLeft)*contrast.valueAsNumber;
			caddRight=(255-brightRight)*contrast.valueAsNumber;
		}
		if (contrast.valueAsNumber < 0) 
		{
			caddLeft=brightLeft*contrast.valueAsNumber;
			caddRight=brightRight*contrast.valueAsNumber;
		}
 		imageRight.data[i]   = brightLeft  + caddLeft;  	// Just swap red channel
 		imageRight.data[i+1] = brightRight + caddRight; 
 		imageRight.data[i+2] = brightRight + caddRight;
    }	
	
	context.fillStyle = '#FFFFFF';
	context.fillRect(0, 0, width, height);
	context.putImageData(imageRight,-offX/2, 0, offX, 0, width, height);
	
	addTitle(); // This also updated the download link
}

function addTitle() {

	var offX= xOffset.valueAsNumber * width;

	if (title.value) {
		context.lineWidth = 15.0;
		context.fillStyle=colorWhite;
		context.fillRect(offX/2, height-titleHeight, width-offX, titleHeight);

		context.globalCompositeOperation = "multiply";
		drawString(width/2,height-titleHeight/2,colorRed);
		drawString(width/2+titleOffset,height-titleHeight/2,colorCyan);
		context.globalCompositeOperation = "source-over";
	}
	
	canvasDownloadLink();
}

function determineSizes () {
	
	var padW=450;
	var padH=180;
	
	var newWidth=window.innerWidth-padW;
	var newHeight=height*(newWidth/width)+1;
	
	if (newHeight>(window.innerHeight-padH)) {
		newHeight=window.innerHeight-padH;
		newWidth=width*(newHeight/height)+1;
	}
	canvas.style.width=newWidth + 'px';
	canvas.style.height=newHeight + 'px';
}

function writeValues () {
	
	setCookie('xOffset', xOffset.value);
	setCookie('contrast', contrast.value);
	setCookie('videoSelect1', videoSelect1.selectedIndex);
	setCookie('videoSelect2', videoSelect2.selectedIndex);	
}

function readValues () {

    var val;
	
	if (val=getCookie('xOffset')) {xOffset.value = val}
	if (val=getCookie('contrast')) {contrast.value = val}
	if (val=getCookie('videoSelect1')) {videoSelect1.selectedIndex = val}
	if (val=getCookie('videoSelect2')) {videoSelect2.selectedIndex = val}
	if (val=getCookie('autosave')) {autoSave.checked = val}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}
