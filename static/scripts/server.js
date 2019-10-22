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

app.listen(3000);

console.log("Server running at http://localhost:3000/");