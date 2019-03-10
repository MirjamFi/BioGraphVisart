const xml2js = require('xml2js');

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

  getNodeAttrRange(attr) {   
    const nodesMin = parseFloat(Math.min(...this.nodes.map(node => node.data[attr]))).toFixed(2);
    const nodesMax = parseFloat(Math.max(...this.nodes.map(node => node.data[attr]))).toFixed(2);
    return [nodesMin, nodesMax];
  };

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

  static fromGraphML(graphmlStr) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(graphmlStr, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(new Graph(data));
      });
    });
  }
}

export default Graph;
