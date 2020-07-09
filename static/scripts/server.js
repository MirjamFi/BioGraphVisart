var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");
var bodyParser = require('body-parser');
var app     = express();

var foundFiles = [];
var prevdirectory = "";
app.use(express.static('../../'));
app.use(bodyParser())

var data;

app.get('/', function(req,res){
  res.sendFile(path.resolve('../../templates/default.html'));
});

app.get('/BioGraphVisart/',function(req,res){
  res.sendFile(path.resolve('../../templates/BioGraphVisart.html'));
});

app.get('/BioGraphVisart/vis',function(req,res){
  console.log(req.body)
  console.log(data)
  res.send(JSON.stringify(data));
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

app.post('/BioGraphVisart/vis',function(req,res){
  data = req.body;
  // res.send(data)
});



app.listen(3000);

console.log("Server running at http://localhost:3000/BioGraphVisart");