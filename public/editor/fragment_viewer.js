//the fragment viewer holds the local data and facilitates acessing it


$(window).load(function() {

fragment_viewer = {}

var FV = fragment_viewer

//data handeling

FV.setting_data = {}; //object holding the actual data sets
FV.data_tree = {}

FV.buildTreeNode = function(name, id) {
    return {"text" : name, "id" : id}
}

FV.updateTree = function(node, cb) {
    var data_tree = []
    
    //create a root node for each catagory in the settings data
    for (var catagory in FV.setting_data.catagories) {
        catagory_node = FV.buildTreeNode(catagory, null);
        catagory_node.children = [];

        //for each fragment in that catagory create a child node
        catagory_list = FV.setting_data.catagories[catagory]
        for (var index in catagory_list) {
            var fragment = FV.setting_data.fragments[catagory_list[index]]

            catagory_node.children.push(FV.buildTreeNode(fragment["name"], null))
        }
        
        //add the catagory node to the tree dataset
        data_tree.push(catagory_node);
    } 

    console.log(data_tree)
    $("#fragments_list-tree").jstree({
        "core": { "data": data_tree }
    });
    
}

//handle tabs in the fragment viewer
FV.tabs = {}
FV.tab_counter = 0
FV.tabTemplate = "<li><a href='#{href}'>#{label}</a></li>",

// adds a tab based on given content
FV.addTab = function(tab_title, tab_type, tab_content) {
    var tabs_header = $("fragment_viewer_tabs")

    var label = tab_title || "Tab " + FE.tab_counter,
        id = "tabs-" + FE.tab_counter,
        new_tab_header = $( FE.tabTemplate.replace( /#\{href\}/g, "#" + id )
                                          .replace( /#\{label\}/g, label ) ),
        tabContentHtml = content || "Tab " + FE.tab_counter + " content.";
 
    tabs_header.find( ".ui-tabs-nav" ).append( new_tab_header );
    tabs_header.append( "<div id='" + id + "'><p>" + tabContentHtml + "</p></div>" );
    tabs_header.tabs( "refresh" ); //jquery-ui function
    FE.tab_counter++;
}



//debug test data
FV.setting_data.fragments = {}
FV.setting_data.fragments["FdSewA%43"] = {"name": "Raign of Grathma", "catagories":["history"], 
                                          "data":{"date":[1200, 1206], "content": "Raign of Grathma"}}
FV.setting_data.fragments["GreDsw#4@"] = {"name": "Golth'makas", "catagories":["race"], 
                                          "data":{"part list": ""}}
FV.setting_data.catagories = { "race": ["GreDsw#4@"]
                             , "history": ["FdSewA%43"]}


//run setup
FV.updateTree()

})
