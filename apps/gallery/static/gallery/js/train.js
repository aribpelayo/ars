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

$('.img-wrap .close').on('click', function() {
    const image_id = $(this).closest('.img-wrap').find('img').data('id');
    const cname = $(this).closest('.holder').find('span').data('sid');
    passToTrain(image_id, cname, 1);
});

$('.prim').on('click', function() {
    const cname = $(this).closest('.holder').find('button').data('name');
    $('#retrainWait').modal('show');
    passToTrain(null, cname, 0)
});

function passToTrain(image_id, cname, remove){
  $.ajax({
    url : /train/,
    type: "POST",
    headers: {"X-CSRFToken":csrftoken},
    data : {'image_id': image_id, 'dir': cname, 'rmv':remove},
    dataType : "text",
    success: function( data ){
      console.log(data)
      if(data == "done"){
        $('#modalRemove').modal('show');
      }else if(data == "train"){
        $('#retrainWait').modal('hide');
      }else{
        $('#retrainWait').modal('hide');
        $('#modalError').modal('show');
      }
    }
  });
}