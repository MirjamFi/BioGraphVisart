var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");
var app     = express();

var foundFiles = [];

app.use(express.static('../../'));

app.get('/',function(req,res){
  res.sendFile(path.resolve('../../templates/subgraphVisualization.html'));
});
app.get('/about',function(req,res){
  res.sendFile(path.resolve('../../templates/about.html'));
});

app.listen(3000);



console.log("Server running at http://localhost:3000/");