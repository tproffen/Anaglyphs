'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');
var snapButton = document.getElementById('snap');
var canvas = document.getElementById('canvas');

checkBrowser(document.getElementById('warning'));

// This is the capture size of the camera

var width=1280;
var height=960;

canvas.height=height;
canvas.width=width;
determineSizes();

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
	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.drawImage(videoElement1, 0, 0, width, height);
	var imageRed = context.getImageData(0,0,canvas.width, canvas.height);

	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.drawImage(videoElement2, 0, 0, width, height);
	var imageCyan = context.getImageData(0,0,canvas.width, canvas.height);
	
	for (var i = 0; i < imageRed.data.length; i += 4) {
 		var brightRed = 0.34 * imageRed.data[i] + 0.5 * imageRed.data[i + 1] + 0.16 * imageRed.data[i + 2];
 		var brightCyan = 0.34 * imageCyan.data[i] + 0.5 * imageCyan.data[i + 1] + 0.16 * imageCyan.data[i + 2];
 		imageCyan.data[i]   = brightRed;  // Just swap red channel
 		imageCyan.data[i+1] = brightCyan; 
 		imageCyan.data[i+2] = brightCyan;
    	}	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.putImageData(imageCyan, 0, 0);
}

function determineSizes () {
	
	var offsetX=300;
	var offsetY=100;
	
	var newWidth=window.innerWidth-offsetX;
	var newHeight=3*(newWidth/4);
	
	if (newHeight>(window.innerHeight-offsetY)) {
		newHeight=window.innerHeight-offsetY;
		newWidth=4*(newHeight/3);
	}
	canvas.style.width=newWidth + 'px';
	canvas.style.height=newHeight + 'px';
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
