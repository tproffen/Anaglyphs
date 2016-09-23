'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');
var snapButton = document.getElementById('snap');
var xOffset = document.getElementById('xOffset');
var yOffset = document.getElementById('yOffset');
var canvas = document.getElementById('canvas');

checkBrowser();

// This is the capture size of the camera

var width=1280;
var height=960;

canvas.height=height;
canvas.width=width;
determineSizes();
readValues();

var context = canvas.getContext('2d');

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
	
	var offX= document.getElementById('xOffset').valueAsNumber * width;
	var offY= document.getElementById('yOffset').valueAsNumber * height;

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(videoElement1, 0, 0, width, height);
	var imageCyan = context.getImageData(0,0,canvas.width, canvas.height);

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(videoElement2, offX, offY, width, height);
	var imageRed = context.getImageData(0,0,canvas.width, canvas.height);
	
	for (var i = 0; i < imageRed.data.length; i += 4) {
 		var brightRed = 0.34 * imageRed.data[i] + 0.5 * imageRed.data[i + 1] + 0.16 * imageRed.data[i + 2];
 		var brightCyan = 0.34 * imageCyan.data[i] + 0.5 * imageCyan.data[i + 1] + 0.16 * imageCyan.data[i + 2];
 		imageCyan.data[i]   = brightRed;  // Just swap red channel
 		imageCyan.data[i+1] = brightCyan; 
 		imageCyan.data[i+2] = brightCyan;
    	}	
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.putImageData(imageCyan,-offX/2, -offY/2, offX, offY, width, height);
}

function determineSizes () {
	
	var offsetX=590;
	var offsetY=120;
	
	var newWidth=window.innerWidth-offsetX;
	var newHeight=3*(newWidth/4);
	
	if (newHeight>(window.innerHeight-offsetY)) {
		newHeight=window.innerHeight-offsetY;
		newWidth=4*(newHeight/3);
	}
	canvas.style.width=newWidth + 'px';
	canvas.style.height=newHeight + 'px';
}

function writeValues () {
	
	setCookie('xOffset',document.getElementById('xOffset').value)
	setCookie('yOffset',document.getElementById('yOffset').value)
	setCookie('videoSelect1, videoSelect1.selectedIndex)
	setCookie('videoSelect2, videoSelect2.selectedIndex)
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
navigator.mediaDevices.enumerateDevices().then(gotDevices).then(connectStream).catch(handleError);

videoSelect1.addEventListener("change", connectStream, false);
videoSelect2.addEventListener("change", connectStream, false);
snapButton.addEventListener("click", snapImage, false);
xOffset.addEventListener("change", snapImage, false);
yOffset.addEventListener("change", snapImage, false);
window.addEventListener("resize", determineSizes, false);
window.addEventListener("unload", writeValues, false);

