import React from 'react';
import FormHelpers from '../../utils/formHelpers';


const CreditCardList = React.createClass({
  propTypes: {
    cards: React.PropTypes.array,
    showCardForm: React.PropTypes.func,
    setCard: React.PropTypes.func
  },

  render() {

    const { setCard, showCardForm } = this.props;

    const cards = this.props.cards.map(function(card, i) {
      let card_class = '';
      if (card.brand == 'American Express') {
        card_class = 'amex';
      }
      else if (card.brand == 'Diners Club') {
        card_class = 'diners-club';
      }
      else {
        card_class = card.brand.toLowerCase()
      }

      return (
        <label htmlFor={card.id} key={i} className="card-list-card">
          <input onClick={setCard} type="radio" id={card.id} name="card" value={card.id} />
          <div className="card-details">
            <i className={'card-type fa fa-cc-'+card_class}></i>
            <div className="card-number">Card ending in {card.last4}</div>
            <div className="card-expiration">Expires {card.exp_month}/{card.exp_year}</div>
          </div>
        </label>
      )
    });

    return(
      <div>
        <div className="col-md-10 col-md-offset-1 form-group">
          <label>How do you want to pay?</label>
          <div className="card-list">
            {cards}
            <label htmlFor="nocard" className="card-list-nocard">
              <input name="card" id="nocard" type="radio" onClick={showCardForm} />
              <div className="card-list-nocard-label">Use different card</div>
            </label>
          </div>
        </div>
      </div>
    )
  }
});

export default CreditCardList;
