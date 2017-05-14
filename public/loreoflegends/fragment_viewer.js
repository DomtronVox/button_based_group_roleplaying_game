

$(window).load(function() {


fragment_viewer = {}

var FV = fragment_viewer

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
            var data = Fragment_Core.lore[list[index]]
            nodes.push(FV.buildTreeNode(data["name"], list[index]))
        }

    } else {
        for (var index in list) {
            var data = Fragment_Core.fragments[list[index]].data
            nodes.push(FV.buildTreeNode(data["name"], list[index]))
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
    $("#fragment_list-tree").jstree({
        "core": { "data": data_tree }
    });
    $("#fragment_list-tree").on("changed.jstree", function(e, data) {

        var fragment_id = data.node.a_attr["internal_id"];

        //some tree nodes are organizational and so have no fragment id so we ignore them
        if (fragment_id != undefined) {
            var fragment = Fragment_Core.fragments[fragment_id];
            var view_func = Fragment_Core.categories[fragment["category"]]["views"]["default"];

            //call the render function for the fragment
            view_func(fragment, "#fragment_viewer-fragment");

            //switches focus to the fragment viewer tab so the user does not get lost
            $( "#fragment_display" ).tabs( {active: 2} )
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
    $("#lore_list-tree").jstree({
        "core": { "data": data_tree }
    });
    $("#lore_list-tree").on("changed.jstree", function(e, data) {

        var lore_id = data.node.a_attr["internal_id"];

        //some tree nodes are organizational and so have no fragment id so we ignore them
        if (lore_id != undefined) {
            var lore = Fragment_Core.lore[lore_id];

            //empty html element
            $("#fragment_viewer-lore").html("");

            for (var index in lore.fragments) {
                var fragment_id = lore.fragments[index];

                var fragment = Fragment_Core.fragments[fragment_id];
                var view_func = Fragment_Core.categories[fragment["category"]]["views"]["default"];

                //create html element to contain view renderer results
                var html_id = "lore_viewer-fragment-" + fragment_id;
                $("#fragment_viewer-lore").append("<div id='"+html_id+"'></div>")

                //call the render function for the fragment
                view_func(fragment, "#"+html_id);

            }

            //switches focus to the fragment viewer tab so the user does not get lost
            $( "#fragment_display" ).tabs( {active: 0} )
        }

    })
}


//test data

var f1 = Fragment_Core.createFragment( "description" 
                            , {"name":"rise of dolathma", "contents":"The rise of __Dolathma__ brought about the eradication of the Cul'ther race."}
                            , ["Cul'ther", "Dolathma", "Nation Event"])

var f2 = Fragment_Core.createFragment( "description" 
                            , {"name":"Dolathma", "contents":"Dolathma is a Nation of Folx. The nation was very xenophobic and militaristic. Fears lead to several Great Clensings that occured a dozen years after a successful conquest."}
                            , ["Folx", "Dolathma", "Nation"])

var f3 = Fragment_Core.createFragment( "description" 
                            , {"name":"Cul'ther", "contents":"Cul'ther are herbavors. They are planithed with cloved hooves. They have a light covering of short fur and twin tails each a foot long."}
                            , ["Cul'ther", "Race"])


Fragment_Core.createLore("test lore 1", [f3, f1, f2], ["everything"])

//setup
FV.updateFragmentTree();
FV.updateLoreTree();




})
