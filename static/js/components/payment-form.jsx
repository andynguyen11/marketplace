define(['react', 'jquery', 'jsx!components/spinner', 'stripe', 'formValidation', 'bootstrapValidationExt'],
  function(React, $, Spinner) {

  return React.createClass({
    getInitialState: function () {
      return {
        is_loading: false
      }
    },
    componentDidMount: function () {
      $('.payment-form').formValidation({
        framework: 'bootstrap',
        icon: {
          valid: 'glyphicon glyphicon-ok',
          invalid: 'glyphicon glyphicon-remove',
          validating: 'glyphicon glyphicon-refresh'
        },
        err: {
            container: 'tooltip'
        },
        fields: {
          first_name: {
            validators: {
              notEmpty: {
                message: 'A first name is required'
              }
            }
          },
          last_name: {
            validators: {
              notEmpty: {
                  message: 'A last name is required'
              }
            }
          },
          phone_number: {
            validators: {
              notEmpty: {
                  message: 'A phone number is required'
              }
            }
          },
          number: {
            validators: {
              notEmpty: {
                  message: 'A credit card number is required'
              }
            }
          },
          cvc: {
            validators: {
              notEmpty: {
                  message: 'CVC is required'
              }
            }
          },
          month: {
            validators: {
              notEmpty: {
                  message: 'An expiry month is required'
              }
            }
          },
          year: {
            validators: {
              notEmpty: {
                  message: 'An expiry year is required'
              }
            }
          }
        }
      })
      .on('err.form.fv', function(e) {
        this.setState({is_loading: false});
      })
      .on('success.form.fv', function(e) {
          e.preventDefault();
          this.setState({is_loading: true});
          this.handleCC(e);
      }.bind(this));
    },
    handleCC: function (e) {
      var stripe_key = this.props.profile.stripe;
      Stripe.setPublishableKey(stripe_key);
      var $form = $(e.currentTarget);
      $form.find('.fa.load').removeClass('hidden');
      $form.find('button').prop('disabled', true);
      Stripe.card.createToken($form, this.createCC);
    },
    createCC: function (status, response) {
      var $form = $('.payment-form');
      if (response.error) {
        // Show the errors on the form
        $('.payment-form .payment-errors').removeClass('hidden').text(response.error.message);
        $form.find('button').prop('disabled', false);
        $form.find('.fa.load').addClass('hidden');
      } else {
        var token = response.id;
        $form.find('.stripe').val(token);
        $.ajax({
          url: hm_api.cc,
          method: 'POST',
          data: $form.serialize(),
          success: function () {
            this.props.update_data();
          }.bind(this)
        });
      }
    },
    render: function () {
      return(
        <div>
          <div className="col-md-6">
          <form method="POST" className="payment-form form-horizontal">
            <div className="form-group">
              <div className="col-xs-6">
                <input className="form-control" type="text" name="first_name" placeholder="First Name" />
              </div>
              <div className="col-xs-6">
                <input className="form-control" type="text" name="last_name" placeholder="Last Name" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-12">
                <input className="form-control" type="text" data-stripe="number" name="number" placeholder="Credit Card Number"/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-4">
                <input className="form-control" type="text" data-stripe="exp-month" name="month" placeholder="MM"/>
              </div>
              <div className="col-xs-4">
                <input className="form-control" type="text" data-stripe="exp-year" name="year" placeholder="YYYY"/>
              </div>
              <div className="col-xs-4">
                <input className="form-control" type="text" data-stripe="cvc" name="cvc" placeholder="CVC"/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <input className="form-control" type="text" name="phone_number" placeholder="Phone Number" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <input className="form-control" name="promo" type="text" placeholder="Promo Code (Optional)" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
              <input type="hidden" className="stripe" name="stripe_token" />
              <input type="hidden" name="service" value="Mowing" />
              <button type="submit" className="btn btn-success form-control">
                <Spinner is_loading={this.state.is_loading} /> Verify Credit Card
              </button>
              <p className="payment-errors hidden"></p>
              <div className="security text-center">
                Secured by
                <img src="/static/images/comodo_secure_76x26_transp.png" />
                <img src="/static/images/stripe.png" />
              </div>
              </div>
            </div>
          </form>
          </div>
          <div className="col-md-6">
            <strong>Service Address</strong>
            <p className="text-muted">
              { this.props.profile.service_address } { this.props.profile.service_address2} <br />
              { this.props.profile.service_city }, { this.props.profile.service_state } { this.props.profile.service_zipcode }
            </p>
            <strong>Estimated Service Time</strong>
            <p className="text-muted">Within 3 Business Days</p>
            <strong>Price*</strong>
            <p className="text-muted">
              $<span className="price">{this.props.job.charge}</span>
            </p>
            <p className="text-muted small">
              *Your credit card will NOT be charged until service is complete.  Price includes Sales Tax, as applicable.  An overgrown lawn surcharge of up to $20 may apply if the length of grass exceeds 6".  Excessively overgrown, oversized. or complex lawns may require a custom price quote.
            </p>

          </div>
        </div>
      )
    }
  });

});