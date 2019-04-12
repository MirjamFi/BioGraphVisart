const { Router } = require('express');
const bodyParser = require('body-parser');
const vis = require('../controllers/interactiveVis.controller');
const messages = require('../utils/messages.util');
const path = require("path");


const interactiveVis = Router();

interactiveVis.use(bodyParser.text({ type: 'application/xml' }));
interactiveVis.use(bodyParser.text({ type: 'application/html' }));

interactiveVis.post('/', async (req, res) => {
  try {
    const response = await vis.post(req.body)

    if (response) {
      res.status(201);
      res.json(response);
    } else {
      messages.send(messages.INVALID_PAYLOAD, res);
    }
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR, res);
  }
});

interactiveVis.get('/:id', async (req, res) => {
  try {
    const response = await vis.getById(req.params.id);
    if (response) {
      res.json(response);
    } else {
      messages.send(messages.RESOURCE_NOT_FOUND, res);
    }
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR, res);
  }
});

interactiveVis.get('/', async (req, res) => {
  try {
    const response = await vis.get();
    res.render(path.resolve(__dirname +'/../templates/subgraphVisualization.html'), {cyto:response[1]["data"]});
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR, res);
  }
});


module.exports = {
  interactiveVis
};

