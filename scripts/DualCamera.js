'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');
var snapButton = document.getElementById('snap');
var xOffset = document.getElementById('xOffset');
var yOffset = document.getElementById('yOffset');
var brightness = document.getElementById('brightness');
var canvas = document.getElementById('canvas');

var canvasRed = document.createElement('canvas');
var canvasCyan = document.createElement('canvas');

checkBrowser();

// This is the capture size of the camera

var width=1280;
var height=960;

canvas.height=height; 
canvas.width=width;
canvasRed.height=height; 
canvasRed.width=width;
canvasCyan.height=height; 
canvasCyan.width=width;

determineSizes();

var context = canvas.getContext('2d');
drawWelcome();

var contextRed = canvasRed.getContext('2d');
var contextCyan = canvasCyan.getContext('2d');

function drawWelcome () {
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);	

	context.fillStyle = '#FFFFFF';
	context.font = "64px Arial, Helvetica, sans-serif";
	context.textAlign="center";
	context.fillText('Ready', width/2, height/2);
	context.stroke();
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
	
	contextCyan.clearRect(0, 0, width, height);
	contextCyan.drawImage(videoElement1, 0, 0, width, height);
	contextRed.clearRect(0, 0, width, height);
	contextRed.drawImage(videoElement2, 0, 0, width, height);

	canvasDownload(canvasRed,"download1","Left.png");
	canvasDownload(canvasCyan,"download2","Right.png");
	
	compositeImage();
}

function canvasDownload (canvas,download,name) {
	
	document.getElementById(download).download=name;
	document.getElementById(download).href=canvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}

function compositeImage () {
	
	var wR=0.21, wG=0.72, wB=0.07;
	
	var offX= xOffset.valueAsNumber * width;
	var offY= yOffset.valueAsNumber * height;
	var bright = brightness.valueAsNumber;

	var imageCyan = contextCyan.getImageData(0, 0,width, height);
	var imageRed = contextRed.getImageData(0, 0, width, height);
	
	context.clearRect(0, 0, width, height);
	context.putImageData(imageRed, offX, offY);
	imageRed = context.getImageData(0, 0, width, height);
	
	for (var i = 0; i < imageRed.data.length; i += 4) {
// 		var brightRed = wR * imageRed.data[i] + wG * imageRed.data[i + 1] + wB * imageRed.data[i + 2];
// 		var brightCyan = wR * imageCyan.data[i] + wG * imageCyan.data[i + 1] + wB * imageCyan.data[i + 2];
// 		imageCyan.data[i]   = bright*brightRed;  // Just swap red channel
// 		imageCyan.data[i+1] = bright*brightCyan; 
// 		imageCyan.data[i+2] = imageCyan.data[i+1];
 		imageCyan.data[i]   = bright*imageRed.data[i];  // Just swap red channel
 		imageCyan.data[i+1] = bright*imageCyan.data[i+1];
 		imageCyan.data[i+2] = bright*imageCyan.data[i+2];
    	}	
	
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);
	context.putImageData(imageCyan,-offX/2, -offY/2, offX, offY, width, height);

}

function determineSizes () {
	
	var padW=595;
	var padH=120;
	
	var newWidth=window.innerWidth-padW;
	var newHeight=3*(newWidth/4);
	
	if (newHeight>(window.innerHeight-padH)) {
		newHeight=window.innerHeight-padH;
		newWidth=4*(newHeight/3);
	}
	canvas.style.width=newWidth + 'px';
	canvas.style.height=newHeight + 'px';
}

function writeValues () {
	
	setCookie('xOffset',document.getElementById('xOffset').value)
	setCookie('yOffset',document.getElementById('yOffset').value)
	setCookie('videoSelect1', videoSelect1.selectedIndex)
	setCookie('videoSelect2', videoSelect2.selectedIndex)
}

function readValues () {

    var val;
	
	if (val=getCookie('xOffset')) {document.getElementById('xOffset').value = val}
	if (val=getCookie('yOffset')) {document.getElementById('yOffset').value = val}
	if (val=getCookie('videoSelect1')) {videoSelect1.selectedIndex = val}
	if (val=getCookie('videoSelect2')) {videoSelect2.selectedIndex = val}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}

// Main routine

navigator.mediaDevices.getUserMedia({video:true});
navigator.mediaDevices.enumerateDevices().then(gotDevices).then(readValues).then(connectStream).catch(handleError);

videoSelect1.addEventListener("change", connectStream, false);
videoSelect2.addEventListener("change", connectStream, false);

snapButton.addEventListener("click", snapImage, false);
xOffset.addEventListener("change", compositeImage, false);
yOffset.addEventListener("change", compositeImage, false);
brightness.addEventListener("change", compositeImage, false);

window.addEventListener("resize", determineSizes, false);
window.addEventListener("unload", writeValues, false);
