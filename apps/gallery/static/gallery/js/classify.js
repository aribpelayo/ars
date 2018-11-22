
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