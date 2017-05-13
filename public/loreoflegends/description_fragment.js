

$(window).load(function() {

//fragment renderer
var descriptionRenderer = function(fragment, html_selector) {
    //convert text from markdown to html and place it 
    $(html_selector).html(
        SimpleMDE.prototype.markdown(fragment.data.contents)
    )

}

//register the fragment type
Fragment_Core.registerFragmentType (
            "description"
            , {  name: "Unnamed Text Fragment"
               , contents: "##Place content here."
               , hidden: false 
              }
            , descriptionRenderer
)



})
