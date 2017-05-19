

$(window).load(function() {

Description_Editor = {}
Description_Editor.editor = null;

//fragment renderer setup function
var descriptionRenderer = function(fragment, html_selector) {
    //convert text from markdown to html and place it 
    $(html_selector).html(
        SimpleMDE.prototype.markdown(fragment.data.contents)
    )

}


//fragment editor setup function
var descriptionEditor = function(fragment, html_selector) {

    $(html_selector).append("<textarea></textarea>")

    Description_Editor.editor = new SimpleMDE({element: $(html_selector+" textarea")[0] })

    var editor_contents = "# Markdown!\nEnter text here for your fragment."
    if ( fragment != null && fragment != undefined) {
        editor_contents = fragment.data.contents
    }

    Description_Editor.editor.value(editor_contents)
}

//fragment editor save function
var descriptionSaver = function(fragment) {
    
    var contents = Description_Editor.editor.value();

    var hidden = false;
    if (fragment && fragment.data.hidden != undefined) {
        hidden = fragment.data.hidden;
    }

    return { "contents": contents, "hidden": hidden}
    
}


//register the fragment type
Fragment_Core.registerFragmentType (
            "description"
            , {  contents: ""
               , hidden: false 
              }
            , descriptionRenderer
            , descriptionEditor
            , descriptionSaver
)



})
