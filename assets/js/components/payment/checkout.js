import React from 'react';
import ReactDOM from 'react-dom';
import CreditCardForm from './creditCardForm';
import CreditCardList from './creditCardList';
import FormHelpers from '../../utils/formHelpers';
import _ from 'lodash';

let Checkout = React.createClass({

  getInitialState() {
    return {
      isLoading: false,
      showCreditCardForm: false,
      currentCard: null,
      creditCard: {
        number: '',
        month: '',
        year: '',
        cvc: ''
      }
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
          showCreditCardForm: !result,
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
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.number = value;
          this.setState({ creditCard:creditCard });
        }
      },
      month: {
        name: 'month',
        label: 'Expiration Month',
        value: creditCard.month || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.month = value;
          this.setState({ creditCard:creditCard });
        }
      },
      year: {
        name: 'year',
        label: 'Expiration Year',
        value: creditCard.year || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.year = value;
          this.setState({ creditCard:creditCard });
        }
      },
      cvc: {
        name: 'cvc',
        label: 'Security Code',
        value: creditCard.cvc || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { creditCard } = this.state;
          creditCard.cvc = value;
          this.setState({ creditCard:creditCard });
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

  handlePromoChange(e) {
    this.setState({
      promo: $(e.currentTarget).val()
    })
  },

  applyPromo() {
    $.ajax({
      url: loom_api.promo,
      data: { promo: this.state.promo },
      success: function (result) {

      }
    });
  },

  setCard(e) {
    this.setState({
      currentCard: e.currentTarget.value
    });
  },

  addCard() {
    this.setState({
      showCreditCardForm: true
    });
  },

  submitPayment() {
    const { formElements, currentCard } = this.state;
    if (currentCard) {
      this.setState({ formError: false, isLoading: true });
      $.ajax({
        url: loom_api.creditcard,
        method: 'PATCH',
        data: JSON.stringify({
          card: this.state.currentCard,
          customer: this.state.cards[0].customer,
          job: this.props.order.job.id
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
          window.location = result.message;
        }.bind(this)
      });
    }
    else {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements});
        if (valid) {
          this.setState({formError: false, isLoading: true});
          $.ajax({
            url: loom_api.creditcard,
            method: 'POST',
            data: JSON.stringify(this.state.creditCard),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (result) {
              window.location = result.message;
            }.bind(this)
          });
        } else {
          this.setState({formError: 'Please fill out all fields.'});
        }
      });
    }
  },

  render() {
    const { order, isLoading } =  this.props;
    const { formElements, formError, showCreditCardForm, cards } = this.state;

    return(
      <div className="checkout">
        <strong>Almost done!</strong>
        <p>
          Loom takes a small service fee for facilitating the connection and contract between you
          and the developer.
        </p>
        { order &&
          <div>
            <strong>Loom service fee breakdown:</strong>

            <div>
              <p>$3 x {order.job.hours} total project hours in
                <strong>{order.job.project.name}</strong>
                contract.</p>
              <h2>${order.price}</h2>
            </div>

            <div>
              Do you have a Loom coupon code?
              <input type="text" className="form-control" name="promo" placeholder="Enter Code" />
            </div>

            { cards && !showCreditCardForm &&
              <CreditCardList
                cards={cards}
                setCard={this.setCard}
                addCard={this.addCard}
              />
            }

            { showCreditCardForm &&
            <CreditCardForm
              formElements={formElements}
              formError={formError}
              handleChange={this.handleChange}
              submitCreditCard={this.submitCreditCard}
            />
            }


            <div className="col-md-4 col-md-offset-4">
              <button onClick={this.submitPayment} type="submit" className="btn btn-success form-control">
                Pay ${order.price} and Sign Contract
              </button>
              <p className="payment-errors hidden"></p>
              <div className="security text-center">
                Secured by
                <img src="/static/images/comodo_secure_76x26_transp.png" />
                <img src="/static/images/stripe.png" />
              </div>
            </div>
          </div>
        }
        <div className='clearfix'></div>
      </div>
    );
  }

});

export default Checkout;


