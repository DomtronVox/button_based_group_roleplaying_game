//the fragment core handles the creation and storage of lore and fragments along with
//   registering new fragment categories. 

//documentation:
// * Fragment_Core.registerFragmentType(category_name, fields)
//     * Desc: registers a new fragment category.
//     * category_name: identifier for the category
//     * fields: valid default fields for the fragment's data

//TODO:
// * 

$(window).load(function() {

//main object that holds all functions
Fragment_Core = {};
var FC = Fragment_Core;

FC.fragment_id = 0;
FC.lore_id = 0;

FC.fragments = {};
FC.tagged_fragments = {};
FC.categories = {};

FC.lore = {};
FC.tagged_lore = {};

//registers a new fragment category from provided name, default data fields, and
//    view render function.
FC.registerFragmentType = function(category_name, default_fields, view_func, editor_func, save_func){

    if (FC.categories[category_name] == undefined) {
        FC.categories[category_name] = {};

        //default data for the fragment
        FC.categories[category_name]["data"] = default_fields;

        //storing functions for rendering, editing and saving the fragment
        FC.categories[category_name]["views"] = {"default":view_func};
        FC.categories[category_name]["editors"] = {"default":editor_func};
        FC.categories[category_name]["savers"] = {"default":save_func};

        //list of all fragment ids that are of this type
        FC.categories[category_name]["fragments"] = [];

    } else {
        console.log("Error: fragment core: registering new category with existing category name not allowed.")
    }

}

//creates a new fragment using given information
FC.createFragment = function(category, name, data, tags){
    //varify inputs
    if ( FC.categories[category] == undefined ) {return;}

    var new_fragment = {}

    //assign id
    FC.fragment_id++;
    new_fragment["id"] = FC.fragment_id;
    new_fragment["name"] = name;
    new_fragment["category"] = category;

    //setup defaults
    //>deep copy the default data values
    new_fragment["data"] = jQuery.extend(true, {}, FC.categories[category]["data"]);
    new_fragment["tags"] = [];

    //merge in valid data changes
    for ( var key in data ) {
        if ( new_fragment["data"][key] != undefined ) {
            new_fragment["data"][key] = data[key];
        }
    }

    //place the fragments in proper lists
    FC.fragments[FC.fragment_id] = new_fragment;
    FC.categories[category]["fragments"].push(FC.fragment_id);

    //>add fragment id to all tags 
    for ( var index in tags ) {
        var tag = tags[index];

        FC.addTag(FC.fragment_id, tag, "fragment")
    }

    return FC.fragment_id;
}

//creates a new lore using given information
FC.createLore = function(name, fragments, tags){

    var new_lore = {};

    //set id
    FC.lore_id++;
    new_lore["id"] = FC.lore_id;
    new_lore["name"] = name;
    
    //set fragment data
    new_lore["data"] = fragments;
    new_lore["tags"] = [];

    //place the lore in proper lists
    FC.lore[FC.lore_id] = new_lore;

    //>add fragment id to all tags 
    for ( var index in tags ) {
        var tag = tags[index];

        FC.addTag(FC.lore_id, tag, "lore")
    }

    return new_lore["id"];

}

//adds a tag to either fragments or lore
FC.addTag = function(id, new_tag, type) {

    //sanity check
    if (new_tag == "" || new_tag == undefined) { return;}

    //pick right sources based on type
    var id_list, tag_list;
    if (type.toLowerCase() == "lore") {
        id_list = FC.lore; 
        tag_list = FC.tagged_lore;
    } else {
        id_list = FC.fragments;
        tag_list = FC.tagged_fragments;
    }

    //make sure fragment/lore exists
    if ( id_list[id] == undefined ) {return;}
    
    //abort if tag is already in list
    var index = id_list[id]["tags"].findIndex(
                    function(tag_iter) {return tag_iter == new_tag;}
                )
    if (index != -1) { return; }

    //add tag to fragment/lore
    id_list[id]["tags"].push(new_tag);

    //add tag to indexed lists
    //>make sure tag has an assotiated list
    if ( tag_list[new_tag] == undefined ) {
        tag_list[new_tag] = [];
    }
    //>add fragment id to tag list
    tag_list[new_tag].push(id);

}

//removes a tag from a fragment
FC.removeTag = function(id, tag, type){

    //pick right sources
    var id_list, tag_list;
    if (type.toLowerCase() == "lore") {
        id_list = FC.lore; 
        tag_list = FC.tagged_lore;
    } else {
        id_list = FC.fragments;
        tag_list = FC.tagged_fragments;
    }

    //make sure fragment/lore exists
    if ( id_list[id] == undefined ) {return;}

    //abort if tag not already in list
    var index = id_list[id]["tags"].findIndex(
        function(tag_iter) {return tag_iter == tag;}
    )
    
    if (index == -1 ) {
        return;

    //if tag is in the list, remove it
    } else {
        id_list[id]["tags"].splice(index, 1);
    }

    //remove fragment from tag list
    var index = tag_list[tag].findIndex(
        function(fragment_id){return fragment_id == id;}
    )
    
    if (index != -1 ) {
        tag_list[tag].splice(index, 1);
    }
}

//returns a list of fragment id's matching the given category and/or tag(s); can be
//    inclusive, returns fragments matching any given values, or exclusive, returns 
//    fragments that match all given values.
FC.fragmentSearch = function(category, tags, inclusive){

    var fragments;

    //if a category is given start the list will all fragments from it
    if (category != null ) {
        fragments = FC.categories[category]["fragments"];

    //otherwise start with the first tag
    } else {
        //TODO test to make sure the tag exists
        fragments = FC.tagged_fragments[tags.pop()]
    }

    var tag;
    while (tags.length > 1) {
        tag = tags.pop();

        //if tag is not valid skip it
        if ( FC.tagged_fragments[tag] == undefined ) { continue;}
        
        //handle tags inclusivly (keep all fragment ids)
        if (inclusive) {

        //handle tags exclusivly (discard fragments that are not in all lists)
        } else {
            for (var index in FC.tagged_fragments[tag]) {
                
            }
        }
 
    }
}

//takes a list of fragment id's and filters out ones not matchng the given information
//    can be inclusive, returns fragments matching any given values, or 
//    exclusive, returns fragments that match all given values.
FC.fragmentFilter = function(id_list, category, tags){

}

//Saves all data to a downloadable file and tells the browser to download it
//  Credit: Matěj Pokorný https://stackoverflow.com/a/18197511
//  Modified.
FC.downloadJsonData = function(filename) {

    //if filename is not defined give sane default
    if (filename == undefined){
        filename = "SavedWorldLore.json"
    }

    var data = {"fragment_id": FC.fragment_id, "fragments": FC.fragments, 
                "tagged_fragments": FC.tagged_fragments,
                "lore_id": FC.lore_id, "lore": FC.lore, "tagged_lore": FC.tagged_lore  }
    var data_str = encodeURIComponent( JSON.stringify( data ) );

    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + data_str);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}



})
