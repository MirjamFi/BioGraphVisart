const mongoose = require('mongoose');

const visSchema = mongoose.Schema({
  id: String,
  data: {
    type: {
      elements: mongoose.Mixed,
      style: [mongoose.Mixed],
      zoomingEnabled: Boolean,
      userZoomingEnabled: Boolean,
      zoom: Number,
      minZoom: Number,
      maxZoom: Number,
      panningEnabled: Boolean,
      userPanningEnabled: Boolean,
      pan: mongoose.Mixed,
      boxSelectionEnabled: Boolean,
      renderer: mongoose.Mixed,
    },
  },
});

const Vis = mongoose.model('Vis', visSchema);

module.exports = Vis;