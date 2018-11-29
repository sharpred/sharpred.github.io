$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
        $("input[name='code']").val(params.get("code"));  
    } else {
        console.log("no code supplied");
    }
});
