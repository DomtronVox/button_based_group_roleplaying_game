#!/bin/env node

//Constants
var host = process.env.OPENSHIFT_NODEJS_IP || "localhost",
    port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

//  OpenShift sample Node application
var express = require('express')
  , fs      = require('fs')
  , http    = require('http');

//library setup
var app = express();
var server = http.Server(app);

//Project code setup
//require("./code/passport_login.js")(app);
require("./code/race_generator.js").RG();

app.configure(function(){
    //set static directory
    app.use(express.static("public")); 
});

server.listen(port, host, function () {
  console.log("Anomaly game server listening at http://%s:%s", host, port);
});
