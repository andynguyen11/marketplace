import React from 'react';
import ReactDOM from 'react-dom';
import CreditCardForm from './creditCardForm';
import CreditCardList from './creditCardList';
import FormHelpers from '../../utils/formHelpers';
import Loader from '../../components/loadScreen';
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
        cvc: ''
      },
      stripeToken: '',
      saveCard: false,
      enteredPromo: '',
      promo : '',
      promo_message: '',
      promo_error: '',
      formError: false,
      formErrorsList: [],
      price: 3 * parseInt(job.hours),
      basePrice: 3 * parseInt(job.hours),
      apiError: false
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
    const { creditCard, saveCard } = this.state;

    return {
      currentCard: {
        validator: () => {
          const {formErrorsList, showCreditCardForm, currentCard} = this.state;
          const valid = showCreditCardForm || currentCard;

          if (!valid) {
            formErrorsList.push('Please select a payment method.');
          }

          this.setState({formErrorsList});

          return valid;
        }
      },
      number: {
        name: 'number',
        label: 'Credit Card Number',
        value: creditCard.number || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList, showCreditCardForm } = this.state;
          const cleanValue = value.toString().match(/^\d*\ ?\d*$/);
          const valid = showCreditCardForm ? FormHelpers.checks.isRequired(value) && cleanValue : true;

          if (!valid) {
            formElements.number.errorClass = 'has-error';
            let error = 'Please enter a credit card number.';

            if(!!value.length) {
              if(!cleanValue) {
                error = 'Please enter a valid numeric credit card number.';
              }
            }

            formErrorsList.push(error);
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
          const { formElements, formErrorsList, showCreditCardForm } = this.state;
          const cleanValue = value.toString().match(/^\d*?\d*$/);
          const valid = showCreditCardForm ? FormHelpers.checks.isRequired(value) && cleanValue : true;

          if (!valid) {
            formElements.month.errorClass = 'has-error';
            let error = 'Please add an expiration month.';

            if(!!value.length) {
              if(!cleanValue) {
                error = 'Please enter a 2-digit numerical expiration month.';
              }
            }

            formErrorsList.push(error);
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
          const { formElements, formErrorsList, showCreditCardForm } = this.state;
          const cleanValue = value.toString().match(/^\d*?\d*$/);
          const valid = showCreditCardForm ? FormHelpers.checks.isRequired(value) && cleanValue : true;

          if (!valid) {
            formElements.year.errorClass = 'has-error';
            let error = 'Please add an expiration year.';

            if(!!value.length) {
              if(!cleanValue) {
                error = 'Please enter a 4-digit numerical expiration year.';
              }
            }

            formErrorsList.push(error);
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
          const { formElements, formErrorsList, showCreditCardForm } = this.state;
          const cleanValue = value.toString().match(/^\d*?\d*$/);
          const valid = showCreditCardForm ? FormHelpers.checks.isRequired(value) && cleanValue : true;

          if (!valid) {
            formElements.cvc.errorClass = 'has-error';
            let error = 'Please add a security code.';

            if(!!value.length) {
              if(!cleanValue) {
                error = 'Please enter a 3-digit numerical security code.';
              }
            }

            formErrorsList.push(error);
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
      saveCard: {
        name: 'saveCard',
        label: 'Save this information for future purchases on Loom.',
        value: saveCard || false,
        update: (value) => {
          let { saveCard } = this.state;
          saveCard = value;
          this.setState({ saveCard });
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
      showCreditCardForm: true,
      currentCard: null
    });
  },

  applyValueOff(value_off){
    let price = this.state.basePrice
    let discount = parseFloat(value_off.replace(/\$|%/, ''))
    let applied = value_off.charAt(0) == "$" ?
      price - discount :
      price - (price * (discount / 100.00))
    return applied > 0 ? applied : 0.0
  },

  updatePromo(event) {
    const { value } = event.target;

    this.setState({ enteredPromo: value, promo_error: false });
  },

  applyPromo() {
    const { enteredPromo } = this.state;
    this.setState({ applyingPromo: true, promo_error: '' });

    $.ajax({
      url: loom_api.promo,
      method: 'POST',
      data: JSON.stringify({
        promo: enteredPromo
      }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (result) {
        this.setState({
          promo: enteredPromo,
          enteredPromo: '',
          promo_message: result.message,
          price: this.applyValueOff(result.value),
          applyingPromo: false,
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

  createToken() {
    const { creditCard } = this.state;
    Stripe.setPublishableKey(loomKeys.stripe);
    Stripe.card.createToken({
      number: creditCard.number,
      cvc: creditCard.cvc,
      exp_month: creditCard.month,
      exp_year: creditCard.year
    }, this.stripeResponseHandler);
  },

  stripeResponseHandler(status, response) {
    const {formErrorsList, formErrors} = this.state;

    if (response.error) { // Problem!
      this.setState({ formError: response.error.message})
    } else { // Token was created!
      this.setState({ stripeToken: response.id })
    }

    this.submitPayment();
  },

  submitPayment() {
    const { formElements, currentCard, creditCard, stripeToken, saveCard } = this.state;
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
        }.bind(this),
        error: (xhr, status, error) => {
          const errorText = xhr.responseText.slice(0, 150) + ' ...';
          this.setState({apiError: 'unknown error: ' + errorText, isLoading: false, sendingPayment: false});
        }
      });
    }
    else {
      this.setState({ formErrorsList: [] }, () => {
        FormHelpers.validateForm(formElements, (valid, formElements) => {
          this.setState({formElements, apiError: false});

          if (valid) {
            this.setState({formError: false, sendingPayment: true});
            $.ajax({
              url: loom_api.creditcard,
              method: 'POST',
              data: JSON.stringify({
                stripeToken: stripeToken,
                saveCard: saveCard,
                job: job.id,
                promo: this.state.promo
              }),
              contentType: 'application/json; charset=utf-8',
              dataType: 'json',
              success: function (result) {
                window.location = result.url;
              }.bind(this),
              error: (xhr, status, error) => {
                const errorText = xhr.responseText.slice(0, 150) + ' ...';
                this.setState({apiError: 'unknown error: ' + errorText, isLoading: false, sendingPayment: false});
              }
            });
          } else {
            this.setState({formError: 'Please fill out all fields.'});
          }
        });
      })
    }
  },

  render() {
    const { job, terms } =  this.props;
    const { price, currentCard, enteredPromo, promo, isLoading, applyingPromo, formElements, formError, formErrorsList, showCreditCardForm, cards, sendingPayment, promo_error, promo_message, apiError } = this.state;
    const promoButtonSettings = !enteredPromo.length && { disabled: true };
    const error = (formError || apiError) && function() {
      let errorsList = formErrorsList.map((thisError, i) => {
        return <span key={i}>{thisError}<br/></span>;
      });

      if(!formErrorsList.length){
        errorsList = formError;
      }

      if(apiError) {
        errorsList = apiError;
      }

      return <div className="alert alert-danger text-left" role="alert">{errorsList}</div>;
    }();

    return(
      <div className="messages-tracker-content">
        <div className="checkout messages-tracker-popup-content">
          <div className="col-md-10 col-md-offset-1">
            <h3>Your work contract is ready!</h3>
            <h5>Please pay the following service fee to view, sign and send your contract:</h5>
            <div className="fee-container">
              <strong>$3 x {job.hours} total project hours for the {terms.project.title} project.</strong>
              { promo && <small>— with the promo <span className="label label-default" style={{"background": "#423d51"}}>{promo}</span> applied —</small> }
              <div className="fees">
                <div>fee total</div>
                <h2>${price}</h2>
                <div>usd</div>
              </div>
            </div>
          </div>

          { isLoading && <Loader/> }

          <div className="col-md-10 col-md-offset-1">
            <label className='label-control'>Do you have a Loom coupon code?</label>
            <div className='form-group promo'>
              <input type="text" id="enteredPromo" className="form-control" name="enteredPromo" placeholder="Enter Code" value={enteredPromo} onChange={this.updatePromo} />
              <button className="btn btn-brand btn-sm" onClick={this.applyPromo} {...promoButtonSettings}>
                { applyingPromo && <i className="fa fa-circle-o-notch fa-spin fa-fw"></i> }
                Apply
              </button>
            </div>
            { promo_error && <div className="alert alert-danger" role="alert">{ promo_error }</div> }
            { promo_message && <div className="alert alert-success" role="alert">{ promo_message }</div> }
          </div>

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
              handleChange={this.handleChange}
              handleCheckboxChange={this.handleCheckboxChange}
            />
          }

          { error && (
            <div className="col-md-10 col-md-offset-1">
              {error}
            </div>
          )}

          { isLoading || (
            <div className="col-md-10 col-md-offset-1 text-center">
              <button onClick={currentCard ? this.submitPayment: this.createToken} disabled={ sendingPayment ? 'true': ''} type="submit" className="btn btn-brand">
                <i className={ sendingPayment ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
                { !promo && <span>Pay ${price} and</span> } Sign Contract
              </button>
            </div>
          )}

          <div className='clearfix'></div>
        </div>
      </div>
    );
  }

});

export default Checkout;


