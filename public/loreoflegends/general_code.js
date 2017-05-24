


$(window).load(function() {

//setup special elements using jquery-ui library
$("button").button();
//$("select").selectmenu(); //breaks the width control of my columns for some reason
$(".TabArea").tabs();
$(".ControlGroup").controlgroup();


//hide the Editor right off the bat
$("#editor_box").hide();
$("#fragment_viewer-lore-edit_header").hide();
//$("#fragment_viewer-lore-edit").hide();
$("#fragment_viewer-fragment-edit").hide();

})
