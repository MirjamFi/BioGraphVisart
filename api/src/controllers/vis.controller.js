const uuidv4 = require('uuid/v4');

const Vis = require('../models/vis.model');

const postVis = async (data) => {
  const id = uuidv4()
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

const putVis = async (id, data) => {
  const vis = await Vis.updateOne({ id }, { data });
  if (!vis) {
    return vis;
  }
  return {
    id,
    message: 'Visualization successfully updated.',
  }
}

const getVisById = async (id) => {
  return Vis.findOne({ id });
}

const getVis = async () => {
  return Vis.find();
}

module.exports = {
  getById: getVisById,
  get: getVis,
  put: putVis,
  post: postVis,
}
