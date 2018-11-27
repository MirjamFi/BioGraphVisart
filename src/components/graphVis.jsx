import React, { Component } from 'react';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);

class GraphVis extends Component {
  render() {
    const elements = [
      { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
      { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
      { data: { id: 'three', label: 'Node 3' }, position: { x: 0, y: 100 } },
      { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
      { data: { source: 'one', target: 'three', label: 'Edge from Node1 to Node3' } },
    ];
    const style = {
      width: '1200px',
      height: '600px',
    };
    const layout = {
      name: 'dagre',
    }
    return <CytoscapeComponent elements={elements} style={style} layout={layout} />;
  }
}

export default GraphVis;
