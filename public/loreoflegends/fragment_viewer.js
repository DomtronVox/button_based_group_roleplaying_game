

$(window).load(function() {


fragment_viewer = {}

var FV = fragment_viewer

//editor values

//current fragment data being edited
FV.current_fragment = null;

//for new fragments current_fragment is null so we need to know which fragment catagory is being used
FV.current_fragment_catagory = null; 

//current lore data being edited
FV.current_lore = null; 

FV.lore_edit_data = null;

//########################################
//# Navigation tree setup and manipulation

//function that builds a tree node from given data
FV.buildTreeNode = function(name, id) {
    if (id != undefined) {
        return {"text" : name, "a_attr":{"internal_id" : id, "class" : "draggable"} }
    } else {
        return {"text" : name }
    }
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


//aquires a fragments view render function and runs it
FV.renderFragment = function(fragment_id, render_container) {

    var fragment = Fragment_Core.fragments[fragment_id];
    var view_func = Fragment_Core.categories[fragment.category].views.default;

    //call the render function for the fragment
    view_func(fragment, render_container);

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
        var fragment_list = Fragment_Core.tagged_fragments[tag]
        tag_node.children = FV.buildNodesFromIDList(fragment_list)
        
        //add the catagory node to the tree dataset
        tags_root.children.push(tag_node);
    } 

    data_tree.push(tags_root); 

    //populate data into the html element
    $("#fragment_list-tree").jstree(true).settings.core.data = data_tree;
    $("#fragment_list-tree").jstree(true).refresh();


    $("#fragment_list-tree").on("activate_node.jstree", function(e, data) { //changed.jstree

        var fragment_id = data.node.a_attr["internal_id"];

        //some tree nodes are organizational and so have no fragment id so we ignore them
        if (fragment_id != undefined) {
            //set editor variables
            FV.current_fragment = Fragment_Core.fragments[fragment_id];
            FV.current_fragment_catagory = FV.current_fragment.category; 

            FV.renderFragment(fragment_id, "#fragment_viewer-fragment-display");

            //switches focus to the fragment viewer tab so the user does not get lost
            $( "#fragment_display" ).tabs( {active: 1} )

            $("#fragment_viewer-fragment-edit").show();

        }

    })


    $("#fragment_list-tree").on("after_open.jstree", function(e, data) {
        //allow dragging fragments
        $(".draggable").draggable({helper: "clone", appendTo: "body"});
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

    $("#lore_list-tree").on("activate_node.jstree", function(e, data) { //changed.jstree

        var lore_id = data.node.a_attr["internal_id"];

        //some tree nodes are organizational and have no lore id so we ignore them
        if (lore_id != undefined) {
            FV.current_lore = Fragment_Core.lore[lore_id];

            //empty html element
            $("#fragment_viewer-lore-display").html("");

            for (var index in FV.current_lore.data) {
                var fragment_id = FV.current_lore.data[index];

                //create html element to contain view renderer results
                var html_id = "lore_viewer-fragment-" + fragment_id + "-" + generateRandomString(6);
                $("#fragment_viewer-lore-display").append("<div id='"+html_id+"'></div>")

                //call the render function for the fragment
                FV.renderFragment(fragment_id, "#"+html_id);

            }

            //switches focus to the fragment viewer tab so the user does not get lost
            $( "#fragment_display" ).tabs( {active: 0} )

            $("#fragment_viewer-lore-edit").show();

        }

    })
}


//#################################################
//# Fragment and Lore Editor setup and manipulation


//show the fragment editor div and set it up for the current fragment
FV.showEditorBox = function(catagory, data){
    $("#editor_box").show();
    $("#editor_box-contents").html("");

    //populate general form fields
    if (data == null) {
        $("#editor_box-name_string").val("");
        $("#editor_box-tag_string").val("");
    } else {
        $("#editor_box-name_string").val(data.name);
        $("#editor_box-tag_string").val(data.tags.join(','));
    }

   
    $("#editor_box-name_label").text("Fragment Name: ");
    //call the catagories editor creation function
    Fragment_Core.categories[catagory].editors.default(data, "#editor_box-contents");

}


//adds a fragment with all lore fragment edits
FV.addFragmentEditSection = function(fragment_id, html_id) {
                

        //>call the render function for the fragment
        FV.renderFragment(fragment_id, "#"+html_id);

        //allow deleting the lore fragment
        $("<button id='lore_edit-remove_fragment-"+html_id+"' class='hoverRight removeFragment'>X</button>")
            .insertBefore("#"+html_id)
            .button()
            .click(function(){
                var list = $("#fragment_viewer-lore-display div");
                var html_id = $(this).next()[0].id;

                //delete html elements
                $(this).next()[0].remove(); //remove drop area
                $(this).next()[0].remove(); //remove delete button
                $(this).remove(); 
                
                for (var index = 0; index < list.length; index++) {
                    if (list[index].id != html_id) { continue; }
 
                    //delete fragment id from lore data
                    FV.lore_edit_data.splice((index-1)/2, 1)

                    //delete lore id from fragment
                    var index = Fragment_Core.fragments[fragment_id].lore.findIndex(
                        function(tag_iter) {return tag_iter == FV.current_lore.id;}
                    )
                    Fragment_Core.fragments[fragment_id].lore.splice(index, 1);
                }
            })

        //add area where we can drop new fragments into
        $("<div class='droppable'>Drop Fragments Here To Add</div>")
                .insertAfter("#"+html_id)
                .droppable({drop: FV.fragmentDropCallback});
    }

//callback for when a fragment is dropped onto and lore edit droppable area
FV.fragmentDropCallback = function( event, ui ) {
        var fragment_id = $("#"+ui.draggable[0].id).attr("internal_id");

        if (fragment_id == undefined) { return;}

        //create html element to contain fragment renderer results
        var html_id = "lore_edit-fragment-" + fragment_id + "-" + generateRandomString(6);
        $(this).after(
            "<div id='"+html_id+"' class='draggable' internal_id='"+fragment_id+"'></div>");
        $("#"+html_id)
            .draggable({helper:"clone"})


        //add fragment and associated tools to lore editor
        FV.addFragmentEditSection(fragment_id, html_id)

        //add fragment id to lore and lore id to the fragment's lore list
        var list = $("#fragment_viewer-lore-display div");
        for (var index = 0; index < list.length; index++) {
            if (list[index].id != html_id) { continue; }

            //add fragment id to the proper location in the lore list
            FV.lore_edit_data.splice((index-1)/2, 0, ui.draggable[0].getAttribute("internal_id"))
            
            //add lore id to the fragment
            Fragment_Core.fragments[fragment_id].lore.push(FV.current_lore.id);
        }

        //if we are just rearanging a current fragment we need to remove the old one
        if (! ("jstree-anchor" in ui.draggable[0].classList) ) {
            var list = $("#fragment_viewer-lore-display div");
            for (var index = 0; index < list.length; index++) {
                if (list[index].id != ui.draggable[0].id) { continue; }
 
                //delete html elements
                $("#"+ui.draggable[0].id).next()[0].remove(); //remove drop area
                $("#"+ui.draggable[0].id).next()[0].remove(); //remove delete button
                $("#"+ui.draggable[0].id).remove();                

                //delete id from data
                FV.lore_edit_data.splice((index-1)/2, 1)
            }
        }

    }

//switch lore tab into edit mode
FV.toggleLoreEdit = function() {


    if (FV.current_lore == null) { return;}

    $("#fragment_viewer-lore-edit_header").show();
    $("#fragment_viewer-lore-edit").hide();

    $("#lore-edit_header-name_string").val(FV.current_lore.name);
    $("#lore-edit_header-tag_string").val(FV.current_lore.tags.join(','));

    $("#fragment_viewer-lore-display").html("");

    FV.lore_edit_data = FV.current_lore.data;

    //add 1st area where we can drop new fragments into
    $("<div class='droppable'>Drop Fragments Here To Add</div>")
        .appendTo("#fragment_viewer-lore-display")
        .droppable({ drop: FV.fragmentDropCallback });

    for (var index in FV.current_lore.data) {
        var fragment_id = FV.current_lore.data[index];

        //create html element to contain view renderer results
        var html_id = "lore_edit-fragment-" + fragment_id + "-" + generateRandomString(6);
        $("<div id='"+html_id+"' class='draggable' internal_id='"+fragment_id+"'></div>")
            .appendTo("#fragment_viewer-lore-display")
            .draggable({helper:"clone"})

        //add fragment and associated tools to lore editor
        FV.addFragmentEditSection(fragment_id, html_id)
    }

}


FV.setupEditorButtons = function(){

    //add fragment creation options
    for (var catagory in Fragment_Core.categories) {

        $("#new_fragment_select")
            .append("<option value='"+catagory+"'>New "+capitalizeEachWord(catagory)+"</button>")

    }

    $("#new_fragment_select")
        .on("selectmenuchange", function(){
            //get the catagory
            var catagory = $("#new_fragment_select").val();

            //reset select to the default because we want that always showing
            $("#new_fragment_select")
                .val("default")
                .selectmenu("refresh");

            //change editor data since this is a new fragment
            FV.current_fragment_catagory = catagory;
            FV.current_fragment = null;

            FV.showEditorBox(FV.current_fragment_catagory, FV.current_fragment);
        })

    //setup data operations actions
    $("#data_menu")
        .on("selectmenuchange", function(event){
            var selection = $("#data_menu").val();

            //reset select to the default because we want that always showing
            $("#data_menu")
                .val("default")
                .selectmenu("refresh");

            if (selection == "export_json") {
                Fragment_Core.downloadJsonData();
            } else if (selection == "import_json") {
                Fragment_Core.uploadJsonData(function(){
                    FV.updateFragmentTree();
                    FV.updateLoreTree();
                });
            }
    })



    //setup editor save and exit buttons
    
    var saveEditor = function(type) {

        //aquire data based on which type this is
        var new_data, current_object, name_str, tags_str;

        //handle lore data aquisition
        if (type.toLowerCase() == "lore") { 
            //save lore data
            new_data = FV.lore_edit_data; //list of fragments

            current_object = FV.current_lore

            //pull form data
            name_str = $("#lore-edit_header-name_string").val();
            tags_str = $("#lore-edit_header-tag_string").val();

        //otherwise assume fragment
        } else {
            //call the fragment catagory's saver function to get the new fragment data
            new_data = Fragment_Core.categories[FV.current_fragment_catagory].savers.default();

            current_object = FV.current_fragment;

            //pull form data
            name_str = $("#editor_box-name_string").val();
            tags_str = $("#editor_box-tag_string").val();
        }

        //empty strings should be given some        
        if (name_str == "") {
            name_str = "Unnamed";
        }


        var new_tags = tags_str.split(',');

        //if we are editing an existing fragment just edit the data
        if (current_object != null) {
            current_object.name = name_str;
            current_object.data = new_data;

            //add tags
            for ( var index in new_tags ) {
                var tag = new_tags[index];
                //if the tag is missing from current fragments then add it
                var ok = current_object.tags.find(function(t){ return t == tag;})
                if ( ok == undefined ) {
                    Fragment_Core.addTag(current_object.id, tag, type);
                }
            }

            //remove tags
            var tags_list = jQuery.extend(true, [], current_object.tags);
            for ( var index in tags_list ) {
                var tag = tags_list[index];
                //if the tag is missing from the new tag list we remove it
                var ok = new_tags.find(function(t){ return t == tag;})
                if ( ok == undefined ) {
                    Fragment_Core.removeTag(current_object.id, tag, type);
                }
            }

            
        //otherwise create a new fragment
        } else {
            if (type.toLowerCase() == "lore") { 
                Fragment_Core.createLore(name_str, new_data, new_tags)
            } else {
                var fragment_id = Fragment_Core
                    .createFragment( FV.current_fragment_catagory, name_str, new_data, new_tags);

                FV.current_fragment = Fragment_Core.fragments[fragment_id];
            }
        }

        //regenerate tree and other data
        if (type.toLowerCase() == "lore") { 
            FV.updateLoreTree();
        } else {
            FV.updateFragmentTree();
        }
    }

    var exitEditor = function(type) {
        //empty general form data
        if(type.toLowerCase() == "lore") {
            $("#lore-edit_header-name_string").val("");
            $("#lore-edit_header-tag_string").val("");

            $("#editor_box-contents").html("");
            $("#fragment_viewer-lore-edit_header").hide();
            $("#fragment_viewer-lore-edit").show();

            $("#fragment_viewer-lore .ui-droppable").remove();
            $("#fragment_viewer-lore .removeFragment").remove();

        } else {
            $("#editor_box-name_string").val("");
            $("#editor_box-tag_string").val("");

            $("#editor_box-contents").html("");
            $("#editor_box").hide();

            //call the render function for the fragment
            if (FV.current_fragment != undefined) {
                FV.renderFragment(FV.current_fragment.id, "#fragment_viewer-fragment-display");
            }    
        }
    }


    //setup editor buttons
    $("#editor-save").click(function() { 
        saveEditor("fragment");
    })

    $("#editor-save_exit").click(function() {
        saveEditor("fragment");
        exitEditor("fragment");
    })

    $("#editor-exit").click(function() {
        var exit = confirm("Are you sure? You will loose all unsaved data.")
        if (exit) { exitEditor("fragment");}
    })

    $("#editor-delete").click(function() {
        var _delete = confirm("Are you sure you want to delete? This Fragment will be compleatly removed forever.")
        if (_delete && FV.current_fragment != undefined) { 
            exitEditor("fragment");
            Fragment_Core.deleteFragment(FV.current_fragment.id);

            $("#fragment_viewer-fragment-edit").hide();
            $("#fragment_viewer-fragment-display").html("");
            FV.updateFragmentTree();
        }
    })


    //setup lore edit buttons
    $("#lore-save").click(function() { 
        saveEditor("lore");
    })

    $("#lore-save_exit").click(function() {
        saveEditor("lore");
        exitEditor("lore");
    })

    $("#lore-exit").click(function() {
        var exit = confirm("Are you sure? You will loose all unsaved data.")
        if (exit) { exitEditor("lore");}
    })

    $("#lore-delete").click(function() {
        var _delete = confirm("Are you sure you want to delete? This lore will be compleatly removed forever.")
        if (_delete && FV.current_lore != undefined) { 
            Fragment_Core.deleteLore(FV.current_lore.id);
            exitEditor("lore");

            $("#fragment_viewer-lore-edit").hide();
            $("#fragment_viewer-lore-display").html("");
            FV.updateLoreTree();
        }
    })


    $("#new_lore_button").click(function() {

        var id = Fragment_Core.createLore("Unnamed Lore", [], ["everything"]);
        
        FV.current_lore = Fragment_Core.lore[id];
        FV.lore_edit_data = FV.current_lore.data;

        FV.toggleLoreEdit();

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


var l1 = Fragment_Core.createLore("test lore 1", [f3, f1, f2], ["everything"])
Fragment_Core.fragments[f1].lore.push(l1);
Fragment_Core.fragments[f2].lore.push(l1);
Fragment_Core.fragments[f3].lore.push(l1);

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

$("#fragment_viewer-lore-edit").click(function(){
    FV.toggleLoreEdit();
});

FV.updateFragmentTree();
FV.updateLoreTree();
FV.setupEditorButtons();


})
