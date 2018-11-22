      navigator.getUserMedia = ( navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia);

      var video;
      var webcamStream;

      function startWebcam() {
        if (navigator.getUserMedia) {
           navigator.getUserMedia (
              {
                 video: true,
                 audio: false
              },

              // successCallback
              function(localMediaStream) {
                 video = document.querySelector('video');
                 video.src = window.URL.createObjectURL(localMediaStream);
                 webcamStream = localMediaStream;
              },

              function(err) {
                 console.log("The following error occured: " + err);
              }
           );
        } else {
           console.log("getUserMedia not supported");
        }  
      }

      var canvas, ctx, dataURL;

      function init() {
        canvas = document.getElementById("myCanvas");
        ctx = canvas.getContext('2d');
      }

      function snapshot() {
        ctx.drawImage(video, 0,0, canvas.width, canvas.height);
        download(canvas, 'test.png')
        uploadEx();
      }

      function uploadEx() {
        var canvas = document.getElementById("myCanvas");
        var dataURL = canvas.toDataURL('image/jpeg', 0.5);
    		var blob = dataURItoBlob(dataURL);
        var file = new File([blob], "imageFilename.png", {type: contentType, lastModified: Date.now()});
       
        var form = document.getElementById('formID');
        var formData = new FormData(form);

        var f = document.createElement('document');
        f.id = 'document'
        f.name = 'document'

        formData.append('document', file);
        formData.append('csrfmiddlewaretoken', '{{ csrf_token }}');
        var xhr = new XMLHttpRequest();
          
        xhr.open('POST', form.getAttribute('action'), true);
        xhr.send(formData);

		    //myForm.submit();
      }; 
	  
    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = window.atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // convert to byte Array
        var array = [];
        for(var i = 0; i < byteString.length; i++) {
            array.push(byteString.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type:mimeString});
    }

	/* Canvas Donwload */
	//  function download(canvas, filename) {
	//	    /// create an "off-screen" anchor tag
	//	    var lnk = document.createElement('a'), e;
	//	
	//	    /// the key here is to set the download attribute of the a tag
	//	    lnk.download = filename;
	//	
	//	    /// convert canvas content to data-uri for link. When download
	//	    /// attribute is set the content pointed to by link will be
	//	    /// pushed as "download" in HTML5 capable browsers
	//	    lnk.href = canvas.toDataURL("image/png;base64");
	//	
	//	    /// create a "fake" click-event to trigger the download
	//	    if (document.createEvent) {
	//		     e = document.createEvent("MouseEvents");
	//		     e.initMouseEvent("click", true, true, window,
	//						0, 0, 0, 0, 0, false, false, false,
	//						false, 0, null);
	//	
	//		     lnk.dispatchEvent(e);
	//	    } else if (lnk.fireEvent) {
	//		   lnk.fireEvent("onclick");
	//	    }
	//    }      