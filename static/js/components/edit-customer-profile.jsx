
define(['react', 'jsx!components/payment-edit', 'formValidation', 'bootstrapValidationExt'], function(React, PaymentEdit) {

  return React.createClass({
    componentDidMount: function () {
      $('#profile-form').formValidation({
        framework: 'bootstrap',
        icon: {
          valid: 'glyphicon glyphicon-ok',
          invalid: 'glyphicon glyphicon-remove',
          validating: 'glyphicon glyphicon-refresh'
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
          email: {
            validators: {
              notEmpty: {
                  message: 'An email is required'
              }
            }
          },
          address: {
            validators: {
              notEmpty: {
                  message: 'A service address is required'
              }
            }
          },
          city: {
            validators: {
              notEmpty: {
                  message: 'A city is required'
              }
            }
          },
          state: {
            validators: {
              notEmpty: {
                  message: 'A state is required'
              }
            }
          },
          zipcode: {
            validators: {
              notEmpty: {
                  message: 'A zipcode is required'
              }
            }
          }
        }
      });
    },
    handleFormChange: function () {
      var profile = {
        user: {
          id: this.props.profile.user.id,
          first_name: $('#first_name').val(),
          last_name: $('#last_name').val(),
          email: $('#email').val()
        },
        phone_number: $('#phone_number').val(),
        service_address: $('#address').val(),
        service_address2: $('#address2').val(),
        service_zipcode: $('#zipcode').val(),
        service_state: $('#state').val(),
        service_city: $('#city').val()
      };
      this.props.set_profile(profile);
    },
    render: function () {
      return (
        <div>
            <h2>Basic Information</h2>
            <p>
                If you need to change email/address, send us an email at <a href="mailto:service@lawncall.com?Subject=Need%20another%20service" target="_top">service@lawncall.com</a>
            </p>
          <form method="POST" id="profile-form" className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-6">
                <label>First Name</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="first_name" name="first_name" value={ this.props.profile.user.first_name } placeholder="First Name" />
              </div>
              <div className="col-sm-6">
                <label>Last Name</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="last_name" name="last_name" value={ this.props.profile.user.last_name } placeholder="Last Name" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Email</label>
                <input className="form-control" type="text" id="email" disabled="true" name="email" value={ this.props.profile.user.email } placeholder="Email" />
              </div>
              <div className="col-sm-6">
                <label>Phone Number</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="phone_number" name="phone_number" value={ this.props.profile.phone_number } placeholder="Phone Number" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Address</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="address" name="address" value={ this.props.profile.service_address } placeholder="Address" disabled/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Address 2</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="address2" name="address2" value={ this.props.profile.service_address2 } placeholder="Address" disabled/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-4">
                <label>City</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="city" name="city" value={ this.props.profile.service_city } placeholder="City" disabled/>
              </div>
              <div className="col-sm-4">
                <label>State</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="state" name="state" value={ this.props.profile.service_state } placeholder="State" disabled/>
              </div>
              <div className="col-sm-4">
                <label>Zipcode</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="zipcode" name="zipcode" value={ this.props.profile.service_zipcode } placeholder="Zipcode" disabled/>
              </div>
            </div>

            <button onClick={this.props.update_profile} className="btn btn-success col-md-4 col-md-offset-4" id="save-profile-btn">Save Profile</button>
            <div className="clearfix"></div>
            <p></p>
          </form>
            <h2>Payment Information</h2>
          <PaymentEdit stripe={this.props.profile.stripe} update_data={this.props.reload_profile} />
        </div>
      )
    }
  });

});

