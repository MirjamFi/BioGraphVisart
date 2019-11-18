var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");
var app     = express();

var foundFiles = [];
var prevdirectory = "";
app.use(express.static('../../'));

app.get('/',function(req,res){
  res.sendFile(path.resolve('../../templates/subgraphVisualization.html'));
});

app.get('/about',function(req,res){
  res.sendFile(path.resolve('../../templates/about.html'));
});
app.get('/heatmap',function(req,res){
  res.sendFile(path.resolve('../../templates/heatmap.html'));
});

app.get('/foundFilesInDirectory', function(req,res){
    var startPath = '../../'+req.query.directory;
    console.log(startPath)
    if(startPath != prevdirectory){
        foundFiles = [];
        var filter = '.graphml';
        var foundFilesInDirectory = fromDir(startPath, filter);
        prevdirectory = startPath;
        res.send(foundFilesInDirectory);
    }
})
var mergedGraph;
app.post('/merge', function(req, res){
	mergedGraph = req.body;
	res.send(mergedGraph)
})
app.get('/merge', function(req, res){
	res.sendFile(path.resolve('../../templates/merge.html'));
})

function fromDir(startPath, filter){
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
    return foundFiles
}


app.listen(3000);



console.log("Server running at http://localhost:3000/");