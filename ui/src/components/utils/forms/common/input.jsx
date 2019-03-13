import React from 'react';

const Input = (props) => {
  const {
    name,
    value,
    label,
    onChange,
    autoFocus,
    type,
    error,
  } = props;
  return (
    <div className="form-group">
      <label
        htmlFor={name}
        className={(type === 'file') ? 'file-input' : null}
      >
        {(type === 'file') ? <i className="fa fa-cloud-upload"></i> : null} {label}
      </label>
      {(type === 'file') ? value : null}
      <input 
        autoFocus={autoFocus}
        name={name}
        value={value}
        onChange={onChange}
        className="form-control"
        id={name}
        type={type}
      />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
