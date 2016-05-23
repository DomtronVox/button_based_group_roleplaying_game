//TODO:
// * break up code into several files
// * write function that handles building a part string since we do it twice
// * use a key combo like ctrl+click to delete race parts so we don't accidentally delete things either when trying to select of by a stray click.
// * add sorting buttons like A-Z, Z-A, By System, By Region
// * add more filters like by system, ??(ask swords)
// * add help button and help popup
// * try to reduce the calls to capitalizeEachWord




$(window).load(function() {

    //list of parts for the current build
    var race_creator_build_parts = [];

    //self explanitory utility function
    function capitalizeEachWord(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    //first part is to setup the bio-part buttons

    //function for selecting any button when clicked
    var select_onclick = function(){
        if( $(this).hasClass("Selected") ){
            $(this).removeClass("Selected");
        } else {
            $(this).addClass("Selected");
        }
    }

    var limited_select_onclick = function(){
        if( $(this).hasClass("Selected") ){
            $(this).removeClass("Selected");
        } else {
            $(this).parent().children().removeClass("Selected");
            $(this).addClass("Selected");
        }
    }

    //update part info window when new part is hovered
    var biopart_onhover = function(){
         var part_id = $(this).attr("internal_id");

         //reset any error messages
         $("#errormsg").html("")

         //set name and description fields
         $("#NameText").text(capitalizeEachWord(race_bio_parts[part_id]["name"]));
         $("#ApearenceText").text(race_bio_parts[part_id]["appearance"]);
         $("#FunctionText").text(race_bio_parts[part_id]["functional"]);

         //list regions or if there are none a short message
         //TODO maybe just hide the region section if region is not applicable.
         var region_buttons = []
         if (race_bio_parts[part_id]["regions"].length > 0){

             for (region in race_bio_parts[$(this).attr("internal_id")]["regions"]) {
                 region = race_bio_parts[$(this).attr("internal_id")]["regions"][region]
                 region_buttons.push({"id": region+"Add", "text":capitalizeEachWord(region),
                                      "onclick":limited_select_onclick});
             }

         } else {
             region_buttons.push({"id": "regionnotapplicable", "text":"Not Applicable",
                                  "onclick":limited_select_onclick});
         
         }


         button_ui.clearButtonList("RegionText","");
         button_ui.addButtonsToElement("RegionText", region_buttons);


         //since there are multiple systems for some parts we use buttons to allow the
         //  user to select the one he wants.
         var sys_buttons = []
         for (system in race_bio_parts[$(this).attr("internal_id")]["systems"]) {
             system = race_bio_parts[$(this).attr("internal_id")]["systems"][system]
             sys_buttons.push({"id": system+"Add", "text":capitalizeEachWord(system), 
                               "onclick":limited_select_onclick});
         }
         button_ui.clearButtonList("SystemText","");
         button_ui.addButtonsToElement("SystemText", sys_buttons);

         //setup the functional type buttons
         var functional_type_buttons = [
            { "id": "cosmetic", "text":"Cosmetic", "onclick":limited_select_onclick}
          , { "id": "balanced", "text":"Balanced", "onclick":limited_select_onclick}
          , { "id": "beneficial", "text":"Beneficial", "onclick":limited_select_onclick}
         ]

         button_ui.clearButtonList("FunctionType","");
         button_ui.addButtonsToElement("FunctionType", functional_type_buttons);
    }

    //add a button for each part to the bioparts button list
    var part_buttons = [];
    for (var part_name in race_bio_parts) {
         part_buttons.push({"id": part_name, "text": capitalizeEachWord(part_name), 
                            "onclick":select_onclick, "onhover":biopart_onhover});
    } 

    button_ui.addButtonsToElement("BioParts", part_buttons);


    //**second part is to setup the filter buttons**

    //show everything. clears some other filter
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
                    .text(capitalizeEachWord(key))); 
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

    

    //next part is to setup the Race Summery section 

    //delete the section_onclcik
    var delete_onclick = function(){
        //remove the part from thepart list
        var index = $(this).attr("id").replace("RP", "");
        race_creator_build_parts[index] = null;

        //remove element from race summery
        $(this).remove()

        //update query string
        updateQueryString()
    }

    //add an item to the race summary section
    var addRacePart = function(part_data) {
        //build part string
        part_text = capitalizeEachWord(part_data["name"]) + " (";
        
        for (var attr in part_data) {
            if (attr == "name") { continue; }
            part_text += capitalizeEachWord(part_data[attr]) + ", ";
        }

        //cut out extra comma and add ending parenthesis
        part_text = part_text.substr(0, part_text.length-2) + ")";

        //part id for removing parts later
        var id = "RP" + race_creator_build_parts.length;
        var region = part_data["region"] || "regionless";

        $("#RaceSummery"+capitalizeEachWord(region))
            .append("<li id=\""+id+"\">"+part_text+"</li>");
        $("#RaceSummery"+capitalizeEachWord(region)+" li")
            .click(delete_onclick);

        //add part to parts list so we can generate the new save query
        race_creator_build_parts.push(part_data);

        //update query string
        updateQueryString();
    }

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
        console.log(part_data)
        //actually add the part info to the race summery
        addRacePart(part_data);
    });

    //add the Race part region headers.    
    var i = 0;
    for(region in race_bio_regions) {
        var side_to_add = "#racePartBuildLeft"

        //everything in the upper half of the list gets added to the right hand column
        if(i > Object.keys(race_bio_regions).length/2){ side_to_add = "#racePartBuildRight"; }

        $(side_to_add).append("<h4>"+capitalizeEachWord(region)+"</h4>")
                      .append("<ul id=\"RaceSummery"+capitalizeEachWord(region)+"\"></ul>")
        
        //increment count used to determin column
        i++;
    }

    //Parse query string
    //Modified from: http://stackoverflow.com/a/13896633
    function parseRaceFromQuery(str) {

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
            if(name.length == 0) continue;

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
    function saveRaceToQuery(params) {

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
    function updateQueryString() {
        //get new race query string
        var race_str = saveRaceToQuery(race_creator_build_parts);

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
        console.log(document.location.href)
        $("#RaceURL").val(document.location.href);
    }


    //see if there is a query string with race info.
    var loaded_race = parseRaceFromQuery( document.location.search.substring(1) )

    //there is one. load it.
    if (loaded_race.length != 0) {
        for (var part_data in loaded_race) {
            part_data = loaded_race[part_data];            

            //add part to the race summery window
            addRacePart(part_data);
        }
    }

});
