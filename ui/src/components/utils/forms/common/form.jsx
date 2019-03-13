import React, { Component } from 'react';
import _ from 'lodash';
import Joi from 'joi-browser';

import './styles/form.css';
import Input from './input';

class Form extends Component {
  state = {
    display: {},
    data: {},
    errors: {},
  };

  config = {
    'buttonLabel': 'Submit',
    'formClasses': '',
  }

  crossValidate = []
  _crossValidators = {}
  _inputsToCrossValidators = {}

  componentDidMount() {
    for (const [validator, ...inputs] of this.crossValidate) {
      inputs.sort();
      const key = inputs.join(',');
      this._crossValidators[key] = validator;
      for (const input of inputs) {
        this._inputsToCrossValidators[input] = key;
      }
    }
  }

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.display, this.schema, options);
    if (!error) return null;
    const errors = {};
    for (let item of error.details) {
      errors[item.path[0]] = item.message;
    }
    return errors;
  }

  validateProperty = (name, value) => {
    const property = {[name]: value};
    const propertySchema = {[name]: this.schema[name]};
    const { error } = Joi.validate(property, propertySchema);
    return error ? error.details[0].message : null;
  };

  handleChange = ({ currentTarget: input }) => {
    const { name, value } = input;
    const errors = {...this.state.errors};
    const errorMessage = this.validateProperty(name, value);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];
    const { display, data } = {...this.state};
    if (input.type === 'file') {
      data[name] = input.files[0];
    } else {
      data[name] = value;
    }
    display[name] = value;
    this.setState({ display, data, errors });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const errors = this.validate();
    if (errors) {
      this.setState({ errors }); 
      return;
    }
    await this.submit();
  };

  render() {
    const { display, errors } = this.state;
    const inputs = this.inputs;
    return (
      <form
        className={`form ${this.config.formClasses || null}`}
        onSubmit={this.handleSubmit}>
        {_.keysIn(display).map(name => {
          const input = inputs[name];
          return (
            <Input
              key={name}
              name={name}
              value={display[name]}
              onChange={this.handleChange}
              label={input.label}
              autoFocus={input.autoFocus}
              type={input.type} 
              error={errors[name]}
            />
          )
        })}
        <button 
          disabled={this.validate()}
          className="btn btn-primary">
          {this.config.buttonLabel}
        </button>
      </form>
    );
  }
}

export default Form;
