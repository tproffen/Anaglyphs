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

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement2.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function connectStream() {
  if (window.stream) {window.stream.getTracks().forEach(function(track) {track.stop();});}
  
  var videoSource1 = videoSelect1.options[videoSelect1.selectedIndex].value;
  var constraints = {video: {deviceId: videoSource1 ? {exact: videoSource1} : undefined, width: {exact: 320}, height: {exact: 240}}};
  navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
		videoElement1.src = window.URL.createObjectURL(mediaStream);}).catch(handleError);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// Main routine

navigator.mediaDevices.getUserMedia({video:true});
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);


