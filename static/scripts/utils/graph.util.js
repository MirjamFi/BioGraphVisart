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

  getNodesForVisualization(valueAttr, labelAttr) {
    const nodes = [...this.nodes];
    // add trick node for the node color legend
    const legendNode = {
      data: {
        _graphvisPseudoNode: 'nodeColorLegend',
      },
    };
    nodes.push(legendNode);
    return nodes.map(node => (
      {
        data: {
          id: node.id,
          label: node.data[labelAttr],
          val: parseFloat(node.data[valueAttr]),
          _graphvisPseudoNode: node.data['_graphvisPseudoNode'],
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

  getEdgesForVisualization(interactionAttr, showMultiple) {
    var edgesMultiple = this.edges.map(edge => (
      {
        data: {
          id: `${edge.source}${edge.target}_${edge.data[interactionAttr]}`,
          source: edge.source,
          target: edge.target,
          interaction: edge.data[interactionAttr],
        },
      }
    ));
    if(showMultiple == "false"){
      var len = edgesMultiple.length;
      for(var i = 0; i < len; i++){
        var j = i+1;
        while(j < len){
          if(edgesMultiple[i].data.source == edgesMultiple[j].data.source 
            && edgesMultiple[i].data.target== edgesMultiple[j].data.target){
            if(edgesMultiple[i].data.interaction != edgesMultiple[j].data.interaction){
              if(typeof edgesMultiple[i].data.interaction == "string"){
                edgesMultiple[i].data.interaction = [edgesMultiple[i].data.interaction];
                edgesMultiple[i].data.id = edgesMultiple[i].data.source+'_'+edgesMultiple[i].data.target+'_multiple';
                edgesMultiple[i].classes = "multiple"
              }
              edgesMultiple[i].data.interaction.push(edgesMultiple[j].data.interaction)
              edgesMultiple.splice(j, 1);
              len = edgesMultiple.length;
            }
          }
          else
            j++;
        }
      }
    }
    return edgesMultiple;
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

module.exports = {
  Graph,
};
