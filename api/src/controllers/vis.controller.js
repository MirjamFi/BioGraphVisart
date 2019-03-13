const uuidv3 = require('uuid/v3');

const Vis = require('../models/vis.model');

const postVis = async (data) => {
  const id = uuidv3('domain', uuidv3.DNS)
  let vis;
  try {
    vis = new Vis({
      id,
      data,
    });
  } catch (error) {
    console.log(error);
    return false;
  }
  await vis.save();
  return {
    id,
    message: 'Visualization successfully posted.',
  }
}

const getVis = async (id) => {
  return Vis.findOne({ id });
}

module.exports = {
  get: getVis,
  post: postVis,
}
