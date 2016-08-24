import React from 'react';
import FormHelpers from '../../utils/formHelpers';


const CreditCardForm = React.createClass({
  propTypes: {
    formElements: React.PropTypes.object,
    formError: React.PropTypes.bool,
    formErrorsList: React.PropTypes.array,
    handleCheckboxChange: React.PropTypes.func,
    handleChange: React.PropTypes.func
  },

  render() {
    const { formElements, formError, formErrorsList, handleChange, handleCheckboxChange } = this.props;
    const error = formError && function() {
      let errorsList = formErrorsList.map((thisError, i) => {
        return <span key={i}>{thisError}<br/></span>;
      });

      if(!formErrorsList.length){
        errorsList = formError;
      }

      return <div className="alert alert-danger text-left" role="alert">{errorsList}</div>;
    }();

    const notificationsChecked = {};
    if(formElements.save_card.value) {
      notificationsChecked.checked = 'checked';
    }

    return(
      <div>
          <div className="col-md-10 col-md-offset-1">
            <div className="form-group">
              <h5>Input credit card details below to submit payment and proceed to contract signature.</h5>
            </div>
          </div>
          <div className="col-md-10 col-md-offset-1">
            <div className={ 'form-group ' + formElements.number.errorClass }>
              <label className="control-label" htmlFor={formElements.number.name}>{formElements.number.label}</label>
              <input
                className="form-control"
                type='text'
                name={formElements.number.name}
                id={formElements.number.name}
                value={formElements.number.value}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-xs-3 col-xs-offset-1">
            <div className={ 'form-group ' + formElements.month.errorClass }>
              <label className="control-label" htmlFor={formElements.month.name}>{formElements.month.label}</label>
              <input
                className="form-control"
                type='text'
                name={formElements.month.name}
                id={formElements.month.name}
                value={formElements.month.value}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-xs-3">
            <div className={ 'form-group ' + formElements.year.errorClass }>
              <label className="control-label" htmlFor={formElements.year.name}>{formElements.year.label}</label>
              <input
                className="form-control"
                type='text'
                name={formElements.year.name}
                id={formElements.year.name}
                value={formElements.year.value}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-xs-4">
            <div className={ 'form-group ' + formElements.cvc.errorClass }>
              <label className="control-label" htmlFor={formElements.cvc.name}>{formElements.cvc.label}</label>
              <input
                className="form-control"
                type='text'
                name={formElements.cvc.name}
                id={formElements.cvc.name}
                value={formElements.cvc.value}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-10 col-md-offset-1">
            <div className="form-group">
              <div className='checkbox'>
                <label htmlFor={formElements.save_card.name}>
                  <input
                    type='checkbox'
                    name={formElements.save_card.name}
                    value={!formElements.save_card.value}
                    checked={formElements.save_card.value}
                    onChange={handleCheckboxChange}
                  />
                  {formElements.save_card.label}
                </label>
              </div>
            </div>
          </div>

          <div className="clearfix"></div>

          <div className="col-md-10 col-md-offset-1">
            <div className="form-group">
              {error}
            </div>
          </div>
      </div>
    )
  }
});

export default CreditCardForm;
