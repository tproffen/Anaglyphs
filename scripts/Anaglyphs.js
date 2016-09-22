// Check if browser is Chrome - if not display warning

function checkBrowser () {

var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");
    
  var warningText='These pages were developed for the Desktop version of '+
                  '<a href="https://www.google.com/chrome/">Google Chrome<a> and might <b>not</b> with other browsers.';
  var divId = document.getElementById('warning');
  
  if(isIOSChrome){
     divId.innerHTML = warningText;
     divId.style.display = 'block';
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
     divId.style.display = 'none';
  } else { 
     divId.innerHTML = warningText;
     divId.style.display = 'block';
  }
}

// Cookie related routines

function setCookie (name, value) {
	
	var today = new Date();
	var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
    document.cookie=name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

