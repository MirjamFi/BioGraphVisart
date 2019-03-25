import _ from 'lodash';
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import { FunctionalGrid } from '../utils/grid';
import Graph from '../../utils/graph';
import ExportPanel from '../utils/cytoscape/export/exportPanel';

import route from '../../utils/routing';
import store from '../../store';
import * as actions from '../../actions/vis.actions';
import * as api from '../../services/api/vis';

import Joi from 'joi-browser';
import Form from '../utils/forms/common/form';

import './styles/vis.css';

class LoadGraphMlForm extends Form {
  state = {
    display: {
      file: '',
    },
    data: {
      file: null,
    },
    errors: {},
  }

  inputs = {
    file: {
      label: 'Choose a GraphML file',
      autoFocus: true,
      type: 'file',
    },
  }

  config = {
    buttonLabel: 'Load',
  }

  schema = {
    file: Joi.string().regex(/.*\.(graphml|xml)$/),
  }

  async submit() {
    const { file } = this.state.data;
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      this.props.history.push(route('/viewer'), { graphmlSeed: target.result });
    };
    reader.readAsText(file);
  }
}


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
      style={{
        width: '95%',
        margin: '1px',
      }}
      onClick={onClick}>
      {content}
    </button>
  );
}

class Viewer extends Component {
  state = {
    grid: {
      gridTemplateColumns: '1fr 25fr',
      width: '100vw',
      height: '90vh',
    },
    components: [null, null],
    graph: null,
    cyJson: null,
    resetCytoscape: true,
    cytoscape: {
      layout: {
        name: 'dagre',
      },
      stylesheet: [],
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
      },
    },
    currentPanel: null,
    panel: {
      edit: {
        message: 'Edit Panel!',
      }
    },
  }

  get panelControlButtons() {
    return {
      settings: {
        content: <i className="fa fa-cog"></i>,
        component: () => <h1>Settings Panel!</h1>,
      },
      info: {
        content: <i className="fa fa-info-circle"></i>,
        component: () => <h1>Info Panel!</h1>,
      },
      legend: {
        content: <i className="fa fa-map"></i>,
        component: () => <h1>Legend Panel!</h1>,
      },
      edit: {
        content: <i className="fa fa-edit"></i>,
        component: ({message}) => (
          <React.Fragment>
            <h1>{message}</h1>
            <button 
              onClick={() => {
                console.log('RESET');
                // this.setState({ resetCytoscape: true })
              }} >
              Reset 
            </button>
          </React.Fragment>
        ),
      },
      data: {
        content: <i className="fa fa-table"></i>,
        component: () => <h1>Data Panel!</h1>,
      },
      export: {
        content: <i className="fa fa-download"></i>,
        component: () => (
          <ExportPanel 
            pngDefaultName="network.png"
            jsonDefaultName="network.json"
            store={store}
            cyPath="vis.cy"
          />
        ),
      },
      save: {
        content: <i className="fa fa-cloud-upload"></i>,
        component: () => (
          <React.Fragment>
            <button onClick={async () => {
              try {
                const data = store.getState().vis.cy.json();
                await api.putVis(this.visId, data);
              } catch (error) {
                console.log(error);
                toast.error('API ERROR!');
              }
            }}
            >
              Save 
            </button>
            <button onClick={async () => {
              try {
                const data = store.getState().vis.cy.json();
                await api.postVis(data);
              } catch (error) {
                console.log(error);
                toast.error('API ERROR!');
              }
            }}
            >
              Save As
            </button>
          </React.Fragment>
        ),
      },
      upload: {
        content: <i className="fa fa-upload"></i>,
        component: () => <LoadGraphMlForm history={this.props.history} />,
      },
      cloud: {
        content: <i className="fa fa-cloud-download"></i>,
        component: () => <h1>Cloud Panel!</h1>,
      },
      publish: {
        content: <i className="fa fa-rocket"></i>,
        component: () => <h1>Publish Panel!</h1>,
      },
      del: {
        content: <i className="fa fa-trash"></i>,
        component: () => <h1>Deletion Panel!</h1>,
      },
    }
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
    const { pathname } = props.location;
    const visId = pathname.replace(route('/viewer'), '').replace('/', '');
    if (visId !== '') {
      this.visId = visId;
    }

    if (props.location.state) {
      this.graphmlSeed = props.location.state.graphmlSeed;
    }
  }

  get cy() {
    return {
      init: (cy) => {
        this.cy.registerEventHandlers(cy);
        store.dispatch(actions.updateCy(cy));
      },

      update: (cy) => {
        const { cy: prevCy } = store.getState().vis;
        if (cy !== prevCy) {
          cy.json(prevCy.json());
          this.cy.init(cy);
        } 
      },

      registerEventHandlers: (cy) => {
        for (const registerEventHandler of _.values(this.cy.events)) {
          registerEventHandler(cy);
        }
      },

      events: {
        nodeOnCxttab: (cy) => {
          cy.on('cxttap', 'node', function(e) {
            const node = e.target;
            console.log( 'tapped ' + node.id() );
          });
        },
      },

      component: () => {
        const { graph, cyJson, resetCytoscape, cytoscape } = this.state;
        if (graph === null) {
          if (cyJson !== null) {
            return (
              <CytoscapeComponent
                cy={(cy) => {
                  cy.json(cyJson);
                  this.cy.init(cy);
                }}
                style={cytoscape.style}
              />
            );
          } else {
            return null
          }
        }
        if (resetCytoscape) {
          const [nodesMin, nodesMax] = graph.getNodeAttrRange('v_deregnet_score');
          const nodes = graph.getNodesForVisualization('v_deregnet_score', 'v_symbol');
          const edges = graph.getEdgesForVisualization('e_interaction');
          const elements = nodes.concat(edges);
          const stylesheet = this.getStyle(nodesMin, nodesMax);
          return (
            <CytoscapeComponent
              cy={(cy) => this.cy.init(cy)}
              style={cytoscape.style}
              elements={elements}
              stylesheet={stylesheet}
              layout={cytoscape.layout}
            />
          );
        } else {
          return (
            <CytoscapeComponent 
              cy={(cy) => this.cy.update(cy)}
              style={cytoscape.style}
            />
          );
        }
      }
    }
  }

  async componentWillMount() {
    let graph;
    if (this.visId) {
      try {
        const { data } = await api.getVis(this.visId);
        console.log(data.data.data);
        this.setState({ cyJson: data.data.data, resetCytoscape: false });
      } catch (error) {
        console.log(error);
        toast.error('API Error!');
        graph = new Graph();
      }
    } else if (this.graphmlSeed) {
      graph = await Graph.fromGraphML(this.graphmlSeed);
    } else {
      graph = new Graph();
    }
    this.setState({ graph });
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
    const grid = { ...this.state.grid };
    grid.gridTemplateColumns = '1fr 25fr';
    this.setState({
      grid,
      currentPanel: null,
      resetCytoscape: false,
    });
  }

  expandPanel(panel) {
    const grid = { ...this.state.grid };
    grid.gridTemplateColumns = '1fr 5fr 20fr';
    this.setState({
      grid,
      currentPanel: panel,
      resetCytoscape: false,
    });
  }

  render() {
    const { currentPanel, grid } = this.state;
    const components = [this.panelControl];
    if (currentPanel !== null) {
      const { component: PanelComponent } = this.panelControlButtons[currentPanel];
      const panelState = this.state.panel[currentPanel];
      components.push(PanelComponent ? PanelComponent(panelState) : null);
    }
    components.push(this.cy.component())
    return (
      <FunctionalGrid 
        name="Viewer"
        grid={grid}
        components={components}
      />
    );
  }

  getStyle(nodesMin, nodesMax) {
    if (nodesMin === undefined || nodesMax === undefined) {
      return {};
    }
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

export default Viewer;
