'use strict';

var videoElement = document.getElementById('video');
var videoSelect = document.getElementById('videoSource');
var videoRes = document.getElementById('resolution');
var snapButton = document.getElementById('snap');

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

checkBrowser();

// This is the capture size of the camera

var width=512;
var height=512;

var ampReal = new Array(width*height); 
var ampImag = new Array(width*height); 

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

	determineSizes();

	videoSelect.addEventListener("change", connectStream, false);
	snapButton.addEventListener("click", snapImage, false);
	
	window.addEventListener("resize", determineSizes, false);
	window.addEventListener("unload", writeValues, false);

	videoElement.onloadedmetadata = function () {
		videoRes.innerHTML=videoElement.videoWidth + "x" + videoElement.videoHeight;
	}
}


function gotDevices(deviceInfos) {

  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
	  console.log('Video device: ', deviceInfo);
      var option = document.createElement('option');
	  option.value = deviceInfo.deviceId;
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.add(option);
    }
  }
}

function connectStream() {
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {track.stop();});
	}
	
	var videoSource = videoSelect.options[videoSelect.selectedIndex].value;
	var constraints = {video: {deviceId: videoSource ? {exact: videoSource} : undefined, 
			   width: {ideal: width}, height: {ideal: height}}};
	navigator.mediaDevices.getUserMedia(constraints)
		.then(function(mediaStream) {videoElement.srcObject = mediaStream;}).catch(handleError);
}

function snapImage () {
	
	var wR=0.21;
	var wG=0.72;
	var	wB=0.07; 
	var k=0;

	context.drawImage(videoElement, 0, 0, width, height);
	var img = context.getImageData(0, 0, width, height);
	
	for (var i = 0; i < img.data.length; i += 4) {
 		var gray = wR * img.data[i]  + wG * img.data[i + 1]  + wB * img.data[i + 2];
 		ampReal[k] = gray;
		ampImag[k] = 0;
		k++;
    }	

	transform(ampReal, ampImag); 
	k=0;

	for (var i = 0; i < img.data.length; i += 4) {
		var value = Math.sqrt(ampReal[k]*ampReal[k] + ampImag[k]*ampImag[k]);
 		img.data[i]   = value;
 		img.data[i+1] = value; 
 		img.data[i+2] = value;
		k++;
    }	

	context.putImageData(img, 0, 0);
}

function canvasDownloadLink () {
	
	canvas.toBlob(function(blob) {
		var url=URL.createObjectURL(blob);
		var name="FourierImage.png";		
		document.getElementById('download').innerHTML="<a href=\""+url+"\" download=\""+name+"\">Download image</a>";
	}, "image/png");
	
}

function determineSizes () {
	
	var padW=275;
	var padH=70;
	
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
	
	setCookie('videoSelect', videoSelect.selectedIndex);
}

function readValues () {

    var val;
	
	if (val=getCookie('videoSelect')) {videoSelect.selectedIndex = val}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}