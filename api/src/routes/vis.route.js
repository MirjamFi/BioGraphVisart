const { Router } = require('express');
const bodyParser = require('body-parser');
const vis = require('../controllers/vis.controller');
const messages = require('../utils/messages.util');

const router = Router();

router.use(bodyParser.json());

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
  try {
    const response = await vis.put(req.params.id, req.body)
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

router.get('/:id', async (req, res) => {
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

router.get('/', async (req, res) => {
  try {
    const response = await vis.get();
    res.json(response);
  } catch (error) {
    console.log(error);
    messages.send(messages.INTERNAL_SERVER_ERROR, res);
  }
});

module.exports = {
  vis: router,
};
