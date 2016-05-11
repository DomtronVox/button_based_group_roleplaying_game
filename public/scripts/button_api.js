
$(window).load(function() {

button_ui = {};


//ID's are handed out to button elements so we can attach events,
button_ui.id = 0;
button_ui.getNextID = function() {
    button_ui.id++;
    return button_ui.id;
}


//clear the action button list
//  id: str, button list from which to remove all buttons
button_ui.clearButtonList = function(id, header_text) {
    if ( $("#"+id).length == 0 ) {
        console.log("Invalid button list type passed to clearButtons: "+id);
    } else {
        $("#"+id).html("<h4>"+header_text+"</h4>");
    }
};


//adds a set of buttons to a given button list
//  list_id: str; button list to add the buttons to (Actions, Objects, Characters)
//  buttons: object; array of button data. expects id and text
button_ui.addButtonsToElement = function(list_id, buttons) {
    //if ( $("#"+list_id).length == 0 ) {
    //    console.log("Invalid button list type passed to addToButtonList: "+id);
    //    return;
    //}

    //TODO: check typeof buttons and wrap in an array if it is a single object.
    

    for (var button in buttons) {
        button = buttons[button];
        var element_id = button_ui.getNextID();
        
        //add a new button to the button list.
        $("#"+list_id).append("<div id=\""+element_id+"\" internal_id=\""+button.id+"\" class=\"Button "+list_id+"\">"+button.text+"</div>");

        //setup button click if a function is provided
        if (button.onclick != undefined) {
            $("#"+element_id).click(button.onclick);
        }

        //setup button hover if a function is provided
        if (button.onhover != undefined) {
            $("#"+element_id).hover(button.onhover);
        }
    }
};


});
