var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var express = require("express");
var app     = express();
var path    = require("path");

app.use(express.static('../../'));

app.get('/',function(req,res){
  res.sendFile(path.resolve('../../templates/subgraphVisualization.html'));
});

app.listen(3000);


app.get("/foundFiles", function(req, res) {
    var foundFiles = [];
    var startPath = '../data/';
    var filter = '.graphml';
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            foundFiles.push(filename);
        };
    };
    res.send(foundFiles);
})

console.log("Server running at http://localhost:3000/");