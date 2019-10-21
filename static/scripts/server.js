var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");
var app     = express();
var engines = require('consolidate');

var foundFiles = [];

app.use(express.static('../../'));

const { png: pngRoute } = require('./routes/png.route');

app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use('/png', pngRoute);

app.get('/',function(req,res){
  res.sendFile(path.resolve('../../templates/subgraphVisualization.html'));
});

app.get('/about',function(req,res){
  res.sendFile(path.resolve('../../templates/about.html'));
});

const bodyParser = require('body-parser');
app.use(bodyParser.text({ type: 'application/xml' }));

var data;
app.post('/vis', function(req, res) {
        data = req.body;
        res.end("done")
    });
app.get('/vis', function(req, res) {
        res.send(data)
    });




app.get("/foundGraphs", function(req, res) {
    if(foundFiles.length == 0){
        var startPath = '../graphs/';
        var filter = '.graphml';
        fromDir(startPath, filter, foundFiles);
    }   
    res.send(foundFiles);}
)


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