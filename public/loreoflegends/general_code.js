


$(window).load(function() {

//setup special elements using jquery-ui library
$("button").button();
//$("select").selectmenu(); //breaks the width control of my columns for some reason
$(".TabArea").tabs();
$(".ControlGroup").controlgroup();
//$("#fragments_list-tree").jstree();

//Header button logic
$("#new_fragment_button").click(function(){
              
});

//hide the Editors right off the bat
$("#editor_box").hide();

$("#new_description_button").click(function(){
    $("#editor_box").show();
})



})
