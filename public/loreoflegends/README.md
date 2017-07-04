Lore of Legends, name pending, is a tool to create and manage game settings (worlds, universes, multiverses).

#Design

##Lore and Fragments
The design is based around the ideas of Fragments and Lore. __Lore__ simply a Fragment container with some meta-data. A __Fragment__ is a piece of information about the game's setting. Each Fragment has 3 pieces of information: categories, tags, and data. Data is directly related to what category the fragment is falls under while tags are user designed for organizing fragments.

Here are the categories and their data sets:

* Description: textual and image information.
    * Contents: The text itself
    * Hidden: Weather the fragment is part of the setting or just design notes.

* Date: Historic information
    * Start
    * End
    * Calender

* Species: List of biological parts describing a species sentient and non-sentient alike.
    * BioParts list: List of bioparts used and their design settings.

* Design: Bio-Mechanical item designs that encompasses vehicles, weapons, and utility items.
    * BioMecParts list: List of parts the design incorporates.

* Parts: Parts that add functionality to a species or design.
    * TODO

* Map: Maps of places.
    * Type: Vector (relational) or Grid (contiguous)
    * Subtype: Based on type. For Grid the cell shape (hexagonal, square)
    * Locations: List of map data depending on the type.

* Regions: Locations on a map can contain on location


## Views and Editors

On top of the idea of fragments is built Views and Editors. A __View__ is code based around rendering the data in a fragment. An __Editor__ is based on their respective view and expand the functionality to allow modifying a fragment's data.

Following is a list of Views and the fragment categories they render:

* Markdown: Renders Description fragments using markdown.
* Species: Renders species fragments.
* Design: Renders item designs.
* Tile Map: Renders Map fragments of type grid.
* Relative Map: Renders Map fragments of type vector.
* Date: Renders a single Date fragment.
* Timeline: Renders multiple Historic fragments.

## Putting it Together

As stated before, each piece of Lore is a container for fragments. Fragments can belong to multiple pieces of Lore. For example a Map of a Continent could be used in several different pieces of Lore one with a list of cities for one nation, a second with a list for another nation, and a third that describes the areas flora live in.

The Lore viewer works by running each of the fragments in it through their respective view function and then merges them into one page. 


#TODO

* If a lore is selected and one of it's fragments is edited, the lore does not get updated unless you reselect it.
* When dragging a fragment the text gets hidden behind the tabs section.
* Clicking create lore while editing a lore already causes the edited lore data to be lost.
* Need a way to delete fragments and lore.
* When creating a new fragment, if you save then immediatly save&exit there are two fragments created.


