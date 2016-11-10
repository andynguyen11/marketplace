import React from 'react';
import FormHelpers from '../../utils/formHelpers';


const CreditCardForm = React.createClass({
  propTypes: {
    formElements: React.PropTypes.object,
    handleCheckboxChange: React.PropTypes.func,
    handleChange: React.PropTypes.func
  },

  render() {
    const { formElements, handleChange, handleCheckboxChange } = this.props;

    const notificationsChecked = {};
    if(formElements.saveCard.value) {
      notificationsChecked.checked = 'checked';
    }

    return(
      <div>
        <div className="col-md-10 col-md-offset-1">
          <div className="form-group">
            <h5>Input credit card details below to submit payment and proceed to contract signature.</h5>
          </div>

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

          <div className="card-meta">
            <div className={ 'card-meta-exp-month form-group ' + formElements.month.errorClass }>
              <label className="control-label" htmlFor={formElements.month.name}>{formElements.month.label}</label>
              <input
                className="form-control"
                type='text'
                name={formElements.month.name}
                id={formElements.month.name}
                value={formElements.month.value}
                onChange={handleChange}
                maxLength="2"
                placeholder="MM"
              />
            </div>

            <div className={ 'card-meta-exp-year form-group ' + formElements.year.errorClass }>
              <label className="control-label" htmlFor={formElements.year.name}>{formElements.year.label}</label>
              <input
                className="form-control"
                type='text'
                name={formElements.year.name}
                id={formElements.year.name}
                value={formElements.year.value}
                onChange={handleChange}
                maxLength="4"
                placeholder="YYYY"
              />
            </div>

            <div className={ 'card-meta-cvc form-group ' + formElements.cvc.errorClass }>
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

          {/*
          <div className="form-group">
            <div className='checkbox'>
              <label htmlFor={formElements.saveCard.name}>
                <input
                  type='checkbox'
                  id={formElements.saveCard.name}
                  name={formElements.saveCard.name}
                  value={!formElements.saveCard.value}
                  checked={formElements.saveCard.value}
                  onChange={handleCheckboxChange}
                />
                {formElements.saveCard.label}
              </label>
            </div>
          </div>
          */}

        </div>
      </div>
    )
  }
});

export default CreditCardForm;
