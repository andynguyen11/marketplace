import React from 'react';
import classNames from 'classnames';
import momentPropTypes from 'react-moment-proptypes';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import HelperBubble from './helper';
import { InputError } from './errors';

export const Input = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    prefix: React.PropTypes.string,
    suffix: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      placeholder: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      maxLength: React.PropTypes.number,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler() {
    const { config: { onChange } } = this.props;
    const input = this.refs.input;
    const value = input.value;

    onChange(value);
  },

  render() {
    const { className, prefix, suffix, inputDisabled, config: { name, label, value, error, placeholder, disabled, maxLength } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const inputError = error && <InputError>{error}</InputError>;
    const attrPlaceholder = !!placeholder && { placeholder };
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };
    const attrMaxLength = !!maxLength && { maxLength };
    const input = <input className="form-control" type="text" name={name} id={name} value={value} onChange={this.changeHandler} ref="input" {...attrPlaceholder} {...attrDisabled} {...attrMaxLength}/>;
    const inputGroup = !!prefix || !!suffix ? (
      <div className="input-group">
        { prefix && <div className="input-group-addon">{prefix}</div> }
        {input}
        { suffix && <div className="input-group-addon">{suffix}</div> }
      </div>
    ) : input;

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        {inputGroup}
        {inputError}
      </div>
    );
  }
});

export const DateInput = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.oneOfType([
        React.PropTypes.string,
        momentPropTypes.momentObj
      ]),
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      placeholder: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      minDate: React.PropTypes.oneOfType([
        React.PropTypes.string,
        momentPropTypes.momentObj
      ]),
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler(momentObj) {
    const { config: { onChange } } = this.props;
    const value = momentObj.format('YYYY-MM-DD');

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, error, placeholder, disabled, minDate } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const dateError = error && <InputError>{error}</InputError>;
    const attrPlaceholder = !!placeholder && { placeholder };
    const attrMinDate = !!minDate && { minDate };
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };
    const selectedDate = value ? { selected: moment(value) } : '';

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <DatePicker className="form-control" name={name} id={name} onChange={this.changeHandler} ref="date" {...attrPlaceholder} {...attrMinDate} {...attrDisabled} {...selectedDate} autoComplete="off"/>
        {dateError}
      </div>
    );
  }
});

export const Textarea = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      placeholder: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      maxLength: React.PropTypes.number,
      rows: React.PropTypes.number,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler() {
    const { config: { onChange } } = this.props;
    const textarea = this.refs.textarea;
    const value = textarea.value;

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, error, placeholder, disabled, maxLength, rows } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const textareaError = error && <InputError>{error}</InputError>;
    const attrPlaceholder = !!placeholder && { placeholder };
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };
    const attrMaxLength = !!maxLength && { maxLength };
    const attrRows = !!rows && { rows };

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <textarea className="form-control" name={name} id={name} value={value} onChange={this.changeHandler} ref="textarea" {...attrPlaceholder} {...attrDisabled} {...attrMaxLength} {...attrRows}></textarea>
        {textareaError}
      </div>
    );
  }
});

export const Select = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      options: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          id: React.PropTypes.string.isRequired,
          label: React.PropTypes.string.isRequired
        })
      ).isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      disabled: React.PropTypes.bool,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler() {
    const { config: { onChange } } = this.props;
    const select = this.refs.select;
    const value = select.value;

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, options, error, disabled } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const selectError = error && <InputError>{error}</InputError>;
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };

    const selectOptions = options && options.map((option, i) => {
        return <option key={i} value={option.id}>{option.label}</option>;
      });

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <select className="form-control" name={name} id={name} value={value} onChange={this.changeHandler} ref="select" {...attrDisabled}>
          {selectOptions}
        </select>
        {selectError}
      </div>
    );
  }
});

export const RadioGroup = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      options: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          id: React.PropTypes.string.isRequired,
          label: React.PropTypes.string.isRequired,
          disabled: React.PropTypes.bool
        })
      ).isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler(value) {
    const { config: { onChange } } = this.props;

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, options, error } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error });
    const radioError = error && <InputError>{error}</InputError>;

    const radioButtons = options && options.map((option, i) => {
        const attrChecked = { checked: value === option.id };
        const attrDisabled = (!!option.disabled || inputDisabled) && { disabled: option.disabled };
        const radioClass = classNames('radio', { 'form-group--disabled': !!option.disabled });
        const toggleRadio = () => {
          this.changeHandler(option.id);
        };

        return (
          <div className={radioClass} key={i}>
            <label>
              <input type="radio" name={name} id={option.id} value={option.id} onChange={toggleRadio} {...attrDisabled} {...attrChecked}/>
              {option.label}
            </label>
          </div>
        );
      });

    return (
      <div className={formGroupClass}>
        <label className="radio-group-label" htmlFor={name}>{label}</label>
        <div className="radio-group">
          {radioButtons}
        </div>
        {radioError}
      </div>
    );
  }
});