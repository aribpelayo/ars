
function timein() {
    const clase = $("#record").text();
    $.ajax({
        url      : "/timein/",   
        type     : "POST",
        headers  : {"X-CSRFToken":csrftoken},
        data     : {"clase":clase},
        datatype : "text",
        success  : function(data) {
            $('#timeinmodal').modal('show');
        }
    });
} 

function timeout() {
    const clase = $("#record").text();
    $.ajax({
        url      : "/timeout/",   
        type     : "POST",
        headers  : {"X-CSRFToken":csrftoken},
        data     : {"clase":clase},
        datatype : "text",
        success  : function(data) {
            $('#timeoutmodal').modal('show');
        }
    });
} 

function reclassify() {
    const data = $("#choice option:selected").text();
    console.log(data)
    $.ajax({
        url      : "/reclassify/",
        type     : "POST",
        headers  : {"X-CSRFToken":csrftoken},
        data     : {"retData":data},
        datatype : "json",
        success  : function(data) {
            $('#myModal').modal('show');
        }
    });
}