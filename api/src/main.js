const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { png: pngRoute } = require('./routes/png.route');
const { vis: visRoute } = require('./routes/vis.route');
const { interactiveVis: interactiveVisRoute } = require('./routes/interactiveVis.route');
	
const HOST = process.env.GRAPHVIS_HOST || 'localhost';
const PORT = process.env.GRAPHVIS_PORT || 3001;
const MONGODB_URI = process.env.GRAPHVIS_MONGODB_URI || 'mongodb://mongodb/biograph_visart';

const app = express();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use('/png', pngRoute);
app.use('/vis', visRoute);
app.use('/interactiveVis', interactiveVisRoute);

const listen = async (host, port, mongoUri) => {
  try {
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 100000,
    });
    app.listen(PORT, HOST, () => console.log(`${HOST}:${PORT}`));
  } catch (error) {
    console.log(error);
  }
}

listen(HOST, PORT, MONGODB_URI);
