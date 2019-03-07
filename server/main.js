const xml2js = require('xml2js');
const express = require('express');
const bodyParser = require('body-parser');
const cytoscape = require('cytoscape');
const dagre = require('cytoscape-dagre');
const cytosnap = require('cytosnap');

cytoscape.use(dagre);
cytosnap.use(['cytoscape-dagre']);

const app = express();
app.use(bodyParser.text({ type: 'application/xml' }));

class Graph {
  constructor(data) {
    this.data = data;
  }

  get nodedata() {
    return this.data.graphml.graph[0].node;
  }

  get nodes() {
    const { nodedata } = this;
    const nodes = nodedata.map(node => (
      {
        id: node.$.id,
        data: {},
      }
    ));
    this.nodedata.forEach((node, index) => {
      node.data.forEach((data) => {
        Object.assign(nodes[index].data, { [data.$.key]: data._ });
      });
    });
    return nodes;
  }

  getNodesForVisualization(valueAttr, labelAttr) {
    return this.nodes.map(node => (
      {
        data: {
          id: node.id,
          label: node.data[labelAttr],
          val: parseFloat(node.data[valueAttr]),
        },
      }
    ));
  }

  get edgedata() {
    return this.data.graphml.graph[0].edge;
  }

  get edges() {
    const { edgedata } = this;
    const edges = edgedata.map(edge => (
      {
        source: edge.$.source,
        target: edge.$.target,
        data: {},
      }
    ));
    edgedata.forEach((edge, index) => {
      edge.data.forEach((data) => {
        Object.assign(edges[index].data, { [data.$.key]: data._ });
      });
    });
    return edges;
  }

  getEdgesForVisualization(interactionAttr) {
    return this.edges.map(edge => (
      {
        data: {
          id: `${edge.source}${edge.target}_${edge.data.interaction}`,
          source: edge.source,
          target: edge.target,
          interaction: edge.data[interactionAttr],
        },
      }
    ));
  }
}

const parseGraphML = graphmlStr => (
  new Promise((resolve, reject) => {
    xml2js.parseString(graphmlStr, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(new Graph(data));
    });
  })
);

/*

const setDiff = (A, B) => new Set([...A].filter(elem => !B.has(elem)));
const isSubset = (A, B) => setDiff(A, B).size === 0;

const booleanLegendNecessary = (nodes) => {
  const values = new Set(nodes.map(node => node.val));
  const zeroOne = new Set([0, 1]);
  if (isSubset(values, zeroOne)) {
    return true;
  }
  return false;
};

*/

const getPng = async (nodes, edges, nodesMin, nodesMax) => {
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
          'target-arrow-shape': 'triangle',
          'arrow-scale' : 2,
          'curve-style' : 'bezier'
        }},
      {selector: 'edge[interaction = \'compound\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        }},
      {selector: 'edge[interaction = \'activation\']',
        style: {
          'target-arrow-shape': 'triangle',
        }},
      {selector: 'edge[interaction = \'expression\']',
        style: {
          'target-arrow-shape': 'triangle-backcurve',
        }},
      {selector: 'edge[interaction = \'phosphorylation\']',
        style: {
          'target-arrow-shape': 'diamond',
        }},
      {selector: 'edge[interaction = \'inhibition\']',
        style: {
          'target-arrow-shape': 'tee',
        }},
      {selector: 'edge[interaction = \'indirect effect\']',
        style: {
          'target-arrow-shape': 'circle',
        }},
      {selector: 'edge[interaction = \'state change\']',
        style: {
          'target-arrow-shape': 'square',
        }},
      {selector: 'node[val <0]',
        style: {
            'background-color':'mapData(val,'+ nodesMin+', 0, #006cf0, white)',
            'color': 'black'
        }},
      {selector: 'node[val <='+0.5*nodesMin+']',
        style: {
            'color': 'white'
        }},
      {selector: 'node[val >0]',
        style: {
            'background-color':'mapData(val, 0,'+ nodesMax+', white, #d50000)',
            'color': 'black'
        }},
      {selector: 'node[val >='+0.5*nodesMax+']',
        style: {
            'color': 'white'
        }}
      ],
    resolvesTo: 'base64',
    format: 'png',
    width: 1200,
    height: 1200,
    background: 'transparent'
    });
  return Buffer.from(img, 'base64');
}

const visualize = async (
  graphmlStr,
  valueAttr = 'v_deregnet_score',
  labelAttr = 'v_symbol',
  interactionAttr = 'e_interaction',
) => {
  const graphml = await parseGraphML(graphmlStr);
  const nodes = graphml.getNodesForVisualization(valueAttr, labelAttr);
  const edges = graphml.getEdgesForVisualization(interactionAttr);
  const nodesMin = Math.min(...nodes.map(node => node.val)).toFixed(2);
  const nodesMax = Math.max(...nodes.map(node => node.val)).toFixed(2);
  return getPng(nodes, edges, nodesMin, nodesMax);
};

app.get('/png', async (req, res) => {
  const img = await visualize(req.body);
  res.header('Content-Type', 'image/png');
  res.end(img);
});

app.listen(3001);
