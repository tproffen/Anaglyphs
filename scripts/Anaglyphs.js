// Check if browser is Chrome - if not display warning

function checkBrowser (divId) {

var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  if(isIOSChrome){
     divId.innerHTML = 'These pages were developed for the Desktop version of <a href="https://www.google.com/chrome/">Google Chrome<a> and might not work on iOS.';
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
     divId.innerHTML = '';
  } else { 
    divId.innerHTML = 'These pages were developed for the Desktop version of Chrome and might not work on other browsers.';
  }
}
