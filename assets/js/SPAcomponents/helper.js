import React from 'react';

const HelperBubble = React.createClass({
  propTypes: {
    helperText: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.node
    ]).isRequired
  },

  render() {
    const { helperText } = this.props;

    return (
      <div className="helper-bubble">
        <div className="helper-bubble-inner">
          {helperText}
        </div>
      </div>
    );
  }
});

export default HelperBubble;