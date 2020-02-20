var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");
var app     = express();
var bodyParser = require('body-parser');
const axios = require('axios').default;

var foundFiles = [];
var prevdirectory = "";
app.use(express.static('../../'));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(bodyParser.json())

app.get('/BioGraphVisart',function(req,res){
  res.sendFile(path.resolve('../../templates/BioGraphVisart.html'));
});

app.get('/BioGraphVisart/about',function(req,res){
  res.sendFile(path.resolve('../../templates/about.html'));
});
app.get('/BioGraphVisart/heatmap',function(req,res){
  res.sendFile(path.resolve('../../templates/heatmap.html'));
});
app.get('/datenschutzerklarung',function(req,res){
  res.sendFile(path.resolve('../../templates/datenschutzerklarung.html'));
});
app.get('/imprint',function(req,res){
  res.sendFile(path.resolve('../../templates/imprint.html'));
});
app.get('/BioGraphVisart/documentation',function(req,res){
  res.sendFile(path.resolve('../../templates/documentation.html'));
});
app.get('/BioGraphVisart/contact',function(req,res){
  res.sendFile(path.resolve('../../templates/contact.html'));
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
app.post('/BioGraphVisart/merge', function(req, res){
	mergedGraph = req.body;
	res.send(mergedGraph)
})
app.get('/BioGraphVisart/merge', function(req, res){
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

app.post('/BioGraphVisart/kegg', function(req, res){
    var findRequests = [];
    for (let name of req.body.name) {
        findRequests.push(getKEGGPathways(name));
    }
    axios
        .all(findRequests)
        .then(responseArray => {
            var body = "";

            for (var i = 0; i < responseArray.length; i++) {
                if (!(typeof responseArray[i] == "undefined")) {
                  // parse the information of the response
                  var lines = responseArray[i].data;
                  body += lines +"|";
                }
            }
            console.log(body)
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(body);
        })
        .catch(error => {
            console.log(error);
        });
})


async function getKEGGPathways(name){
    const url = "https://www.kegg.jp/entry/hsa:" + name;
     return axios.get(url, {
        validateStatus: function (status) {
          return status < 500;
        }
    })
}

app.listen(3000);



console.log("Server running at http://localhost:3000/BioGraphVisart");