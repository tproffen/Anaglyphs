// Check if we are on iOS

function iOS () {
	
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Cookie related routines

function setCookie (cname, cvalue) {
	
    var d = new Date();
    d.setTime(d.getTime() + (30*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
	
}

function getCookie (cname) {
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

// Date stuff

function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct","Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var hours = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();
  

  return monthNames[monthIndex]+' '+str_pad(day)+', '+year+' at '+str_pad(hours)+':'+str_pad(min)+':'+str_pad(sec);
}

function str_pad(n) {
    return String("00" + n).slice(-2);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
