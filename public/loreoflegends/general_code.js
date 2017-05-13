


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
$("#race_creator").hide(); //$(".Editor").hide();

$("#editor_header_bar").hide();

$("#new_fragment_button").click(function() {
    
    

})

$("#new_race_button").click(function() {
    $("#editor_header_bar").show();

    $("#race_creator").show();
    $("#content_viewer").hide();

    //RCA.resetData();

})

$("#new_weapon_button").click(function() {
    $("#editor_header_bar").show();

    $("#weapon_creator").show();
    $("#content_viewer").hide();

    //WCA.resetData();
})

$("#back_cm_button").click(function() {
    //alert("Do you want to save changes or discard data.", "yes", "no", "stay on page")

    $("#editor_header_bar").hide();

    $("#content_viewer").show();
    $("#race_creator").hide();
    

})


})
