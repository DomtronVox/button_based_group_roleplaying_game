
$(window).load(function() {

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


         button_ui.clearButtonList("RegionsText","");
         button_ui.addButtonsToElement("RegionsText", region_buttons);


         //since there are multiple systems for some parts we use buttons to allow the
         //  user to select the one he wants.
         var sys_buttons = []
         for (system in race_bio_parts[$(this).attr("internal_id")]["systems"]) {
             system = race_bio_parts[$(this).attr("internal_id")]["systems"][system]
             sys_buttons.push({"id": system+"Add", "text":capitalizeEachWord(system), 
                               "onclick":limited_select_onclick});
         }
         button_ui.clearButtonList("SystemsText","");
         button_ui.addButtonsToElement("SystemsText", sys_buttons);

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

    

    //Final part is to setup the Race Summery section 

    //delete the section_onclcik
    var delete_onclick = function(){
        $(this).remove()
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

        //build a string that identifies the part
        var part_text = $("#NameText").text()+" ("
        $.each($("#SelectionInfo .Selected"), function() {
            part_text += $(this).text() + ", ";
        });
        part_text += ")";

        //get region the part belongs to and add it to that region in the race summery
        var region = $("#RegionsText .Selected").attr("internal_id").replace("Add", "");
        $("#RaceSummery"+capitalizeEachWord(region)).append("<li>"+part_text+"</li>");
        $("#RaceSummery"+capitalizeEachWord(region)+" li").click(delete_onclick);

    });

    //add the Race part region headers.    
    var i = 0;
    for(region in race_bio_regions) {
        var side_to_add = "#racePartBuildLeft"

        //everything in the upper half of the list gets added to the right hand column
        if(i > Object.keys(race_bio_regions).length/2-1){ side_to_add = "#racePartBuildRight"; }
        if(region == "regionless") { continue; }        

        $(side_to_add).append("<h4>"+capitalizeEachWord(region)+"</h4>")
                      .append("<ul id=\"RaceSummery"+capitalizeEachWord(region)+"\"></ul>")
        
        //increment count used to determin column
        i++;
    }
});
