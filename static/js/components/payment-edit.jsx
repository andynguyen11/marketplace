define(['react', 'jquery', 'jsx!components/spinner', 'stripe', 'formValidation', 'bootstrapValidationExt'],
  function(React, $, Spinner) {

  return React.createClass({
    getInitialState: function () {
      return {
        is_loading: false
      }
    },
    componentDidMount: function () {
      $('.payment-edit').formValidation({
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
      }.bind(this))
      .on('success.form.fv', function(e) {
          e.preventDefault();
          this.setState({is_loading: true});
          this.handleCC(e);
      }.bind(this));
    },
    handleCC: function (e) {
      var stripe_key = this.props.stripe;
      Stripe.setPublishableKey(stripe_key);
      var $form = $(e.currentTarget);
      $form.find('button').prop('disabled', true);
      Stripe.card.createToken($form, this.updateCC);
    },
    updateCC: function (status, response) {
      var $form = $('.payment-edit');
      if (response.error) {
        // Show the errors on the form
        $('.payment-edit .payment-errors').removeClass('hidden').text(response.error.message);
        $form.find('button').prop('disabled', false);
      } else {
        var token = response.id;
        $form.find('.stripe').val(token);
        $.ajax({
          url: hm_api.cc,
          method: 'PATCH',
          data: {'stripe_token': token},
          success: function () {
            this.props.update_data();
            this.setState({
              is_loading: false
            });
            $form.find('button').prop('disabled', true);
            $form.find('button').removeClass('disabled');
          }.bind(this)
        });
      }
    },
    render: function () {
      return(
        <div>
          <p></p>
          <p className="text-muted">For your security your current credit card information is hidden.</p>
          <form method="POST" className="payment-edit form-horizontal">
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
              <div className="col-md-4 col-md-offset-4">
              <input type="hidden" className="stripe" name="stripe_token" />
              <button type="submit" className="btn btn-success form-control">
                <Spinner is_loading={this.state.is_loading} /> Change Credit Card
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
      )
    }
  });

});