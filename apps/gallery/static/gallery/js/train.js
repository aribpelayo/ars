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
    passToTrain(image_id, cname);
});

function passToTrain(image_id, cname){
    $.ajax({
      url : /train/,
      type: "POST",
      headers: {"X-CSRFToken":csrftoken},
      data : {'image_id': image_id, 'dir': cname},
      dataType : "text",
      success: function( data ){
        $('#modalRemove').modal('show');
      }
    });
}