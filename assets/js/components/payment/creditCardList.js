import React from 'react';
import FormHelpers from '../../utils/formHelpers';


const CreditCardList = React.createClass({

  render() {

    const { setCard, addCard } = this.props;

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
          <i className={'fa fa-cc-'+card_class}></i>
          card ending in {card.last4}
          Expiration {card.exp_month}/{card.exp_year}
        </li>
      )
    });

    return(
      <div>
        <ul>
          {cards}
          <li><input type="radio" onClick={addCard} /> Different card</li>
        </ul>
      </div>
    )
  }
});

export default CreditCardList;
