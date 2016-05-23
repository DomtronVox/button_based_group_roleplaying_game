//TODO:
// * break up code into several files
// * use a key combo like ctrl+click to delete race parts so we don't accidentally delete things either when trying to select of by a stray click.
// * add sorting buttons like A-Z, Z-A, By System, By Region
// * add more filters like by system, avine/mamal (not sure how to add that), ect??(ask swords)
// * add help button and help popup
// * try to reduce the calls to capitalizeEachWord
// * Do something with tissues instead of dumping them in the systems list
// * improve efficency of the region filter (it almost noticably lags)
// * fix issue where bioparts section resizes when the contents change



$(window).load(function() {

race_creator_applet = {};
var RCA = race_creator_applet

//self explanitory utility function
RCA.capitalizeEachWord = function(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

    //first part is to setup the bio-part buttons

    //function for selecting any button when clicked
RCA.select_onclick = function(){
    if( $(this).hasClass("Selected") ){
        $(this).removeClass("Selected");
    } else {
        $(this).addClass("Selected");
    }
}

RCA.limited_select_onclick = function(){
    if( $(this).hasClass("Selected") ){
        $(this).removeClass("Selected");
    } else {
        $(this).parent().children().removeClass("Selected");
        $(this).addClass("Selected");
    }
}

//update part info window when new part is hovered
RCA.biopart_onhover = function(){
    var part_id = $(this).attr("internal_id");
    var part_data = race_bio_parts[part_id];

    //reset any error messages
    $("#errormsg").html("")

    //setup name and description fields
    $("#NameText").text(RCA.capitalizeEachWord(part_data["name"]));
    $("#ApearenceText").text(part_data["appearance"]);
    $("#FunctionText").text(part_data["functional"]);


    //Build region select buttons. if there are no regions listed call it "regionless"
    var region_buttons = [];
    if (part_data["regions"].length > 0){

        //loop through regions and add them to region select
        for (var region in part_data["regions"]) {
            region = part_data["regions"][region]

            region_buttons.push({"id": region+"Add"
                                ,"text":RCA.capitalizeEachWord(region)
                                ,"onclick":RCA.limited_select_onclick
            });
        }

    //no regions listed
    } else {
             region_buttons.push({"id": "regionnotapplicable"
                                 ,"text":"Regionless"
                                 ,"onclick":RCA.limited_select_onclick
             });
    }

    //Clear buttons then add all buttons to the list
    button_ui.clearButtonList("RegionText","");
    button_ui.addButtonsToElement("RegionText", region_buttons);


    //Setup System select buttons.
    //TODO: just to be save we should check if there are actually any systems avalible
    var sys_buttons = [];
    for (system in part_data["systems"]) {
        system = part_data["systems"][system];

        sys_buttons.push({"id": system+"Add"
                         ,"text":RCA.capitalizeEachWord(system) 
                         ,"onclick":RCA.limited_select_onclick
        });
    }
    
    //Clear old buttons, Add new ones
    button_ui.clearButtonList("SystemText","");
    button_ui.addButtonsToElement("SystemText", sys_buttons);


    //setup the functional type buttons. They are always the same 3
    var functional_type_buttons = [
        { "id": "cosmetic", "text":"Cosmetic", "onclick":RCA.limited_select_onclick}
      , { "id": "balanced", "text":"Balanced", "onclick":RCA.limited_select_onclick}
      , { "id": "beneficial", "text":"Beneficial", "onclick":RCA.limited_select_onclick}
    ]

    //Clear old ones add new ones
    button_ui.clearButtonList("FunctionType","");
    button_ui.addButtonsToElement("FunctionType", functional_type_buttons);
}

RCA.createBiopartButtons = function(){
    //add a button for each part to the bioparts button list
    var part_buttons = [];
    for (var part_name in race_bio_parts) {
         part_buttons.push({"id": part_name
                           ,"text": RCA.capitalizeEachWord(part_name)
                           ,"onclick":RCA.select_onclick
                           ,"onhover":RCA.biopart_onhover
         });
    }

    //add button bioparts
    button_ui.addButtonsToElement("BioParts", part_buttons);
}

//**second part is to setup the filter buttons**
RCA.createFilterOptions = function(){

    //show all biopart buttons. clears other filters.
    var show_all_filter = function(){
        $("#BioParts .Button").show();
        $('#RegionSelect').val("all");
    }

    //show only selected parts
    var selected_filter = function(){
        show_all_filter(); //un-hide everything

        $("#BioParts .Button:not(.Selected)").hide();
    }

    //function that creates a region filter function for each region
    var region_filter = function(region){
        return function() {
            $("#BioParts .Button").hide();

            for (requested_part in race_bio_regions[region]) {
                $("#BioParts .Button[internal_id="+requested_part+"]").show();
            }
        }
    }
    
    var filter_buttons = [
     { "id": "AllFilter", "text": "Show All", "onclick":show_all_filter}
    ,{ "id": "SelectedFilter", "text": "Show Selected", "onclick":selected_filter}
    ];  

    button_ui.addButtonsToElement("FilterButtons", filter_buttons);

    //set up dropdown menu region filter
    $.each(race_bio_regions, function(key, value) {   
     $('#RegionSelect')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(RCA.capitalizeEachWord(key))); 
    });

    $("#RegionSelect").change(function(){
        var region = $("#RegionSelect").val();

        $("#BioParts .Button").hide();

        $.each($("#BioParts .Button"), function() {
            var bio_part = $(this);
            
            for (requested_part in race_bio_regions[region]) {
                requested_part = race_bio_regions[region][requested_part];

                if(requested_part == bio_part.attr("internal_id")) {
                    bio_part.show();
                }
            }
        });        
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

    //update query string
    RCA.updateQueryString()
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
    var region = part_data["region"] || "regionless";

    $("#RaceSummery"+RCA.capitalizeEachWord(region))
        .append("<li id=\""+id+"\">"+part_text+"</li>");
    $("#RaceSummery"+RCA.capitalizeEachWord(region)+" li")
        .click(RCA.delete_part_onclick);

    //add part to parts list so we can generate the new save query
    RCA.race_creator_build_parts.push(part_data);

    //update query string
    RCA.updateQueryString();
}

RCA.setupRaceSummary = function() {
    //attach an event to add the selected part
    $("#addRacePart").click(function() {
        //reset any error messages
        $("#errormsg").html("")

        //add apropriate error messages
        if ($("#SelectionInfo .Selected").length < 3) {
            $("#errormsg").append("<li>Not added! You must select a \
                                    setting from each of the 3 sections below.</li>");
            return;
        }

        //create dict to store the new part
        var part_data = {};

        //build a dictionary that contains the part's attrabutes
        part_data["name"] = $("#NameText").text();
        var att_name;
        $.each($("#SelectionInfo .Selected"), function() {
            att_name = $($(this).parent()).attr("id").replace("Text", "");

            part_data[att_name.toLowerCase()] = $(this).text().toLowerCase();
        });
        
        //actually add the part info to the race summery
        RCA.addRacePart(part_data);
    });

    //add the Race part region headers.    
    var i = 0;
    for(region in race_bio_regions) {
        var side_to_add = "#racePartBuildLeft"

        //everything in the upper half of the list gets added to the right hand column
        if(i > Object.keys(race_bio_regions).length/2){ side_to_add = "#racePartBuildRight"; }

        $(side_to_add).append("<h4>"+RCA.capitalizeEachWord(region)+"</h4>")
                      .append("<ul id=\"RaceSummery"+RCA.capitalizeEachWord(region)+"\"></ul>")
        
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

RCA.loadRace = function() {
    //see if there is a query string with race info.
    var loaded_race = RCA.parseRaceFromQuery( document.location.search.substring(1) )

    //there is one. load it.
    if (loaded_race.length != 0) {
        for (var part_data in loaded_race) {
            part_data = loaded_race[part_data];            

            //add part to the race summery window
            RCA.addRacePart(part_data);
        }
    }
}

//Run functions

RCA.createBiopartButtons();
RCA.createFilterOptions();
RCA.setupRaceSummary();
RCA.loadRace();

});
