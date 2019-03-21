import Joi from 'joi-browser';

import CyExport from './cyExport';

class JsonExport extends CyExport {
  state = {
    display: {
      flatEles: '',
    },
    data: {
      flatEles: false,
    },
    errors: {},
  }

  inputs = {
    flatEles: {
      label: 'Flatten elements',
    },
  }

  schema = {
    flatEles: Joi.any(),
  }

  defaultName = 'network.json';

  async export() {
    const { flatEles } = this.state.data;
    const json = this.cy.json(flatEles);
    return new Blob(
      [JSON.stringify(json, null, 2)],
      { type : 'application/json' },
    );
  }
}

export default JsonExport;
