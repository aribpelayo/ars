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

        init();
      }

      var canvas, ctx, dataURL;

      function init() {
        canvas = document.getElementById("myCanvas");
        ctx = canvas.getContext('2d');
      }

      function snapshot() {
        ctx.drawImage(video, 0,0, canvas.width, canvas.height);
        capture();
        $('#myPleaseWait').modal('show');
      }
      

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie != '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  const csrftoken = getCookie('csrftoken');

  function capture(){
    html2canvas($("#myCanvas")[0]).then(function(canvas) {
      sendImageToServer(canvas, '/snap/');
    });
  }

  function sendImageToServer (canvas, url) {
    function onBlob (blob) {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        const base64data = reader.result.split(",")[1];
        $.ajax({
          url : url,
          type: "POST",
          headers: {"X-CSRFToken":csrftoken},
          data : {'image_data': base64data},
          dataType : "json",
          success: function( data ){
              console.log(data)
              if(data.clase == 'null'){
                $("#class").text('This person is not found in database.');
                $("#score").text('Please contact administrator');
              }else{
                $("#class").text('Welcome, ' +data.clase);
                $("#score").text('Your image score is about ' +data.score+'%');
                $('#timein').show();
              }
              
              var output = [];
              $.each(data.classif, function(key, value)
              {
                output.push('<option value="'+ key +'">'+ value +'</option>');
              });
              $('#choice').html(output.join(''));
              $('#choice').show();
              $('#note').show();
              $('#reclassifyBtn').show();
              $('#myPleaseWait').modal('hide');
          }
        });
      }
    }
    canvas.toBlob(onBlob, 'image/png', 0.95);
  }      