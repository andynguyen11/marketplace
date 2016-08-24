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

      return(
        <li key={i}>
          <input onClick={setCard} type="radio" name="card" value={card.id} />
          <div className="card-details">
            <h2><i className={'fa fa-cc-'+card_class}></i></h2>
            <div>card ending in {card.last4}</div>
            <div>
              Expiration <br />
              {card.exp_month}/{card.exp_year}
            </div>
          </div>
        </li>
      )
    });

    return(
      <div>
      <div className="col-md-10 col-md-offset-1">
        <strong>How do you want to pay?</strong>
      </div>
      <div className="col-md-8 col-md-offset-2">
        <ul className="card-list">
          {cards}
          <li>
            <input name="card" type="radio" onClick={showCardForm} />
            <div className="new-card">Use different card</div>
          </li>
        </ul>
      </div>
      </div>
    )
  }
});

export default CreditCardList;
