import React from 'react';
import ReactDOM from 'react-dom';
import CreditCardForm from './creditCardForm';
import CreditCardList from './creditCardList';
import FormHelpers from '../../utils/formHelpers';
import _ from 'lodash';

let Checkout = React.createClass({
  propTypes: {
    job: React.PropTypes.object,
    updateNDA: React.PropTypes.func
  },

  getInitialState() {
    const { job } = this.props;
    return {
      isLoading: false,
      sendingPayment: false,
      applyingPromo: false,
      showCreditCardForm: false,
      cards: [],
      currentCard: null,
      creditCard: {
        number: '',
        month: '',
        year: '',
        cvc: '',
        save_card: false,
      },
      promo : '',
      promo_message: '',
      promo_error: '',
      formError: false,
      formErrorsList: [],
      price: 3 * parseInt(job.hours)
    }
  },

  componentWillMount() {
    this.setState({
      formElements: this.formElements()
    });
  },

  componentDidMount() {
    this.setState({ isLoading:true });
    $.ajax({
      url: loom_api.creditcard,
      success: function (result) {
        this.setState({
          cards: result,
          showCreditCardForm: result.length == 0,
          isLoading: false
        });
      }.bind(this)
    });
  },

  formElements() {
    const { creditCard } = this.state;

    return {
      number: {
        name: 'number',
        label: 'Credit Card Number',
        value: creditCard.number || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList, promo } = this.state;
          const valid = promo ? true : FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.number.errorClass = 'has-error';
            formErrorsList.push('Please add a credit card number.');
          } else {
            formElements.number.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.number = value;
          this.setState({ creditCard });
        }
      },
      month: {
        name: 'month',
        label: 'Expiration Month',
        placeholder: 'MM',
        value: creditCard.month || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList, promo } = this.state;
          const valid = promo ? true : FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.month.errorClass = 'has-error';
            formErrorsList.push('Please add an expiry month.');
          } else {
            formElements.month.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.month = value;
          this.setState({ creditCard });
        }
      },
      year: {
        name: 'year',
        label: 'Expiration Year',
        placeholder: 'YYYY',
        value: creditCard.year || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList, promo } = this.state;
          const valid = promo ? true : FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.year.errorClass = 'has-error';
            formErrorsList.push('Please add an expiry year.');
          } else {
            formElements.year.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.year = value;
          this.setState({ creditCard });
        }
      },
      cvc: {
        name: 'cvc',
        label: 'Security Code',
        value: creditCard.cvc || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList, promo } = this.state;
          const valid = promo ? true : FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.cvc.errorClass = 'has-error';
            formErrorsList.push('Please add a security code.');
          } else {
            formElements.cvc.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.cvc = value;
          this.setState({ creditCard });
        }
      },
      save_card: {
        name: 'save_card',
        label: 'Save this information for future purchases on Loom.',
        value: creditCard.save_card || false,
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.save_card = value;
          this.setState({ creditCard });
        }
      }
    }
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  handleCheckboxChange(event) {
    const { formElements } = this.state;
    let { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    if(value === 'false') {
      value = false;
    } else {
      value = true;
    }

    formElements[fieldName].value = value;
    formElements[fieldName].update(value);

    this.setState({ formElements, formError: false });
  },

  setCard(e) {
    this.setState({
      currentCard: e.currentTarget.value,
      showCreditCardForm: false
    });
  },

  showCardForm() {
    this.setState({
      showCreditCardForm: true
    });
  },

  applyPromo() {
    // TODO Need to reimplement with dynamic pricing by updating order on backend when promo is applied
    this.setState({ applyingPromo: true, promo_error: '' })
    $.ajax({
      url: loom_api.promo,
      method: 'POST',
      data: JSON.stringify({
        promo: $('#promo').val()
      }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (result) {
        this.setState({
          promo: $('#promo').val().toLowerCase(),
          promo_message: result.message,
          price: 0,
          applyingPromo: false,
          showCreditCardForm: false,
          currentCard: null,
          cards: []
        });
      }.bind(this),
      error: function(result) {
        this.setState({
          promo_error: result.responseText,
          applyingPromo: false
        });
      }.bind(this)
    })
  },

  submitPayment() {
    const { formElements, currentCard, creditCard } = this.state;
    const { job } = this.props;

    if (currentCard) {
      this.setState({ formError: false, sendingPayment: true });
      $.ajax({
        url: loom_api.creditcard,
        method: 'PATCH',
        data: JSON.stringify({
          card: this.state.currentCard,
          customer: this.state.cards[0].customer,
          job: job.id,
          promo: this.state.promo
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
          window.location = result.url;
        }.bind(this)
      });
    }
    else {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements});
        if (valid) {
          this.setState({formError: false, sendingPayment: true});
          $.ajax({
            url: loom_api.creditcard,
            method: 'POST',
            data: JSON.stringify({
              card: creditCard,
              job: job.id,
              promo: this.state.promo
            }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (result) {
              window.location = result.url;
            }.bind(this)
          });
        } else {
          this.setState({formError: 'Please fill out all fields.'});
        }
      });
    }
  },

  render() {
    const { job, terms } =  this.props;
    const { price, promo, isLoading, applyingPromo, formElements, formError, formErrorsList, showCreditCardForm, cards, sendingPayment, promo_error, promo_message } = this.state;

    return(
      <div className="messages-tracker-content">
        <div className="checkout messages-tracker-popup-content">
          <div className="col-md-10 col-md-offset-1">
            <h5>Almost done!</h5>
            <h5>
              Loom takes a small service fee for facilitating the connection and contract between you
              and the developer.
            </h5>
          </div>
          <div className="fee-container col-md-10 col-md-offset-1">
            <strong>Loom service fee breakdown:</strong>
            <div className="fee-details">
              <strong>$3 x {job.hours} total project hours in {terms.project.title} contract.</strong>
              <div className="fees">
                <div>fee total</div>
                <h2>${price}</h2>
                <div>usd</div>
              </div>
            </div>
          </div>

            { isLoading && (
              <div>
              <div className="clearfix"></div>
              <div className="spinner">
                <div className="dot1"></div>
                <div className="dot2"></div>
              </div>
              </div>
            )}

            { isLoading || (
              <div className="col-md-10 col-md-offset-1">
                <div className='form-group'>
                  <div className='promo'>
                    <label className='label-control'>Do you have a Loom coupon code?</label>
                    <input type="text" id="promo" className="form-control" name="promo" placeholder="Enter Code" />
                    <button className="btn-sm" onClick={this.applyPromo}>
                      <i className={ applyingPromo ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
                      Apply
                    </button>
                  </div>
                  <div className={ promo_error ? "alert alert-danger" : "hidden"} role="alert">{ promo_error }</div>
                  <div className={ promo_message ? "alert alert-success" : "hidden"} role="alert">{ promo_message }</div>
                </div>
              </div>
            )}


            { (cards.length != 0) &&
              <CreditCardList
                cards={cards}
                setCard={this.setCard}
                showCardForm={this.showCardForm}
              />
            }

            { showCreditCardForm &&
              <CreditCardForm
                formElements={formElements}
                formError={formError}
                formErrorsList={formErrorsList}
                handleChange={this.handleChange}
                handleCheckboxChange={this.handleCheckboxChange}
              />
            }

            { isLoading || (
              <div className="col-md-4 col-md-offset-4">
                <button onClick={this.submitPayment} type="submit" className="btn btn-brand">
                  <i className={ sendingPayment ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
                  <span className={ promo ? 'hidden' : ''}>Pay ${price} and</span> Sign Contract
                </button>
                <p className="payment-errors hidden"></p>
              </div>
            )}
        <div className='clearfix'></div>
      </div>
      </div>
    );
  }

});

export default Checkout;


