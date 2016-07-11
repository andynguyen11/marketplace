
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
          email: ''
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
          name: {
            validators: {
              notEmpty: {
                message: 'A name is required'
              }
            }
          },
          legal_name: {
            validators: {
              notEmpty: {
                  message: 'A legal name is required'
              }
            }
          },
          ein: {
            validators: {
              notEmpty: {
                  message: 'An EIN or Social is required'
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
                  message: 'A company address is required'
              }
            }
          },
          city: {
            validators: {
              notEmpty: {
                  message: 'The city your company is located in is required'
              }
            }
          },
          state: {
            validators: {
              notEmpty: {
                  message: 'The state your company is located is required'
              }
            }
          },
          zipcode: {
            validators: {
              notEmpty: {
                  message: 'The zipcode your company is located is required'
              }
            }
          }
        }
      });
    },
    handleFormChange: function () {
      var company = {
        name: $('#name').val(),
        email: $('#email').val(),
        legal_name: $('#legal_name').val(),
        ein: $('#ein').val(),
        phone: $('#phone').val(),
        address: $('#address').val(),
        address2: $('#address2').val(),
        zipcode: $('#zipcode').val(),
        state: $('#state').val(),
        city: $('#city').val(),
        category: $('#category').val()
      };
      this.setState({
        company: company
      });
    },
    saveCompany: function () {
        $.ajax({
          url: dq_api.company,
          method: 'POST',
          data: JSON.stringify(this.state.company),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function() {
            console.log('success');
          }.bind(this)
        });
      },
    render: function () {
      return (
        <div>
            <h2>Basic Information</h2>
          <form method="POST" id="company-form" className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-12">
                <label>Name</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="name" name="name" value={ this.state.company.name } placeholder="Company Name" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Legal Entity Name</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="legal_name" name="legal_name" value={ this.state.company.legal_name } placeholder="Legal Name" />
              </div>
              <div className="col-sm-6">
                <label>Tax ID (EIN or Social Security)</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="ein" name="ein" value={ this.state.company.ein } placeholder="Tax ID" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Email</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="email" name="email" value={ this.state.company.email } placeholder="Email" />
              </div>
              <div className="col-sm-6">
                <label>Phone Number</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="phone" name="phone" value={ this.state.company.phone_number } placeholder="Phone Number" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Address</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="address" name="address" value={ this.state.company.service_address } placeholder="Company Address" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Address 2</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="address2" name="address2" value={ this.state.company.service_address2 } placeholder="Company Address 2" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-4">
                <label>City</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="city" name="city" value={ this.state.company.service_city } placeholder="City" />
              </div>
              <div className="col-sm-4">
                <label>State</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="state" name="state" value={ this.state.company.service_state } placeholder="State" />
              </div>
              <div className="col-sm-4">
                <label>Zipcode</label>
                <input className="form-control" onChange={this.handleFormChange} type="text" id="zipcode" name="zipcode" value={ this.state.company.service_zipcode } placeholder="Zipcode" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-6">
                <label>Logo</label>
                <input className="form-control" onChange={this.handleFormChange} type="file" id="logo" name="logo" value={ this.state.company.logo } />
              </div>
              <div className="col-sm-6">
                <label>Category</label>
                <input className="form-control" data-tag-options="{'required': true}" data-tag-url="/api/category/" onChange={this.handleFormChange} autocomplete="off" type="text" id="category" name="category" value={ this.state.company.category } placeholder="Category" />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-12">
                <label>Details</label>
                <textarea className="form-control" onChange={this.handleFormChange} id="description" name="description" value={ this.state.company.description } placeholder="Company Details" >

                </textarea>
              </div>
            </div>

            <button onClick={this.saveCompany} className="btn btn-success col-md-4 col-md-offset-4" id="save-profile-btn">Create Company</button>
            <div className="clearfix"></div>
            <p></p>
          </form>
        </div>
      )
    }
  });

  const formElement = document.getElementById('form');

  if(formElement) {
    ReactDOM.render(<CompanyForm />, formElement);
  }

})();

