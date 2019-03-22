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
    grid: {
      gridGap: '1px',
      gridTemplateColumns: '',
      gridTemplateRows: '',
      width: '100%',
      height: '100%',
    },
    gridClasses: '',
    components: [],
  }

  render() {
    const { name } = this.constructor;
    const { grid, gridClasses, components } = this.state;
    grid.display = 'grid';
    return (
      <div className={`Grid ${name}-Grid ${gridClasses}`} {...css(grid)}>
        {components.map((component, index) => (
          <div 
            key={`${name}-Grid-Element-${index}`}
            id={`${name}-Grid-Element-${index}`}
          >
            {component}
          </div>
        ))}
      </div>    
    );
  }
};

export const FunctionalGrid = ({
  name,
  grid,
  components,
  classes,
}) => {
  const style = css({
    width: '100%',
    height: '100%',
    ...grid,
    display: 'grid',
  });
  return (
    <div className={`Grid ${name}-Grid ${classes}`} {...style} >
      {components.map((component, index) => (
        <div 
          key={`${name}-Grid-Element-${index}`}
          id={`${name}-Grid-Element-${index}`}
        >
          {component}
        </div>
      ))}
    </div>    
  );
}

const Grid = StaticGrid;

export { DynamicGrid };
export default Grid;
