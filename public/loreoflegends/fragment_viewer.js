

$(window).load(function() {


fragment_viewer = {}

var FV = fragment_viewer

//editor values

//current fragment data being edited
FV.current_fragment = null;

//for new fragments current_fragment is null so we need to know which fragment catagory is being used
FV.current_fragment_catagory = null; 


//########################################
//# Navigation tree setup and manipulation

//function that builds a tree node from given data
FV.buildTreeNode = function(name, id) {
    return {"text" : name, "a_attr":{"internal_id" : id} }
}

//function that builds nodes from a list of fragments
//    takes list of fragment id's
//    returns list of js-tree nodes
FV.buildNodesFromIDList = function(list, type) {
    if (!type) {type = ""}

    var nodes = [];

    if (type.toLowerCase() == "lore") {
        for (var index in list) {
            var lore = Fragment_Core.lore[list[index]]
            nodes.push(FV.buildTreeNode(lore["name"], list[index]))
        }

    } else {
        for (var index in list) {
            var fragment = Fragment_Core.fragments[list[index]]
            nodes.push(FV.buildTreeNode(fragment["name"], list[index]))
        }
    }

    return nodes;
}


//update fragment tree contents based on current fragment core data
//TODO rewrite
FV.updateFragmentTree = function() {
    var data_tree = []

    //create tree branch for fragment categories
    var cats_root = FV.buildTreeNode("Fragment Categories", null);
    cats_root.children = [];
    
    //create a root node for each catagory in the settings data
    for (var catagory in Fragment_Core.categories) {
        var catagory_node = FV.buildTreeNode(catagory, null);

        //create child nodes from each fragment in the catagory
        catagory_list = Fragment_Core.categories[catagory].fragments
        catagory_node.children = FV.buildNodesFromIDList(catagory_list)
        
        //add the catagory node to the tree dataset
        cats_root.children.push(catagory_node);
    } 

    data_tree.push(cats_root);  

    //create tree branch for fragment tags
    var tags_root = FV.buildTreeNode("Fragment Tags", null);
    tags_root.children = [];

    //create a root node for each catagory in the settings data
    for (var tag in Fragment_Core.tagged_fragments) {
        var tag_node = FV.buildTreeNode(tag, null);

        //create child nodes from each fragment in the catagory
        tag_list = Fragment_Core.tagged_fragments[tag]
        tag_node.children = FV.buildNodesFromIDList(tag_list)
        
        //add the catagory node to the tree dataset
        tags_root.children.push(tag_node);
    } 

    data_tree.push(tags_root); 

    //populate data into the html element
    $("#fragment_list-tree").jstree(true).settings.core.data = data_tree;
    $("#fragment_list-tree").jstree(true).refresh();

    $("#fragment_list-tree").on("changed.jstree", function(e, data) {

        //only handle specific actions
        if (data.action != "select_node") { return; }

        var fragment_id = data.node.a_attr["internal_id"];

        //some tree nodes are organizational and so have no fragment id so we ignore them
        if (fragment_id != undefined) {
            var fragment = Fragment_Core.fragments[fragment_id];
            var view_func = Fragment_Core.categories[fragment.category].views.default;

            //set editor variables
            FV.current_fragment = fragment;
            FV.current_fragment_catagory = fragment.category; 

            //call the render function for the fragment
            view_func(fragment, "#fragment_viewer-fragment-display");

            //switches focus to the fragment viewer tab so the user does not get lost
            $( "#fragment_display" ).tabs( {active: 2} )

            //show the edit button
            $("fragment_viewer-fragment-edit").show();
        }

    })
    
}

//update lore tree contents based on current fragment core data
FV.updateLoreTree = function() {
    var data_tree = []
    
    //create tree branch for fragment tags
    var tags_root = FV.buildTreeNode("Lore Tags", null);
    tags_root.children = [];
    
    //create a root node for each catagory in the settings data
    for (var tag in Fragment_Core.tagged_lore) {
        var tag_node = FV.buildTreeNode(tag, null);

        //create child nodes from each fragment in the catagory
        tag_list = Fragment_Core.tagged_lore[tag]
        tag_node.children = FV.buildNodesFromIDList(tag_list, "lore")
        
        //add the catagory node to the tree dataset
        tags_root.children.push(tag_node);
    } 

    data_tree.push(tags_root);   

    //populate data into the html element
    $("#lore_list-tree").jstree(true).settings.core.data = data_tree;
    $("#lore_list-tree").jstree(true).refresh();

    $("#lore_list-tree").on("changed.jstree", function(e, data) {

        //only handle specific actions
        if (data.action != "select_node") { return; }

        var lore_id = data.node.a_attr["internal_id"];

        //some tree nodes are organizational and so have no fragment id so we ignore them
        if (lore_id != undefined) {
            var lore = Fragment_Core.lore[lore_id];

            //empty html element
            $("#fragment_viewer-lore-display").html("");

            for (var index in lore.fragments) {
                var fragment_id = lore.fragments[index];

                var fragment = Fragment_Core.fragments[fragment_id];
                var view_func = Fragment_Core.categories[fragment.category].views.default;

                //create html element to contain view renderer results
                var html_id = "lore_viewer-fragment-" + fragment_id;
                $("#fragment_viewer-lore-display").append("<div id='"+html_id+"'></div>")

                //call the render function for the fragment
                view_func(fragment, "#"+html_id);

            }

            //switches focus to the fragment viewer tab so the user does not get lost
            $( "#fragment_display" ).tabs( {active: 0} )

            //show edit button
            //$("fragment_viewer-lore-edit").show();
        }

    })
}


//##############################
//# Editor setup and manipulation

FV.showEditorBox = function(catagory, fragment){
    $("#editor_box").show();
    $("#editor_box-contents").html("");

    //populate general form fields
    if (fragment == null) {
        $("#editor_box-name_string").val("");
        $("#editor_box-tag_string").val("");
    } else {
        $("#editor_box-name_string").val(fragment.name);
        $("#editor_box-tag_string").val(fragment.tags.join(','));
    }

    //call the catagories editor creation function
    Fragment_Core.categories[catagory].editors.default(fragment, "#editor_box-contents");
}


FV.setupEditorButtons = function(){

    //add fragment creation buttons
    for (var catagory in Fragment_Core.categories) {
        console.log(catagory)

        $("#fragment_viewer-header_bar")
            .append("<button id='new_"+catagory+"_fragment'>New "+catagory+"</button>")

        $("#new_"+catagory+"_fragment")
            .button() //style the button
            .click(function(){
                //change editor data since this is a new fragment
                FV.current_fragment_catagory = catagory;
                FV.current_fragment = null;

                FV.showEditorBox(FV.current_fragment_catagory, FV.current_fragment);
            })
    }

    //setup editor save and exit buttons
    
    var save_data = function() {
        //call the fragment catagory's saver function to get the new fragment data
        var data = Fragment_Core.categories[FV.current_fragment_catagory].savers.default();

        //get general form data (name and tags)
        var name_str = $("#editor_box-name_string").val();

        var tags_str = $("#editor_box-tag_string").val();
        var new_tags = tags_str.split(',');

        //if we are editing an existing fragment just edit the data
        if (FV.current_fragment != null) {
            FV.current_fragment.name = name_str;
            FV.current_fragment.data = data;

            //add tags
            for ( var index in new_tags ) {
                var tag = new_tags[index];
                //if the tag is missing from current fragments then add it
                var ok = FV.current_fragment.tags.find(function(t){ return t == tag;})
                if ( ok == undefined ) {
                    Fragment_Core.addTag(FV.current_fragment.id, tag, "fragment");
                }
            }

            //remove tags
            var tags_list = jQuery.extend(true, [], FV.current_fragment.tags);
            for ( var index in tags_list ) {
                var tag = tags_list[index];
                //if the tag is missing from the new tag list we remove it
                var ok = new_tags.find(function(t){ return t == tag;})
                if ( ok == undefined ) {
                    Fragment_Core.removeTag(FV.current_fragment.id, tag, "fragment");
                }
            }

            
        //otherwise create a new fragment
        } else {
            Fragment_Core
                .createFragment( FV.current_fragment_catagory, name_str, data, tags);
        }

        //regenerate tree
        FV.updateFragmentTree();
    }

    var exit_editor = function() {
        //empty general form data
        var name_str = $("#editor_box-name_string").val("");
        var tags_str = $("#editor_box-tag_string").val("");

        $("#editor_box-contents").html("");
        $("#editor_box").hide();
    }

    $("#editor-save").click(save_data)

    $("#editor-save_exit").click(function() {
        save_data();
        exit_editor();
    })

    $("#editor-exit").click(function() {
        var exit = confirm("Are you sure? You will loose all unsaved data.")
        if (exit) { exit_editor();}
    })


}

var f1 = Fragment_Core.createFragment( "description", "rise of dolathma"
                            , {"contents":"The rise of __Dolathma__ brought about the eradication of the Cul'ther race."}
                            , ["Cul'ther", "Dolathma", "Nation Event"])

var f2 = Fragment_Core.createFragment( "description", "Dolathma"
                            , {"contents":"Dolathma is a Nation of Folx. The nation was very xenophobic and militaristic. Fears lead to several Great Clensings that occured a dozen years after a successful conquest."}
                            , ["Folx", "Dolathma", "Nation"])

var f3 = Fragment_Core.createFragment( "description", "Cul'ther" 
                            , {"contents":"Cul'ther are herbavors. They are planithed with cloved hooves. They have a light covering of short fur and twin tails each a foot long."}
                            , ["Cul'ther", "Race"])


Fragment_Core.createLore("test lore 1", [f3, f1, f2], ["everything"])

//setup
$("#fragment_list-tree").jstree({
        "core": { "data": [] }
    });

$("#lore_list-tree").jstree({
        "core": { "data": [] }
    });

$("#fragment_viewer-fragment-edit").click(function(){
    if (FV.current_fragment != null) {
        FV.showEditorBox(FV.current_fragment_catagory, FV.current_fragment);
    }
});


FV.updateFragmentTree();
FV.updateLoreTree();
FV.setupEditorButtons();




})
