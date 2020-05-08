var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");
var app     = express();

var foundFiles = [];
var prevdirectory = "";
app.use(express.static('../../'));

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

app.get('/BioGraphVisart/merge', function(req, res){
	res.sendFile(path.resolve('../../templates/merge.html'));
})

app.listen(3000);

console.log("Server running at http://localhost:3000/BioGraphVisart");