import _ from 'lodash';
import Joi from 'joi-browser';
import { saveAs } from 'file-saver';
import Form from '../../forms/common/form';

import store from '../../../../store';

class PngExport extends Form {
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

  config = {
    buttonLabel: 'Download',
  }

  schema = {
    background: Joi.any(),
    full: Joi.any(),
    scale: Joi.any(),
    maxWidth: Joi.any(),
    maxHeight: Joi.any(),
  }

  constructor(props) {
    super(props);
    this.defaultName = props.defaultName || 'network.png';
    this.cyPath = props.cyPath;
  }

  async submit() {
    const {
      background: bg,
      full,
      scale,
      maxWidth,
      maxHeight,
    } = this.state.data;
    const { cy } = _.get(store.getState(), this.cyPath);
    const png = await cy.png({
      output: 'blob-promise',
      bg,
      full,
      scale,
      maxWidth,
      maxHeight,
    });
    saveAs(png, this.defaultName);
  }
}

export default PngExport;
