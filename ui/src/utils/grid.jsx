import React, { Component } from 'react';
import { css } from 'glamor';

class StaticGrid extends Component {
  gap = '1px';
  classes = '';

  render() {
    const { components } = this;
    const { name } = this.constructor;
    const style = css({
      display: 'grid',
      gridGap: this.gap,
      gridTemplateColumns: this.columns,
      gridTemplateRows: this.rows,
      width: '100vw',
      height: '90vh',
    });
    return (
      <div className={`Grid ${name}-Grid ${this.classes}`} {...style}>
        {components.map((component, index) => (
          <div key={`${name}-Grid-Element-${index}`}>{component}</div>
        ))}
      </div>    
    );
  }
};

class DynamicGrid extends Component {
  state = {
    gap: '1px',
    classes: '',
    columns: '',
    rows: '',
    components: [],
  }

  render() {
    const { gap, classes, columns, rows, components } = this.state;
    const { name } = this.constructor;
    const style = css({
      display: 'grid',
      gridGap: gap,
      gridTemplateColumns: columns,
      gridTemplateRows: rows,
      width: '100vw',
      height: '90vh',
    });
    return (
      <div className={`Grid ${name}-Grid ${classes}`} {...style}>
        {components.map((component, index) => (
          <div key={`${name}-Grid-Element-${index}`}>{component}</div>
        ))}
      </div>    
    );
  }
};

const Grid = StaticGrid;

export { DynamicGrid };
export default Grid;
