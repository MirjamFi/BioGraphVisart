import Joi from 'joi-browser';
import Form from './common/form';

class NewKeggNetworkVisForm extends Form {
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
      this.props.history.push('/vis', { graphmlSeed: target.result });
    };
    reader.readAsText(file);
  }
}

export default NewKeggNetworkVisForm;
