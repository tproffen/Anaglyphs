'use strict';

var videoElement1 = document.querySelector('video1');
var videoElement2 = document.querySelector('video2');
var videoSelect1 = document.querySelector('select#videoSource1');
var videoSelect2 = document.querySelector('select#videoSource2');
var selectors = [videoSelect1, videoSelect2];

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  var values = selectors.map(function(select) {
    return select.value;
  });
  selectors.forEach(function(select) {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
	  console.log('Video device: ', deviceInfo);
      var option = document.createElement('option');
	  option.value = deviceInfo.deviceId;
      option.text = deviceInfo.label || 'camera ' + (videoSelect1.length + 1);
      videoSelect1.appendChild(option);

      var option = document.createElement('option');
	  option.value = deviceInfo.deviceId;
      option.text = deviceInfo.label || 'camera ' + (videoSelect2.length + 1);
      videoSelect2.appendChild(option);
    }
  }
  selectors.forEach(function(select, selectorIndex) {
    if (Array.prototype.slice.call(select.childNodes).some(function(n) {
      return n.value === values[selectorIndex];
    })) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream1(stream) {
  window.stream = stream; // make stream available to console
  videoElement1.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function gotStream2(stream) {
  window.stream = stream; // make stream available to console
  videoElement2.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  var videoSource1 = videoSelect1.value;
  var constraints = {
    video: {deviceId: videoSource1 ? {exact: videoSource1} : undefined, width: {exact: 320}, height: {exact: 240}}
  };
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream1).then(gotDevices).catch(handleError);
	  
  var videoSource2 = videoSelect2.value;
  var constraints = {
    video: {deviceId: videoSource2 ? {exact: videoSource2} : undefined, width: {exact: 320}, height: {exact: 240}}
  };
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream2).then(gotDevices).catch(handleError);

}

videoSelect1.onchange = start;
videoSelect2.onchange = start;

start();

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}
