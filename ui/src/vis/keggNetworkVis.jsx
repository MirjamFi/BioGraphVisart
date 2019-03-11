import _ from 'lodash';
import React from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import { DynamicGrid } from '../utils/grid';
import Graph from '../utils/graph';

cytoscape.use(dagre);

const ControlPanelButton = ({
  key,
  classes,
  content,
  onClick,
}) => {
  return (
    <button
      key={key}
      className={classes}
      onClick={() => onClick()}>
      {content}
    </button>
  );
}

class KeggNetworkVis extends DynamicGrid {
  state = {
    columns: '1fr 25fr',
    components: [null, null],
    graph: null,
    layout: {
      name: 'dagre',
    },
    style: [],
    currentPanel: null,
    panel: {
      edit: {
        message: 'Edit Panel!',
      }
    },
  }

  panelControlButtons = {
    settings: {
      content: <i className="fa fa-cog"></i>,
      component: () => <h1>Settings Panel!</h1>,
    },
    info: {
      content: <i className="fa fa-info-circle"></i>,
      component: () => <h1>Info Panel!</h1>,
    },
    edit: {
      content: <i className="fa fa-edit"></i>,
      component: ({message}) => <h1>{message}</h1>,
    },
    download: {
      content: <i className="fa fa-download"></i>,
      component: () => <h1>Download Panel!</h1>,
    },
    save: {
      content: <i className="fa fa-cloud-upload"></i>,
      component: () => <h1>Save Panel!</h1>,
    },
    upload: {
      content: <i className="fa fa-upload"></i>,
      component: () => <h1>Upload Panel!</h1>,
    },
    cloud: {
      content: <i className="fa fa-cloud-download"></i>,
      component: () => <h1>Cloud Panel!</h1>,
    },
    publish: {
      content: <i className="fa fa-rocket"></i>,
      component: () => <h1>Publish Panel!</h1>,
    },
    movie: {
      content: <i className="fa fa-film"></i>,
      component: () => <h1>Movie Panel!</h1>,
    },
    snapshot: {
      content: <i className="fa fa-camera-retro"></i>,
      component: () => <h1>Snapshot Panel!</h1>,
    },
    notes: {
      content: <i className="fa fa-comment"></i>,
      component: () => <h1>Notes Panel!</h1>,
    },
    permissions: {
      content: <i className="fa fa-key"></i>,
      component: () => <h1>Permissions Panel!</h1>,
    },
    fork: {
      content: <i className="fa fa-code-fork"></i>,
      component: () => <h1>Fork Panel!</h1>,
    },
    del: {
      content: <i className="fa fa-trash"></i>,
      component: () => <h1>Deletion Panel!</h1>,
    },
  }

  panelControlButton(key, content) {
    return (
      ControlPanelButton({
        key,
        content,
        classes: 'btn btn-warning',
        onClick: () => this.clickPanelControlButton(key),
      })
    );
  }

  panelControl = (
    <React.Fragment>
      {_.keys(this.panelControlButtons).map((key) => (
        this.panelControlButton(key, this.panelControlButtons[key].content)
      ))}
    </React.Fragment>
  );

  constructor(props) {
    super(props);
    const searchParams = new URLSearchParams(props.location.search);
    this.graphmlSeed = decodeURI(searchParams.get('graphml'));
  }

  async componentDidMount() {
    const graph = await Graph.fromGraphML(this.graphmlSeed);
    const [nodesMin, nodesMax] = graph.getNodeAttrRange('v_deregnet_score');
    const nodes = graph.getNodesForVisualization('v_deregnet_score', 'v_symbol');
    const edges = graph.getEdgesForVisualization('e_interaction');
    const elements = nodes.concat(edges);
    const style = this.getStyle(nodesMin, nodesMax);
    const components = [
      this.panelControl,
      <CytoscapeComponent 
        elements={elements}
        layout={this.state.layout}
        stylesheet={style}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}
        cy={cy => this.cy = cy}
      />
    ];
    this.setState({ graph, style, components });
  }

  clickPanelControlButton(panel) {
    const { currentPanel } = this.state;
    if (panel === currentPanel) {
      this.collapsePanel();
    } else {
      this.expandPanel(panel);
    }
  }

  collapsePanel() {
    const components = [
      this.panelControl,
      <CytoscapeComponent
        cy={(cy) => {
          cy.json(this.cy.json());
          this.cy = cy;
        }}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}
      />
    ];
    this.setState({
      components,
      columns: '1fr 25fr',
      currentPanel: null,
    });
  }

  expandPanel(panel) {
    const { component: PanelComponent } = this.panelControlButtons[panel];
    const panelState = this.state.panel[panel];
    const components = [
      this.panelControl,
      PanelComponent ? PanelComponent(panelState) : null,
      <CytoscapeComponent
        cy={(cy) => {
          cy.json(this.cy.json());
          this.cy = cy;
        }}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}
      />
    ];
    this.setState({
      components,
      currentPanel: panel,
      columns: '1fr 5fr 20fr',
    });
  }

  getStyle(nodesMin, nodesMax) {
    return [ // style nodes
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
    ];
  }
};


export default KeggNetworkVis;
