import React from 'react';

import { DynamicGrid } from '../../grid';
import PngExport from './pngExport';
import JsonExport from './jsonExport';

const ModeButton = ({
  label,
  buttonClass,
  onClick,
}) => (
  <button 
    className={`btn ${buttonClass}`}
    onClick={onClick}
  >{label}
  </button>
);

class ExportPanel extends DynamicGrid {
  state = {
    grid: {
      gridTemplateRows: '1fr 5fr',
    },
    currentMode: 'png',
  }

  constructor(props) {
    super(props);
    this.pngDefaultName = props.pngDefaultName || 'network.png';
    this.jpgDefaultName = props.jpgDefaultName || 'network.jpg';
    this.jsonDefaultName = props.jsonDefaultName || 'network.json';
    this.store = props.store;
    this.cyPath = props.cyPath;
  }

  getBtnClass(cmp, mode) {
    return cmp === mode ? 'btn-primary' : 'btn-warning';
  }

  onModeButtonClick = (mode) => {
    return () => this._render(mode);
  }

  _render = (mode) => {
    const modeButtons = (
      <React.Fragment>
        <ModeButton 
          label="PNG"
          buttonClass={this.getBtnClass('png', mode)}
          onClick={this.onModeButtonClick('png')}
        />
        <ModeButton 
          label="JPG"
          buttonClass={this.getBtnClass('jpg', mode)}
          onClick={this.onModeButtonClick('jpg')}
        />
        <ModeButton 
          label="JSON"
          buttonClass={this.getBtnClass('json', mode)}
          onClick={this.onModeButtonClick('json')}
        />
      </React.Fragment>
    );
    const components = [
      modeButtons,
      this.renderForm(mode),
    ]
    this.setState({ components });
  }

  renderForm(mode) {
    switch (mode) {
      case 'png':
        return (
          <PngExport 
            defaultName={this.pngDefaultName}
            store={this.store}
            cyPath={this.cyPath}
          />
        );
      case 'jpg':
        return 'jpg';
      case 'json':
        return (
          <JsonExport 
            defaultName={this.jsonDefaultName}
            store={this.store}
            cyPath={this.cyPath}
          />
        );
      default:
        return 'ERROR!';
    }
  }

  componentWillMount() {
    this._render('png');
  }
}

export default ExportPanel;
