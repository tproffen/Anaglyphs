'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');
var snapButton = document.getElementById('snap');
var xOffset = document.getElementById('xOffset');
var yOffset = document.getElementById('yOffset');
var canvas = document.getElementById('canvas');
var typeAna = document.getElementById('type_ana');
var typeSbs = document.getElementById('type_sbs');

var canvasLeft = document.createElement('canvas');
var canvasRight = document.createElement('canvas');

checkBrowser();

// This is the capture size of the camera

var width=1280;
var height=960;

navigator.mediaDevices.getUserMedia({video:true});
navigator.mediaDevices.enumerateDevices().then(gotDevices).then(readValues).then(connectStream).catch(handleError);

canvas.height=height; 
canvas.width=width;
canvasLeft.height=height; 
canvasLeft.width=width;
canvasRight.height=height; 
canvasRight.width=width;

var contextLeft = canvasLeft.getContext('2d');
var contextRight = canvasRight.getContext('2d');
var context = canvas.getContext('2d');

determineSizes();

videoSelect1.addEventListener("change", connectStream, false);
videoSelect2.addEventListener("change", connectStream, false);

snapButton.addEventListener("click", snapImage, false);
xOffset.addEventListener("change", compositeImage, false);
yOffset.addEventListener("change", compositeImage, false);
typeAna.addEventListener("change", compositeImage, false);
typeSbs.addEventListener("change", compositeImage, false);

window.addEventListener("resize", determineSizes, false);
window.addEventListener("unload", writeValues, false);

drawWelcome();

//================================================================================
// Functions below
//================================================================================

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
	
	contextRight.clearRect(0, 0, width, height);
	contextRight.drawImage(videoElement1, 0, 0, width, height);
	contextLeft.clearRect(0, 0, width, height);
	contextLeft.drawImage(videoElement2, 0, 0, width, height);

	canvasDownload(canvasLeft,"download1","Left.png");
	canvasDownload(canvasRight,"download2","Right.png");
	
	compositeImage();
}

function canvasDownload (canvas,download,name) {
	
	document.getElementById(download).download=name;
	document.getElementById(download).href=canvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}

function compositeImage () {
	
	// Make Red-Cyan Anaglyph
	
	if (typeAna.checked) {
		compositeImageAna();
	}
	
	// Make side-by-side Image for VR viewers
	
	if (typeSbs.checked) {
		compositeImageSbs();
	}
}

function compositeImageSbs () {
	
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);
	context.drawImage(canvasLeft,  width/4, 0, width/2, height, 0,       0, width/2, height);
	context.drawImage(canvasRight, width/4, 0, width/2, height, width/2, 0, width/2, height);
}

function compositeImageAna () {
	
	var wR=0.21, wG=0.72, wB=0.07;
	
	var offX= xOffset.valueAsNumber * width;
	var offY= yOffset.valueAsNumber * height;

	var imageRight = contextRight.getImageData(0, 0,width, height);
	var imageLeft = contextLeft.getImageData(0, 0, width, height);
	
	context.clearRect(0, 0, width, height);
	context.putImageData(imageLeft, offX, offY);
	imageLeft = context.getImageData(0, 0, width, height);
	
	for (var i = 0; i < imageLeft.data.length; i += 4) {
 		var brightLeft  = wR * imageLeft.data[i]  + wG * imageLeft.data[i + 1]  + wB * imageLeft.data[i + 2];
 		var brightRight = wR * imageRight.data[i] + wG * imageRight.data[i + 1] + wB * imageRight.data[i + 2];
 		imageRight.data[i]   = brightLeft;  // Just swap red channel
 		imageRight.data[i+1] = brightRight; 
 		imageRight.data[i+2] = brightRight;
    }	
	
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);
	context.putImageData(imageRight,-offX/2, -offY/2, offX, offY, width, height);
}

function determineSizes () {
	
	var padW=595;
	var padH=80;
	
	var newWidth=window.innerWidth-padW;
	var newHeight=3*(newWidth/4)+1;
	
	if (newHeight>(window.innerHeight-padH)) {
		newHeight=window.innerHeight-padH;
		newWidth=4*(newHeight/3)+1;
	}
	canvas.style.width=newWidth + 'px';
	canvas.style.height=newHeight + 'px';
}

function writeValues () {
	
	setCookie('xOffset',document.getElementById('xOffset').value)
	setCookie('yOffset',document.getElementById('yOffset').value)
	setCookie('videoSelect1', videoSelect1.selectedIndex)
	setCookie('videoSelect2', videoSelect2.selectedIndex)
	setCookie('typeSbs', typeSbs.checked)
	setCookie('typeAna', typeAna.checked)
	
}

function readValues () {

    var val;
	
	if (val=getCookie('xOffset')) {document.getElementById('xOffset').value = val}
	if (val=getCookie('yOffset')) {document.getElementById('yOffset').value = val}
	if (val=getCookie('videoSelect1')) {videoSelect1.selectedIndex = val}
	if (val=getCookie('videoSelect2')) {videoSelect2.selectedIndex = val}
	if (val=getCookie('typeAna')) {typeAna.checked = val}
	if (val=getCookie('typeSbs')) {typeSbs.checked = val}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}

