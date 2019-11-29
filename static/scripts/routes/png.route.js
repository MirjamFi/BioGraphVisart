const { Router } = require('express');
const bodyParser = require('body-parser');
const { getPng } = require('../controllers/png.controller');
const messages = require('../utils/messages.util');

const png = Router();

png.use(bodyParser.text({ type: 'application/xml' }));

png.get('/', async (req, res) => {
  try {
    const img = await getPng(req.body);
    res.header('Content-Type', 'image/png');
    res.end(img);
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  png,
};

