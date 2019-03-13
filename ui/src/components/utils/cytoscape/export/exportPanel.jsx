import React from 'react';

import { DynamicGrid } from '../../grid';
import PngExport from './pngExport';
import JsonExport from './jsonExport';

class ExportPanel extends DynamicGrid {
  state = {
    grid: {
      gridTemplateRows: '1fr 5fr',
    },
  }

  constructor(props) {
    super(props);
    this.pngDefaultName = props.pngDefaultName || 'network.png';
    this.jpgDefaultName = props.jpgDefaultName || 'network.jpg';
    this.jsonDefaultName = props.jsonDefaultName || 'network.json';
    this.store = props.store;
    this.cyPath = props.cyPath;
  }

  componentWillMount() {
    const components = [
      <h3>Mode buttons</h3>,
      <JsonExport 
        defaultName={this.jsonDefaultName}
        store={this.store}
        cyPath={this.cyPath}
      />
    ]
    this.setState({ components });
  }
}

export default ExportPanel;
