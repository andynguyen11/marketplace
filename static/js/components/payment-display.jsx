define(['react', 'jquery', 'jsx!components/spinner', 'stripe', 'formValidation', 'bootstrapValidationExt'], function(React, $, Spinner) {

  return React.createClass({
    getInitialState: function () {
      return {
        promo: ''
      }
    },
    handlePromoChange: function (e) {
      this.setState({
        promo: $(e.currentTarget).val()
      })
    },
    applyPromo: function () {
      this.props.set_promo(this.state.promo)
    },
    render: function () {
      var card_class = '';
      if (this.props.profile.card) {
        if (this.props.profile.card.brand == 'American Express') {
          card_class = 'amex';
        } else if (this.props.profile.card.brand == 'Diners Club') {
          card_class = 'diners-club';
        } else {
          card_class = this.props.profile.card.brand.toLowerCase()
        }
      }
      return(
        <div>
          <div className='col-md-6 payment'>
            <input type="text" className='form-control' placeholder='Promo Code' onChange={this.handlePromoChange} />
            <p></p>
            <button className="btn btn-primary pull-left col-xs-12" onClick={this.applyPromo}>Apply Promo</button>
            <div className='clearfix'></div>
          </div>

          <div className='col-md-6 payment'>
            <div className='input-group'>
              <div className="input-group-addon"><i className={'fa fa-cc-' + card_class}></i></div>
              <input type="text" className='form-control' disabled value={'XXXX XXXX XXXX ' +this.props.profile.card.last4 } />
            </div>
            <p></p>
            <button className='btn btn-success pull-right col-xs-12' onClick={this.props.book_service}>
              <Spinner is_loading={this.props.is_loading} />  Book Service
            </button>
            <div className='clearfix'></div>
          </div>

          <div className='clearfix'></div>
        </div>
      )
    }
  });

});