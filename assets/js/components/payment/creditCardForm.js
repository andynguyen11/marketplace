import React from 'react';
import FormHelpers from '../../utils/formHelpers';


const CreditCardForm = React.createClass({
  getInitialState: function () {
    return {
      is_loading: false,
      creditCard: {
        number: '',
        month: '',
        year: '',
        cvc: ''
      }
    }
  },

  render() {
    const { formElements, formError, useNewCard } = this.props;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    return(
      <div>
          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.number.name}>{formElements.number.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.number.name}
              id={formElements.number.name}
              value={formElements.number.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-xs-4">
            <label className="control-label" htmlFor={formElements.month.name}>{formElements.month.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.month.name}
              id={formElements.month.name}
              value={formElements.month.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-xs-4">
            <label className="control-label" htmlFor={formElements.year.name}>{formElements.year.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.year.name}
              id={formElements.year.name}
              value={formElements.year.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-xs-4">
            <label className="control-label" htmlFor={formElements.cvc.name}>{formElements.cvc.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.cvc.name}
              id={formElements.cvc.name}
              value={formElements.cvc.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="clearfix"></div>

          <div className="form-group">
            {error}
            <input type="checkbox" className="form-control" /> Save this information for future purchases on Loom.
          </div>
      </div>
    )
  }
});

export default CreditCardForm;
