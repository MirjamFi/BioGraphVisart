const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require("path");
var engines = require('consolidate');

const { png: pngRoute } = require('./routes/png.route');
const { vis: visRoute } = require('./routes/vis.route');
const { interactiveVis: interactiveVisRoute } = require('./routes/interactiveVis.route');
	
const HOST = process.env.GRAPHVIS_HOST || 'localhost';
const PORT = process.env.GRAPHVIS_PORT || 3001;
const MONGODB_URI = process.env.GRAPHVIS_MONGODB_URI || 'mongodb://mongodb/biograph_visart';

const app = express();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(express.static(__dirname + '/scripts'));

app.use('/png', pngRoute);
app.use('/vis', visRoute);
app.use('/interactiveVis', interactiveVisRoute);

app.set('views', __dirname + '/templates');
app.engine('html', engines.mustache);
app.set('view engine', 'html');




const listen = async (host, port, mongoUri) => {
  try {
  	    console.log(__dirname);

    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 100000,
    });
    app.listen(PORT, HOST, () => console.log(`${HOST}:${PORT}`));
  } catch (error) {
    console.log(error);
  }
}

// app.listen(3001);
listen(HOST, PORT, MONGODB_URI);
