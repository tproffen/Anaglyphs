'use strict';

var videoElement1 = document.getElementById('video1');
var videoElement2 = document.getElementById('video2');
var videoSelect1 = document.getElementById('videoSource1');
var videoSelect2 = document.getElementById('videoSource2');
var videoRes1 = document.getElementById('resolution1');
var videoRes2 = document.getElementById('resolution2');
var snapButton = document.getElementById('snap');
var xOffset = document.getElementById('xOffset');
var canvas = document.getElementById('canvas');
var typeAna = document.getElementById('type_ana');
var typeSbs = document.getElementById('type_sbs');

var canvasLeft = document.createElement('canvas');
var canvasRight = document.createElement('canvas');
var canvasFish = document.createElement('canvas');

var contextLeft = canvasLeft.getContext('2d');
var contextRight = canvasRight.getContext('2d');
var contextFish = canvasFish.getContext('2d');
var context = canvas.getContext('2d');

checkBrowser();

// This is the capture size of the camera

var width=1920;
var height=1080;

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
	typeAna.addEventListener("change", compositeImage, false);
	typeSbs.addEventListener("change", compositeImage, false);
	download.addEventListener("click", compositeImage, false);
	
	window.addEventListener("resize", determineSizes, false);
	window.addEventListener("unload", writeValues, false);

	videoElement1.onloadedmetadata = function () {
		videoRes1.innerHTML=videoElement1.videoWidth + "x" + videoElement1.videoHeight;
	}
	videoElement2.onloadedmetadata = function () {
		videoRes2.innerHTML=videoElement2.videoWidth + "x" + videoElement2.videoHeight;
	}
	
	drawWelcome();
}

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

	compositeImage();
}

function updateCanvasLinks () {
	
	canvasDownload(canvasLeft,"download1","Left.png");
	canvasDownload(canvasRight,"download2","Right.png");
 	canvasDownload(canvas,"download","Image3D.png");	
}

function canvasDownload (canvas,download,name) {
	
	canvas.toBlob(function(blob) {
		var url=URL.createObjectURL(blob);
		document.getElementById(download).download=name;
		document.getElementById(download).href=url;
	}, "image/png");
	
}

function compositeImage (fcapture) {

	if (typeAna.checked) {
		compositeImageAna();
	}
	if (typeSbs.checked) {
		compositeImageSbs();
	}
}

function compositeImageSbs () {

	var offX= xOffset.valueAsNumber * width;
    var k4=0.22;
	var k2=0.51;
	
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);
		
	var pixels = contextLeft.getImageData(width/4, 0, width/2, height);
	pixels = barrelDistortion(pixels, k2, k4);
	contextFish.putImageData(pixels, 0, 0);
	context.drawImage(canvasFish,  0, 0, width/2, height, 0,       0, width/2, height);

	pixels = contextRight.getImageData(width/4+offX, 0, width/2, height);
	pixels = barrelDistortion(pixels, k2, k4);
	contextFish.putImageData(pixels, 0, 0);
	context.drawImage(canvasFish, 0, 0, width/2, height, width/2, 0, width/2, height);
	
	// middle line
	
	context.strokeStyle = '#dddddd';
	context.lineWidth = 5.0;
	context.beginPath();
	context.moveTo(width/2, 20);
	context.lineTo(width/2, height-20);
	context.closePath();
	context.stroke();
	
	setTimeout(updateCanvasLinks, 100);
}

function compositeImageAna () {
	
	var wR=0.21, wG=0.72, wB=0.07;
	
	var offX= xOffset.valueAsNumber * width;

	var imageRight = contextRight.getImageData(0, 0,width, height);
	var imageLeft = contextLeft.getImageData(0, 0, width, height);
	
	context.clearRect(0, 0, width, height);
	context.putImageData(imageLeft, offX, 0);
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
	context.putImageData(imageRight,-offX/2, 0, offX, 0, width, height);

	setTimeout(updateCanvasLinks, 100);

}

function determineSizes () {
	
	var padW=595;
	var padH=80;
	
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
	
	setCookie('xOffset',document.getElementById('xOffset').value)
	setCookie('videoSelect1', videoSelect1.selectedIndex)
	setCookie('videoSelect2', videoSelect2.selectedIndex)
	setCookie('typeSbs', typeSbs.checked)
	setCookie('typeAna', typeAna.checked)
	
}

function readValues () {

    var val;
	
	if (val=getCookie('xOffset')) {document.getElementById('xOffset').value = val}
	if (val=getCookie('videoSelect1')) {videoSelect1.selectedIndex = val}
	if (val=getCookie('videoSelect2')) {videoSelect2.selectedIndex = val}
	if (val=getCookie('typeAna')) {typeAna.checked = val}
	if (val=getCookie('typeSbs')) {typeSbs.checked = val}
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}

function barrelDistortion(pixels,fa,fb) {
	
  var d = pixels.data;
  var width = pixels.width;
  var height = pixels.height;
  var xmid = width/2;
  var ymid = height/2;
  var rMax = Math.sqrt(Math.pow(xmid,2)+Math.pow(ymid,2));

  var pix2D = new Array(pixels.height);
  for (var y = 0; y < pixels.height; y++) {
    pix2D[y] = new Array(pixels.width);
    for (var x = 0; x < pixels.width; x++) {
      var i = x * 4 + y * 4 * pixels.width;
      var r = pixels.data[i],
          g = pixels.data[i + 1],
          b = pixels.data[i + 2],
          a = pixels.data[i + 3];
          
      var pr = Math.sqrt(Math.pow(xmid-x,2)+Math.pow(ymid-y,2)); //radius from pixel to pic mid
      var sf = pr / rMax; //Scaling factor
      var newR = pr*(fa*Math.pow(sf,4)+fb*Math.pow(sf,2)+1); //barrel distortion function
      var alpha = Math.atan2(-(y-ymid),-(x-xmid)); //Get angle from pic mid to pixel vector
      var newx = Math.abs(Math.cos(alpha)*newR-xmid); //get new x coord for this pixel
      var newy = Math.abs(Math.sin(alpha)*newR-ymid); //get new y coord for this pixel
      var gnRadius = Math.sqrt(Math.pow(xmid-newx,2)+Math.pow(ymid-newy,2)); //New radius (with new x - y values)
      pix2D[y][x] = [r,g,b,a,newx,newy,newR, gnRadius]; //Make new y*x picture for reading pixels
    }
  }

  //Build new picture out of pix2D data
  var cnt = 0;
  var inn = 0;
  for (var y = 0; y < pix2D.length; y++) {
    for (var x = 0; x < pix2D[y].length; x++) {
      var tx = Math.round(pix2D[y][x][4]);
      var ty = Math.round(pix2D[y][x][5]);
      var newr = pix2D[y][x][6];
      var gnRadius = pix2D[y][x][7];
      if(Math.floor(newr) == Math.floor(gnRadius) && tx>=0 && tx <width && ty>=0 && ty <height) {   
        pixels.data[cnt++] = pix2D[ty][tx][0];
        pixels.data[cnt++] = pix2D[ty][tx][1];
        pixels.data[cnt++] = pix2D[ty][tx][2];
        pixels.data[cnt++] = 255;
      } else {
        pixels.data[cnt++] = 0;
        pixels.data[cnt++] = 0;
        pixels.data[cnt++] = 0;
        pixels.data[cnt++] = 255;
      }
    }
  }
  return pixels;
}

