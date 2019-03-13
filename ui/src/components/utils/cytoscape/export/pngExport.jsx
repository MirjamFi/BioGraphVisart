import Joi from 'joi-browser';

import CyExport from './cyExport';

class PngExport extends CyExport {
  state = {
    display: {
      background: '',
      full: '',
      scale: '',
      maxWidth: '',
      maxHeight: '',
    },
    data: {
      background: undefined,
      full: undefined,
      scale: undefined,
      maxWidth: undefined,
      maxHeight: undefined,
    },
    errors: {},
  }

  defaultName = 'network.png';

  inputs = {
    background: {
      label: 'Background',
    },
    full: {
      label: 'Full',
    },
    scale: {
      label: 'Scale',
    },
    maxWidth: {
      label: 'Maximum width',
    },
    maxHeight: {
      label: 'Maximum height',
    },
  }

  schema = {
    background: Joi.any(),
    full: Joi.any(),
    scale: Joi.any(),
    maxWidth: Joi.any(),
    maxHeight: Joi.any(),
  }

  async export() {
    const { data } = this.state;
    return this.cy.png({
      output: 'blob-promise',
      bg: data.background,
      full: data.full,
      scale: data.scale,
      maxWidth: data.maxWidth,
      maxHeight: data.maxHeight,
    });
  }
}

export default PngExport;
