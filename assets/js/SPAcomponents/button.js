import React from 'react';
import classNames from 'classnames';

const Button = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    onClick: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    isLoading: React.PropTypes.bool,
    buttonType: React.PropTypes.string,
    size: React.PropTypes.string,
    pretty: React.PropTypes.bool,
    fullWidth: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      buttonType: 'primary'
    };
  },

  render() {
    const { children, onClick, className, disabled, isLoading, buttonType, size, fullWidth, pretty } = this.props;
    const buttonClass = classNames('SPAbutton', className, {
      'SPAbutton--secondary': buttonType === 'secondary',
      'SPAbutton--tertiary': buttonType === 'tertiary',
      'SPAbutton--large': size === 'large',
      'SPAbutton--small': size === 'small',
      'SPAbutton--full': fullWidth,
      'SPAbutton--pretty': pretty
    });
    const attrDisabled = !!disabled && { disabled: true };
    const loadingIcon = isLoading && <i className="fa fa-circle-o-notch fa-spin fa-fw"></i>;

    return (
      <button className={buttonClass} onClick={onClick} {...attrDisabled}>
        {children}
        {loadingIcon}
      </button>
    );
  }
});

export default Button;