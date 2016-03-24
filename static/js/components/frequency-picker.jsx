define(['react'], function(React) {

  return React.createClass({
    handleSetFrequency: function (e) {
      this.props.set_charge($(e.currentTarget).data('price'));
      this.props.set_frequency($(e.currentTarget).data('frequency'));
      $('.price-box').removeClass('active');
      $(e.currentTarget).addClass('active');
    },
    render: function () {
      return (
        <div id="portal-booker">
          <ul className="price-picker">
            <li className="price-box active" onClick={this.handleSetFrequency} data-frequency='onetime' data-price={ this.props.discount_price ? this.props.discount_price : this.props.base_price } >
              <div className="pull-left">
                <h2>One time</h2>
              </div>
              <h2 className="pull-right">${ this.props.discount_price ? this.props.discount_price : this.props.base_price }</h2>
              <div className="clearfix"></div>
            </li>
            <li className="price-box" onClick={this.handleSetFrequency} data-frequency='monthly' data-price={ this.props.discount_price ? this.props.discount_price - 3 : this.props.base_price - 3 }>
              <div className="pull-left">
                <h3>Every month</h3>
                <p>
                  <i>Save up to $36 annually</i>
                </p>
              </div>
              <h2 className="pull-right">${ this.props.discount_price ? this.props.discount_price - 3 : this.props.base_price - 3 }</h2>
              <div className="clearfix"></div>
            </li>
            <li className="price-box" onClick={this.handleSetFrequency} data-frequency='biweekly' data-price={this.props.discount_price ? this.props.discount_price - 6 : this.props.base_price - 6 }>
              <div className="pull-left">
                <h3>Every other week</h3>
                <p>
                  <i>Save up to $156 annually</i>
                </p>
              </div>
              <h2 className="pull-right">${this.props.discount_price ? this.props.discount_price - 6 : this.props.base_price - 6 }</h2>
              <div className="clearfix"></div>
            </li>
            <li id="picker-note">
              <i className="">*
                An overgrown lawn surcharge of up to $20 may apply if the length of grass exceeds 6".
                Excessively overgrown, oversized. or complex lawns may require a custom price quote. </i>
            </li>
          </ul>
        </div>
      )
    }
  });

});