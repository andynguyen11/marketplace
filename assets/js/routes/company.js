
(function() {
  //let AddressAutocomplete = require('../components/maps');

  const CompanyForm = React.createClass({
    getInitialState: function () {
      return {
        company: {
          name: '',
          legal_name: '',
          ein: '',
          logo: '',
          phone_number: '',
          address: '',
          address2: '',
          zipcode: '',
          state: '',
          city: '',
          description: '',
          category: '',
          email: '',
          phone_number: ''
        }
      }
    },
    componentDidMount: function () {
      $('#company-form').formValidation({
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
      var company = {
        phone_number: $('#phone_number').val(),
        address: $('#address').val(),
        address2: $('#address2').val(),
        zipcode: $('#zipcode').val(),
        state: $('#state').val(),
        city: $('#city').val()
      };
      this.state.setState({
        company: company
      });
    },
    createCompany: function () {

    },
    render: function () {
      return (
        <div>
            <h2>Basic Information</h2>
          <form method="POST" id="company-form" className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-12">
                <label>Name</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="name" name="name" value={ this.state.company.name } placeholder="First Name" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Legal Entity Name</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="legal_name" name="legal_name" value={ this.state.company.legal_name } placeholder="First Name" />
              </div>
              <div className="col-sm-6">
                <label>EIN</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="ein" name="ein" value={ this.state.company.ein } placeholder="Last Name" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Email</label>
                <input className="form-control" type="text" id="email" disabled="true" name="email" value={ this.state.company.email } placeholder="Email" />
              </div>
              <div className="col-sm-6">
                <label>Phone Number</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="phone_number" name="phone_number" value={ this.state.company.phone_number } placeholder="Phone Number" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Address</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="address" name="address" value={ this.state.company.service_address } placeholder="Address" disabled/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Address 2</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="address2" name="address2" value={ this.state.company.service_address2 } placeholder="Address" disabled/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-4">
                <label>City</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="city" name="city" value={ this.state.company.service_city } placeholder="City" disabled/>
              </div>
              <div className="col-sm-4">
                <label>State</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="state" name="state" value={ this.state.company.service_state } placeholder="State" disabled/>
              </div>
              <div className="col-sm-4">
                <label>Zipcode</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="zipcode" name="zipcode" value={ this.state.company.service_zipcode } placeholder="Zipcode" disabled/>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Logo</label>
                <input className="form-control" onChange={this.handleFormChange} type="file" id="logo" name="logo" value={ this.state.company.logo } />
              </div>
              <div className="col-sm-6">
                <label>Category</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="category" name="category" value={ this.state.company.category } placeholder="Last Name" />
              </div>
            </div>

            <button onClick={this.createCompany} className="btn btn-success col-md-4 col-md-offset-4" id="save-profile-btn">Create Company</button>
            <div className="clearfix"></div>
            <p></p>
          </form>
        </div>
      )
    }
  });

  ReactDOM.render(<CompanyForm />, document.getElementById('form'));

})();

