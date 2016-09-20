'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');

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
	var constraints = {video: {deviceId: videoSource1 ? {exact: videoSource1} : undefined, width: {exact: 320}, height: {exact: 240}}};
	navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {videoElement1.srcObject = mediaStream;}).catch(handleError);
  
	var videoSource2 = videoSelect2.options[videoSelect2.selectedIndex].value;
	var constraints = {video: {deviceId: videoSource2 ? {exact: videoSource2} : undefined, width: {exact: 320}, height: {exact: 240}}};
	navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {videoElement2.srcObject = mediaStream;}).catch(handleError);

}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// Main routine

navigator.mediaDevices.getUserMedia({video:true});
navigator.mediaDevices.enumerateDevices().then(gotDevices).then(connectStream).catch(handleError);

videoSelect1.addEventListener("change", connectStream, false);
videoSelect2.addEventListener("change", connectStream, false);


