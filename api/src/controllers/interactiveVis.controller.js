const fs = require('fs');
const path = require('path');
const cytosnap = require('cytosnap');
const { Graph } = require('../utils/graph.util');

cytosnap.use(['cytoscape-dagre']);


const IMAGES_PATH = path.resolve(__dirname, '../images');
const NODE_COLOR_LEGEND_BACKGROUND = fs.readFileSync(
  path.join(IMAGES_PATH, 'nodeColorLegendBackground.svg.base64'),
).toString();


const cyto = async (nodes, edges, nodesMin, nodesMax, valueAttr) => {
  const img = await {
    elements: nodes.concat(edges),
    layout: {
      name: 'dagre',
    },
    style: [ // style nodes
      {
        selector: 'node',
        style: {
          width: 50,
          height: 50,
          shape: 'ellipse',
          'background-color': 'white',
          'border-color': 'black',
          'border-style': 'solid',
          'border-width': '2',
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 10,
        },
      },
      // attributes with numbers
      {
        selector: 'node[val < 0]',
        style: {
          'background-color': `mapData(val, ${nodesMin}, 0, #006cf0, white)`,
          color: 'black',
        },
      },
      {
        selector: `node[val <= ${0.5 * nodesMin}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[val > 0]',
        style: {
          'background-color': `mapData(val, 0, ${nodesMax}, white, #d50000)`,
          color: 'black',
        },
      },
      {
        selector: `node[val >= ${0.5 * nodesMax}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[val = 0]',
        style: {
          'background-color': 'white',
          color: 'black',
        },
      },
      // attributes with boolean
      {
        selector: 'node[val = "false"]',
        style: {
          'background-color': '#006cf0',
          color: 'white',
        },
      },
      {
        selector: 'node[val = "true"]',
        style: {
          'background-color': '#d50000',
          color: 'white',
        },
      },
      // style edges
      {
        selector: 'edge',
        style: {
          'target-arrow-shape': 'triangle',
          'arrow-scale': 2,
          'curve-style': 'bezier',
        },
      },
      {
        selector: 'edge[interaction = \'compound\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        },
      },
      {
        selector: 'edge[interaction = \'activation\']',
        style: {
          'target-arrow-shape': 'triangle',
        },
      },
      {
        selector: 'edge[interaction = \'expression\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        },
      },
      {
        selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
        },
      },
      {
        selector: 'edge[interaction = \'inhibition\']',
        style: {
          'target-arrow-shape': 'tee',
        },
      },
      {
        selector: 'edge[interaction = \'indirect effect\']',
        style: {
          'target-arrow-shape': 'circle',
        },
      },
      {
        selector: 'edge[interaction = \'state change\']',
        style: {
          'target-arrow-shape': 'square',
        },
      },
      {
        selector: 'node[val < 0]',
        style: {
          'background-color': `mapData(val, ${nodesMin}, 0, #006cf0, white)`,
          color: 'black',
        },
      },
      {
        selector: `node[val <= ${0.5 * nodesMin}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[val > 0]',
        style: {
          'background-color': `mapData(val, 0, ${nodesMax}, white, #d50000)`,
          color: 'black',
        },
      },
      {
        selector: `node[val >= ${0.5 * nodesMax}]`,
        style: {
          color: 'white',
        },
      },
      {
        selector: 'node[!val]',
        style: {
          color: 'black',
        },
      },
      {
        selector: 'node[_graphvisPseudoNode = "nodeColorLegend"]',
        style: {
          'background-image': NODE_COLOR_LEGEND_BACKGROUND,
          color: 'black',
          'background-height': 50,
          'background-width': 200,
          'background-position-y': '100%',
          shape: 'rectangle',
          width: 200,
          height: 50,
          'border-width': 1,
          label: `min: ${nodesMin} ${valueAttr} max:${nodesMax}`,
          'text-valign': 'bottom',
          'text-max-width': 200,
          'font-size': 12,
        },
      },
    ], 
  };
  return img;
};

const getNodeValueRange = (nodes) => {
  const nodesFilteredNaN = nodes.filter(node => !Number.isNaN(node.data.val));
  const nodesMin = parseFloat(Math.min(...nodesFilteredNaN.map(node => node.data.val))).toFixed(2);
  const nodesMax = parseFloat(Math.max(...nodesFilteredNaN.map(node => node.data.val))).toFixed(2);
  return [nodesMin, nodesMax];
};

const createCyto = async (
  graphmlStr,
  valueAttr = 'v_deregnet_score',
  labelAttr = 'v_symbol',
  interactionAttr = 'e_interaction',
) => {
  const graph = await Graph.fromGraphML(graphmlStr);
  const nodes = graph.getNodesForVisualization(valueAttr, labelAttr);
  const edges = graph.getEdgesForVisualization(interactionAttr);
  const [nodesMin, nodesMax] = getNodeValueRange(nodes);
  return cyto(nodes, edges, nodesMin, nodesMax, valueAttr);
};

module.exports = {
  createCyto
};


/*const postVis = async (data) => {
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
}*/
