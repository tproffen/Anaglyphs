// Check if browser is Chrome - if not display warning

function checkBrowser () {

var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");
    
  var warningText='These pages were developed for the Desktop version of '+
                  '<a href="https://www.google.com/chrome/">Google Chrome<a> and might with other browsers.';
  var divId = document.getElementById('warning');
  
  if(isIOSChrome){
     divId.innerHTML = warningText;
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
     divId.style.display = 'none';
  } else { 
     divId.innerHTML = warningText;
  }
}
