define(['react'], function(React) {

  return React.createClass({
    render: function() {
      return(
        <div>
          <strong>Service Address</strong>
          <p className="text-muted">
            { this.props.profile.service_address } { this.props.profile.service_address2 } <br />
            { this.props.profile.service_city }, { this.props.profile.service_state } { this.props.profile.service_zipcode }
          </p>
          <strong>Estimated Service Time</strong>
          <p className="text-muted">Within 3 Business Days</p>
          <strong>Price*</strong>
          <p className="text-muted">
            $<span className="price">{ this.props.price }</span>
          </p>
          <p className="text-muted small">
            *Your credit card will NOT be charged until service is complete.  Price includes Sales Tax, as applicable.  Additional charge may apply for exceptionally oversized or overgrown lawns.
          </p>
        </div>
      )
    }
  });

});