var clientID="Client-ID 8d48f783ed457e5";
var albumID="gaaRv";
var albumHash="MESgLblEWhhUKeb";

function imgurUpload() {

try {
    var img = document.getElementById('canvas').toDataURL('image/jpeg', 0.9).split(',')[1];
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
			head.innerHTML="Number of drawings: <b>"+response.data.images_count+"</b>";
			var html=""; 
			for(var i = response.data.images_count-1; i >=0 ; i--){		
				var date= new Date(parseFloat(response.data.images[i].datetime)*1000);
				var dateString=formatDate(date);
				html+="<a href=\""+response.data.images[i].link+"\">";
				html+="<img width=\""+imageWidth+"\" src=\""+response.data.images[i].link+"\"></a>";
				html+="<h3><a href=\""+response.data.images[i].link+"\" download=\"Anaglyph3d.jpg\">Download</a>";
				html+="	- Created "+dateString+"</h3>";	
			}
			tag.innerHTML=html;
        } else {
			tag.innerHTML="<b>Error:"+response.error+"</b>";
		}
    }
});
}
