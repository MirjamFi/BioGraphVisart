import React, { Component } from 'react';
import { css } from 'glamor';

class Grid extends Component {
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

export default Grid;
