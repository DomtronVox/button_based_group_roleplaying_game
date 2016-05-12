//String manipulation of Bio-parts glossery text file into json .js file for use in
//    client side code.

//data format
//-each aphabetical section starts with it's letter between colens (:) i.e. :A:
//-each individual bio-part is seperated by two or more blank lines
//-each bio-part has 3 lines each starting with 'A:'
//->1st line: name: 1st applicable system, 2nd applicable system, ...
//->2nd line: description of bio-part
//->3rd line: functional description of bio-part

//TODO
//-clean up capitalization
//

var fs = require("fs");

exports.RG = function() {

    fs.readFile('public/race_generator/data.txt', 'utf8', function (err, data) {

        if (err) throw err

        //objects into which the data will be placed
        var bio_parts = {};
        var bio_regions = {"head":[], "neck":[], "thorax":[], "arm":[], "hand":[],
         "wings":[], "wing tips":[], "back":[], "abdomen":[], "pelvis":[],
         "tail":[], "tail tip":[], "leg":[], "foot":[], "regionless":[]}

        //strip out multiple new lines and replace with a single new line
        data = data.replace(/^\s*[\r\n]/gm, '\n');

        lines = data.split('\n');

        //find and take only valid lines
        var valid_line_list = [];
        for (var x = 0; x < lines.length; x++) {
            //if the line starts with the code A: it is a part line

            if (lines[x].substr(0,2) == "A:") {
                valid_line_list.push(lines[x]);
            }

        }

        //take the valid lines 3 at a time and process them
        for (var x = 0; x < valid_line_list.length-3; x += 3){
            
            //break each line into it's elements and name them
            var line_one = valid_line_list[x].substr(3).split(":");

            var name = line_one[0].toLowerCase();
            

            //sort the list into regions, systems, and tissues
            var part_regions = [], part_systems = []; 

            var mix_list = line_one[1].split(",");
            var no_region = true;

            for (element in mix_list) {
                element = mix_list[element].toLowerCase().trim();

                if(bio_regions[element] != undefined) {
                    //add region to part's list
                    part_regions.push(element);
                    
                    //add part to rgion list (easyer serching)
                    bio_regions[element].push(name);

                    no_region = false;

                //} else if (element in Tissues)
                } else {
                    part_systems.push(element);
                }
            }
            
            //if it has no region drop it in the regionless list
            if (no_region) {
                bio_regions["regionless"].push(name);
            }


            var appearance = valid_line_list[x+1].substr(3);
            var functional = valid_line_list[x+2].substr(3);

            //add to final parts list
            bio_parts[name] = {
                "name": name,
                "regions": part_regions,
                "systems": part_systems,
                "appearance": appearance,
                "functional": functional
            }

        }


        //write file
        fs.writeFile('public/race_generator/data.js', 
            "var race_bio_parts =" + JSON.stringify(bio_parts) +
          "\nvar race_bio_regions ="+JSON.stringify(bio_regions), 
        function (err) {
            if (err) throw err;
            console.log('Race bio_parts text file parsed and saved to json!');
        });
    });
};
