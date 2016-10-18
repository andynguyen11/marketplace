import React from 'react';

const processApiError = (apiError) => {
  const { title } = apiError;
  let errorText = 'Something went wrong! Please try again.';

  if(title) {
    if(Array.isArray(title)){
      const thisError = title[0]
      if(thisError === 'Project with this title already exists.') {
        errorText = 'A project with this name already exists!'
      }
    }
  }

  console.warn(errorText);
  return errorText;
};

export const InputError = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired
  },

  render() {
    const { children } = this.props;

    return <div className="form-error"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> {children}</div>;
  }
});

export const ApiError = React.createClass({
  getInitialState() {
    return {
      errorMessage: ''
    };
  },

  componentWillMount() {
    const { error } = this.props;
    const errorMessage = processApiError(error);

    this.setState({ errorMessage });
  },

  render() {
    const { errorMessage } = this.state;

    return <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> {errorMessage}</div>;
  }
});