var clientID="Client-ID 8d48f783ed457e5";

var albumID="LfdWg";
var albumHash="4lBxvE6KNu7XwH5";

function imgurUpload() {

try {
    var img = document.getElementById('canvas').toDataURL('image/png').split(',')[1];
} catch(e) {
    var img = document.getElementById('canvas').toDataURL().split(',')[1];
}

$.ajax({
    url: 'https://api.imgur.com/3/image',
    type: 'post',
    headers: {
        Authorization: clientID
    },
    data: {
        image: img,
		title: 'Anaglyph Drawings',
		album: albumHash
	},
    dataType: 'json',
    success: function(response) {
        if(response.success) {
			message.innerHTML="<a onclick=\"window.open('DrawingGallery.html', '_blank');\">View gallery</a>";
        } else {
			message.innerHTML="Upload error";
		}
    }
});
}

function imgurGallery() {
	
var tag=document.getElementById('gallery');
var head=document.getElementById('header');

var startIndex = getUrlParameter('startIndex');
var imageWidth=0.9*window.innerWidth;

$.ajax({
    url: 'https://api.imgur.com/3/album/'+albumID,
    type: 'get',
    headers: {
        Authorization: clientID
    },
    dataType: 'json',
    success: function(response) {
        if(response.success) {
			var number=5;
			var start=response.data.images_count;
			if (startIndex>0) {start=startIndex;}
			var end=Math.max(start-number,0);
			
			var header=navigation(start,end,number,response.data.images_count);
			var html=header+"<hr>"; 

			for(var i = start-1; i >=end ; i--){		
				var date= new Date(parseFloat(response.data.images[i].datetime)*1000);
				var dateString=formatDate(date);
				var link=response.data.images[i].link
				var link= link.replace(/http/i, "https");
				html+="<img width=\""+imageWidth+"\" src=\""+link+"\"><br>";
				html+="<p align=\"right\" class=\"small\">Created "+dateString+" -- ";
				html+="<a href=\""+response.data.images[i].link+"\" ";
				html+="download=\"Anaglyph3d.jpg\">Download</a></p><hr>";
			}
			html+=header;
			tag.innerHTML=html;
        } else {
			tag.innerHTML="<tr><td align=\"center\"><b>Error:"+response.error+"</b></td></tr>";
		}
    }
});
}

function navigation (start,end,number,count) {
	
	
	var ret="";
	
	if (start==count) {
		ret+="< Previous";
	} else {
		var index=Math.min(start*1+number*1,count); console.log("Prev ",index,start,number);
		ret+="< <a href=\"DrawingGallery.html?startIndex="+index+"\">Previous</a>";
	}
	
	ret+="&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;";
	
	if (end>0) {
		var index=Math.max(start-number,0); console.log("Next ",index);
		ret+="<a href=\"DrawingGallery.html?startIndex="+index+"\">Next</a> >";				
	} else {
		ret+="Next >";
	}
	
	return ret;
}
