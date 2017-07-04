


$(window).load(function() {

//setup special elements using jquery-ui library
$("button").button();
$("select").selectmenu(); //breaks the width control of my columns for some reason
$(".TabArea").tabs();
$(".ControlGroup").controlgroup();


//hide the Editor right off the bat
$("#editor_box").hide();
$("#fragment_viewer-lore-edit_header").hide();
$("#fragment_viewer-lore-edit").hide();
$("#fragment_viewer-fragment-edit").hide();


generateRandomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

})

//capatalize the first letter of each word
capitalizeEachWord = function(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
