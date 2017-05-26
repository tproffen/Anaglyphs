'use strict';

var videoElement = document.getElementById('video');
var videoSelect = document.getElementById('videoSource');
var videoRes = document.getElementById('resolution');
var snapButton = document.getElementById('snap');
var typeField = document.getElementById('type');

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

checkBrowser();

// This is the capture size of the camera

var width=512;
var height=width;

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
	
	context.drawImage(videoElement, 0, 0, width, height);
	var img = context.getImageData(0, 0, width, height);
	var i;
	var ampReal =[];
	var ampImag = [];
	
	FFT.init(width);
	FrequencyFilter.init(width);
	SpectrumViewer.init(context);
	
	for(var y=0; y<height; y++) {
		i = y*width;
		for(var x=0; x<width; x++) {
			ampReal[i + x] = img.data[(i << 2) + (x << 2)];
			ampImag[i + x] = 0.0;
		}
	}
	
	FFT.fft2d(ampReal, ampImag); 
    FrequencyFilter.swap(ampReal, ampImag);
	SpectrumViewer.render(ampReal, ampImag, true);
}

function determineSizes () {
	
	var padW=10;
	var padH=200;
	
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
	setCookie('ampl', ampl.checked);
	setCookie('real', real.checked);
	setCookie('imag', imag.checked);
}

function readValues () {

    var val;
	
	if (val=getCookie('videoSelect')) {videoSelect.selectedIndex = val}
	if (val=getCookie('ampl')) {ampl.checked = val}
	if (val=getCookie('real')) {real.checked = val}
	if (val=getCookie('imag')) {imag.checked = val}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}