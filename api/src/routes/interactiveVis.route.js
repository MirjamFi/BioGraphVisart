const { Router } = require('express');
const bodyParser = require('body-parser');
const  { createCyto } = require('../controllers/interactiveVis.controller');
const messages = require('../utils/messages.util');


const interactiveVis = Router();

interactiveVis.use(bodyParser.text({ type: 'application/xml' }));

interactiveVis.get('/', async (req, res) => {
  try {
    const img = await createCyto(req.body);
    res.end(JSON.stringify(img));
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR);
  }
});

interactiveVis.post('/', async (req, res) => {
  try {
    const img = await createCyto(req.body);
    res.end(JSON.stringify(img));
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  interactiveVis
};

