//TODO:
// * break up code into several files
// * use a key combo like ctrl+click to delete race parts so we don't accidentally delete things either when trying to select of by a stray click.
// * add more filters like by system, avine/mamal (not sure how to add that), ect??(ask swords)
// * add help button and help popup
// * try to reduce the calls to capitalizeEachWord
// * Do something with tissues instead of dumping them in the systems list
// * improve efficency of the region filter (it almost noticably lags)



$(window).load(function() {

//turns on and off the query string save process
var race_creator_standalone = race_creator_standalone || false

race_creator_applet = {};
var RCA = race_creator_applet

//self explanitory utility function
RCA.capitalizeEachWord = function(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

//setup help text
$("#editor_help_button").click(function(){
    $("#race_help_dialog").show()
})

$("#race_help_dialog").hide()


//first part is to setup the bio-part buttons

//function for selecting any button when clicked
RCA.select_onclick = function(){
    if( $(this).hasClass("Selected") ){
        $(this).removeClass("Selected");
    } else {
        $(this).addClass("Selected");
    }
}

//adds checkboxes from a list of elements
// takes a list of checkboxes to add, the id for the html element to add them to, and text to add as a label if the list is empty
RCA.add_checkboxes = function(element_list, fieldset_id, empty_label){

    //html template for the checkboxes
    var labelTemplate = '<label for="#{id}">#{label}</label>'
    var checkboxTemplate = '<input type="radio" name="'+fieldset_id+'" id="#{id}">';

    //drop all content in the given html element
    $("#"+fieldset_id).empty()

    if (element_list.length > 0){

        //loop through regions and add them to region select
        for (var element in element_list) {
            element = element_list[element]
            
            $("#"+fieldset_id).append(
                  labelTemplate.replace(/#\{id\}/g, "checkbox-"+element+"_add")
                               .replace( /#\{label\}/g, RCA.capitalizeEachWord(element) )
            )

            $("#"+fieldset_id).append(
                  checkboxTemplate.replace(/#\{id\}/g, "checkbox-"+element+"_add")
            )
            $("#checkbox-"+element+"_add").checkboxradio();
        }
        
    //no items listed
    } else {

        $("#"+fieldset_id).append(
                  labelTemplate.replace(/#\{id\}/g, "checkbox-"+empty_label+"_add")
                               .replace( /#\{label\}/g, RCA.capitalizeEachWord(empty_label) )
            )

            $("#"+fieldset_id).append(
                  checkboxTemplate.replace(/#\{id\}/g, "checkbox-"+empty_label+"_add")
            )
            $("#checkbox-"+empty_label+"_add").checkboxradio();
    }
}


//update part info window when new part is hovered
RCA.biopart_onhover = function(){
    var part_id = $(this).attr("internal_id");
    var part_data = race_bio_parts[part_id];

    //reset any error messages
    $("#errormsg").html("")

    //setup name and description fields
    $("#race_creator_part_name").text(RCA.capitalizeEachWord(part_data["name"]));
    $("#race_creator_part_appearance").text(part_data["appearance"]);
    $("#race_creator_part_function").text(part_data["functional"]);


    //Build region select buttons. if there are no regions listed call it "regionless"
    RCA.add_checkboxes(part_data["regions"], "race_creator_select_region", "Regionless");

    //Setup System select buttons.
    RCA.add_checkboxes(part_data["systems"], "race_creator_select_system", "No Applicable Systems");
    
    //setup the functional type buttons. They are always the same 3
    var functional_type_buttons = ["Cosmetic", "Balanced", "Beneficial"];
    RCA.add_checkboxes(functional_type_buttons, "race_creator_select_function", "");

}

RCA.createBiopartButtons = function(){
    //add a button for each part to the bioparts button list
    for (var part_name in race_bio_parts) {
        $("#race_creator_bio_parts").append(
            $('<button internal_id="'+part_name+'" id="bio_part_'+part_name+'">'+RCA.capitalizeEachWord(part_name)+'</button>')
                .mouseover(RCA.biopart_onhover)
                .click(RCA.select_onclick)
                .button() //jquery-ui button styling function
        )
    }
}

//**second part is to setup the filter buttons**
RCA.createFilterOptions = function(){

    //show all biopart buttons. clears other filters.
    var show_all_filter = function(){
        $("#race_creator_bio_parts button").show();
        $('#race_creator_filters-region').val("any");
        $('#race_creator_filters-system').val("any");
        $('#race_creator_filters-tissue').val("any");
    }

    //show only selected parts
    var selected_filter = function(){
        show_all_filter(); //un-hide everything

        $("#race_creator_bio_parts button:not(.Selected)").hide();
    }

    //function that creates a region filter function for each region
    var region_filter = function(region){
        return function() {
            $("#race_creator_bio_parts button").hide();

            for (requested_part in race_bio_regions[region]) {
                $("#race_creator_bio_parts button[internal_id="+requested_part+"]").show();
            }
        }
    }

    var system_filter = function(system){

    }
    

    //setup filter buttons
    
    $("#all_race_filter").click(show_all_filter).button() 
    //* .button() is from jquery-ui for button styling 

    $("#selected_race_filter").click(selected_filter).button() 
    //* .button() is from jquery-ui for button styling 


    //setup dropdown filters
    var dropdown_changed = function(){

        //function to search for an element in one of the indexed lists
        //returns true if given comparison is in given list. otherwise returns false
        var element_search = function(comparison, part_list) {
            //loop over part list and see if the biopart is in it.
            var requested_part = "";
            for (requested_part in part_list) {
                requested_part = part_list[requested_part];

                if(requested_part == comparison) return true;
            }
            return false;
        }


        //get all filter values
        var region = $("#race_creator_filters-region").val();
        var system = $("#race_creator_filters-system").val();
        var tissue = $("#race_creator_filters-tissue").val();

        //hide all buttons
        $("#race_creator_bio_parts button").hide();

        $.each($("#race_creator_bio_parts button"), function() {
            var region_match, system_match, tissue_match;
            var bio_part = $(this); //the bio_part the button represents
            var bio_part_id = bio_part.attr("internal_id"); //id representing the part

            //test region match
            if (region == "any") region_match = true;
            else region_match = element_search(bio_part_id, race_bio_regions[region]);

            //test system match
            if (system == "any") system_match = true;
            else system_match = element_search(bio_part_id, race_bio_systems[system]);

            //test tissue match
            if (tissue == "any") tissue_match = true;
            else tissue_match = element_search(bio_part_id, race_bio_tissues[tissue]);
            
            //If all filter criteria match show the button
            if (region_match && system_match && tissue_match) {
                bio_part.show()
            }

        });        
    }

    //set the above function to call when any dropdown filter is changed
    $("#race_creator_filters-region").change(dropdown_changed);
    $("#race_creator_filters-system").change(dropdown_changed);
    $("#race_creator_filters-tissue").change(dropdown_changed);


    //populate each dropdown menu with the proper options

    //regions
    $.each(race_bio_regions, function(key, value) {   
     $('#race_creator_filters-region')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(RCA.capitalizeEachWord(key))); 
    });

    //systems
    $.each(race_bio_systems, function(key, value) {   
     $('#race_creator_filters-system')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(RCA.capitalizeEachWord(key))); 
    });

    //tissues
    $.each(race_bio_tissues, function(key, value) {   
     $('#race_creator_filters-tissue')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(RCA.capitalizeEachWord(key))); 
    });

}
    

//next part is to setup the Race Summery section 

//list of parts for the current build
RCA.race_creator_build_parts = [];

//delete the part from the race summary and part list
RCA.delete_part_onclick = function(){
    //remove the part from thepart list
    var index = $(this).attr("id").replace("RP", "");
    RCA.race_creator_build_parts[index] = null;

    //remove element from race summery
    $(this).remove()

    //save data
    if (race_creator_standalone == true) {
        //update query string
        RCA.updateQueryString()
    } else {
        //send data via ajax
        //RCA.updateServerData();
    }
}

//add an item to the race summary section
RCA.addRacePart = function(part_data) {
    //build part string
    part_text = RCA.capitalizeEachWord(part_data["name"]) + " (";

    for (var attr in part_data) {
        if (attr == "name") { continue; }
        part_text += RCA.capitalizeEachWord(part_data[attr]) + ", ";
    }

    //cut out extra comma and add ending parenthesis
    part_text = part_text.substr(0, part_text.length-2) + ")";

    //part id for removing parts later
    var id = "RP" + RCA.race_creator_build_parts.length;
    var region = part_data["race_creator_select_region"] || "regionless";

    region = region.replace(" ", "_").toLowerCase(); //html id's cannot have spaces
    console.log(region)
    $("#race_creator_summery_"+region)
        .append("<li id=\""+id+"\">"+part_text+"</li>");
    $("#race_creator_summery_"+region+" li")
        .click(RCA.delete_part_onclick);

    //flash race summery button to indicate it has been updated
    $("#race_creator_display-summary-tab")

    //add part to parts list so we can generate the new save query
    RCA.race_creator_build_parts.push(part_data);

    //save data
    if (race_creator_standalone == true) {
        //update query string
        RCA.updateQueryString()
    } else {
        //send data via ajax
        //RCA.updateServerData();
    }
}

RCA.setupRaceSummary = function() {
    //attach an event to add the selected part
    $("#race_creator_add_new_part").click(function() {
        //reset any error messages
        $("#errormsg").html("")

        //add apropriate error messages
        if ( $("#race_creator_display-part_info input[type=radio]:checked").length < 3) {
            $("#errormsg").append("<li>Not added! You must select a \
                                    setting from each of the 3 sections below.</li>");
            return;
        }

        //create dict to store the new part
        var part_data = {};

        //build a dictionary that contains the part's attrabutes
        part_data["name"] = $("#race_creator_part_name").text();
        var att_name;
        $.each($("#race_creator_display-part_info input[type=radio]:checked"), function() {
            att_name = $($(this).parent()).attr("id");

            part_data[att_name.toLowerCase()] = $(this).attr("id").replace("checkbox-", "").replace("_add", "");
        });
        
        //actually add the part info to the race summery
        RCA.addRacePart(part_data);

        //tell user part has been added
        $("#errormsg").append("<li>The part has been added! See Race Summery Tab.</li>");
    });

    //add the Race part region headers.    
    var i = 0;
    for(region in race_bio_regions) {
        var side_to_add = "#race_creator_chosen_parts-left"

        //everything in the upper half of the list gets added to the right hand column
        if(i > Object.keys(race_bio_regions).length/2){ side_to_add = "#race_creator_chosen_parts-right"; }

        $(side_to_add).append("<h4>"+RCA.capitalizeEachWord(region)+"</h4>")
                              //html id's cannot have spaces
                      .append("<ul id=\"race_creator_summery_"+region.replace(" ", "_")+"\"></ul>")
        
        //increment count used to determin column
        i++;
    }
}


//Parse query string
//Modified from: http://stackoverflow.com/a/13896633
RCA.parseRaceFromQuery = function(str) {

    if(typeof str != "string" || str.length == 0) return {};

    //decodes things like , : ; ect from %** form to their respective characters
    str = decodeURIComponent(str)

    var s = str.split("&");
    var bit, parts = [], cur_part = {}, part_attr;

    for(var i = 0; i < s.length; i++) {
        //form of each part is <part name>=<part attrabutes> where attrabutes are
        //  seperated by ; and are key value pairs of the form <att name>:<att val>

        //seperate the part between it's name and attrabutes
        bit = s[i].split("=");
        name = bit[0];

        //skip if name is invalid
        if(name.length == 0) { continue; }

        //break out the part's attrabutes
        part_attr = bit[1];
        
        part_attr = part_attr.split(";");

        //setup part attrabutes
        cur_part["name"] = name;
        for (var pair in part_attr) {
            pair = part_attr[pair].split(":");
            cur_part[pair[0]] = pair[1];
        }
   
        //add part to return value and reset current part for the next loop
        parts.push(cur_part);
        cur_part = {};
    }

    return parts;
}

//Builds a query string
RCA.saveRaceToQuery = function(params) {

    var full_str = "", part_str = "";

    for (part in params) {
        part = params[part]

        //skip deleted entries
        if (part == null) { continue; }

        //part name is used as the query string's key
        part_str = part["name"]+"=";
            
        //go through each part of info that needs saving
        var keys = Object.keys(part);
        for (var key in keys) {
            key = keys[key];

            if (key == "name") { continue; } //skip name entry
                
            if (typeof part[key] == Array) {
                 part_str += key + ":" + part[key].join(",") + ";";
            } else {
                part_str += key + ":" + part[key] + ";";
            }
        }

        //cut out extra ; and add part to the full string
        full_str += part_str.substring(0, part_str.length-1) + "&"
    }
    
    //return all but the last character (which is an extra &
    return encodeURIComponent(full_str.substring(0,full_str.length-1).toLowerCase());
}

//updates the URL with a new query string. Ussually run after altering the list
//  of chosen parts.
RCA.updateQueryString = function() {
    //get new race query string
    var race_str = RCA.saveRaceToQuery(RCA.race_creator_build_parts);

    //A little clunky but I wanted to make sure this was portable
    //  basiclly just gets the "file" name of the current page (index.html)
    var path_list = document.location.pathname.split("/")
    var page_name = path_list[path_list.length-1];

    //create new url based on the race query string.
    var updated_url = "";
    if (race_str.length > 0) {
        updated_url = page_name+"?"+race_str;
    } else {
        updated_url = page_name;
    }

    //push the new url to the url bar without reloading the page
    //  (we do this so selected buttons don't get nerfed)
    window.history.pushState({path:updated_url},'',updated_url)

    //also update text box
    $("#RaceURL").val(document.location.href);
}

RCA.loadFromQueryString = function() {
    //see if there is a query string with race info.
    var loaded_race = RCA.parseRaceFromQuery( document.location.search.substring(1) )

    //there is one. load it.
    if (loaded_race.length != 0) {
        for (var part_data in loaded_race) {
            part_data = loaded_race[part_data];            
            console.log(part_data)
            //add part to the race summery window
            //if it is the special info race name update the race name instead
            if (part_data.name == "race name") {
                $("#RaceName").val(part_data["race name"]);            

            //if it is the special name description update the description field
            } else if (false) {

            //it is a normal button so we can just add it
            } else {
                RCA.addRacePart(part_data);
            }
        }
    }
}

//Run functions

RCA.createBiopartButtons();
RCA.createFilterOptions();
RCA.setupRaceSummary();

//Load data
if (race_creator_standalone == true) {
    //load data from the query string
    RCA.loadFromQueryString();
} else {
    //load data via ajax
    //RCA.loadFromServerData();
}


});
