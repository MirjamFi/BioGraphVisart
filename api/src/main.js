const express = require('express');

const { png: pngRoute } = require('./routes/png.route');

const HOST = process.env.GRAPHVIS_HOST || 'localhost';
const PORT = process.env.GRAPHVIS_PORT || 3001;

const app = express();
app.use('/png', pngRoute);

app.listen(PORT, HOST, () => console.log(`${HOST}:${PORT}`));
