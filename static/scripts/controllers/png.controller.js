const fs = require('fs');
const path = require('path');
const cytosnap = require('cytosnap');
const { Graph } = require('../utils/graph.util');

cytosnap.use(['cytoscape-dagre']);

const IMAGES_PATH = path.resolve(__dirname, '../images');
const NODE_COLOR_LEGEND_BACKGROUND = fs.readFileSync(
  path.join(IMAGES_PATH, 'nodeColorLegendBackground.svg.base64'),
).toString();


const cytoSnapToPng = async (nodes, edges, nodesMin, nodesMax, valueAttr) => {
  const snap = cytosnap();
  await snap.start();
  const img = await snap.shot({
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
      {selector: 'edge',
        style: {
          'arrow-scale' : 2,
          'curve-style' : 'bezier',
          'font-size':16,
          'text-rotation':'autorotate',
          'font-weight':800,
          'target-arrow-shape': 'triangle-backcurve',
          'line-style':'dashed',
        }},
        {selector: 'edge[interaction = \'activation\']',
          style: {
            'target-arrow-shape': 'triangle',
            'line-style':'solid'
        }},
        {selector: 'edge[interaction = \'expression\']',
          style: {
            'target-arrow-shape': 'triangle',
            'line-style':'solid'
        }},
        {selector: 'edge[interaction = \'inhibition\']',
          style: {
            'target-arrow-shape': 'tee',
            'line-style':'solid'
        }},
        {selector: 'edge[interaction = \'repression\']',
          style: {
            'target-arrow-shape': 'tee',
            'line-style':'solid'
        }},
        {selector: 'edge[interaction = \'binding/association\']',
          style: {
            'target-arrow-shape': 'triangle-cross',
            'line-style':'solid'
        }},
        {selector: 'edge[interaction = \'dissociation\']',
          style: {
            'target-arrow-shape': 'triangle-cross',
            'line-style':'solid'
        }},
        {selector: 'edge[interaction = \'compound\']',
          style: {
            'target-arrow-shape': 'circle',
            'line-style':'solid'
        }},
      {selector: 'edge[interaction = \'indirect effect\']',
        style: {
          'line-style': 'dotted',
          'target-arrow-shape': 'triangle'
        }},
      {selector: 'edge[interaction = \'missing interaction\']',
        style: {
          'line-style': 'dashed',
          'target-arrow-shape': 'triangle'
        }},
        {selector: 'edge[interaction = \'state change\']',
          style: {
            'target-arrow-shape': 'square',
            'line-style':'solid'
        }},

      {selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
          'target-label':'+p',
          'target-text-offset':20,
          'line-style':'solid'
        }},
      {selector: 'edge[interaction = \'dephosphorylation\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'-p',
          'target-text-offset':20,
          'line-style':'solid'
        }},
      {selector: 'edge[interaction = \'glycosylation\']',
          style: {
           'target-arrow-shape': 'diamond',
           'target-label':'+g',
          'target-text-offset':20,
          'line-style':'solid'
        }},      
      {selector: 'edge[interaction = \'ubiquitination\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'+u',
          'target-text-offset':20,
          'line-style':'solid'
        }},
      {selector: 'edge[interaction = \'methylation\']',
          style: {
            'target-arrow-shape': 'diamond',
            'target-label':'+m',
          'target-text-offset':20,
          'line-style':'solid'
        }},
        {selector: '.multiple',
          style: {
            'target-arrow-shape': 'vee',
            'line-style':'solid',
        }},
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
    resolvesTo: 'base64',
    format: 'png',
    width: 1200,
    height: 1200,
    background: 'transparent',
  });
  snap.stop(); /* TODO: may be inefficient since cytosnap
  basically launches and closes a browser for every request?... */
  return Buffer.from(img, 'base64');
};

const getNodeValueRange = (nodes) => {
  const nodesFilteredNaN = nodes.filter(node => !Number.isNaN(parseFloat(node.data.val)));
  if(nodesFilteredNaN.length == 0){
    return ['false', 'true']
  }
  const nodesMin = parseFloat(Math.min(...nodesFilteredNaN.map(node => node.data.val))).toFixed(2);
  const nodesMax = parseFloat(Math.max(...nodesFilteredNaN.map(node => node.data.val))).toFixed(2);
  return [nodesMin, nodesMax];
};

const getPng = async (
  graphmlStr,
  valueAttr = 'v_deregnet_score',
  labelAttr = 'v_symbol',
  interactionAttr = 'e_interaction',
  showmultiple = false
) => {
  var splitString = graphmlStr.split("&");
  if(splitString.length > 1){
    for(var i = 1; i < splitString.length; i++){
      var splitValue = splitString[i].split(":");
      if(splitValue[0].includes("valueAttr")){
        valueAttr = splitValue[1];
      }
      else if(splitValue[0].includes("labelAttr")){
        labelAttr = splitValue[1];
      }
      else if(splitValue[0].includes("interactionAttr")){
        interactionAttr = splitValue[1];
      }
      else if(splitValue[0].includes("showmultiple")){
        showmultiple = splitValue[1];
      }
    }
    
  }
  const graph = await Graph.fromGraphML(graphmlStr);
  const nodes = graph.getNodesForVisualization(valueAttr, labelAttr);
  const edges = graph.getEdgesForVisualization(interactionAttr, showmultiple);
  const [nodesMin, nodesMax] = getNodeValueRange(nodes);
  return cytoSnapToPng(nodes, edges, nodesMin, nodesMax, valueAttr);
};
};

module.exports = {
  getPng,
};
