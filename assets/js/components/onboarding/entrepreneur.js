import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

let AccountForm = require('./account');
let CompanyForm = require('./company');

let EntrepreneurOnboard = React.createClass({

  getInitialState() {
    return {
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        biography: '',
        availability: '',
        role: '',
        title: '',
        linkedin: {
          extra_data: ''
        }
      },
      company: {
        id: '',
        name: '',
        description: '',
        type: '',
        filing_location: '',
        user_id: $('#onboard-form').data('id')
      },
      photo_file: '',
      photo_url: ''
    };
  },

  componentDidMount() {
    $.get(loom_api.profile + $('#onboard-form').data('id') + '/', function (result) {
      let new_profile = result;
      new_profile.biography = result.linkedin.extra_data.summary;
      this.setState({
        profile: new_profile,
        photo_url: result.photo_url
      });
    }.bind(this));
  },

  updateProfile(updated_profile) {
    this.setState({
      profile: updated_profile
    });
  },

  updateCompany(updated_company) {
    this.setState({
      company: updated_company
    });
  },

  handleFormChange(e) {
    let updated_profile = this.state.profile;
    updated_profile[$(e.currentTarget).attr('name')] = $(e.currentTarget).val();
    this.updateProfile(updated_profile);
  },

  _saveAccount(e) {
    e.preventDefault();
    $.ajax({
      url: loom_api.profile + this.state.profile.id + '/',
      method: 'PATCH',
      data: JSON.stringify(this.state.profile),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        // TODO This is kinda ghetto.  Figure out a way to async both calls.
        if (this.state.company.name) {
          this._createCompany();
        }
        else {
          window.location = '/profile/dashboard/';
        }
      }.bind(this)
    });
  },

  _createCompany() {
    $.ajax({
      url: loom_api.company,
      method: 'POST',
      data: JSON.stringify(this.state.company),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        window.location = '/profile/dashboard/';
      }.bind(this)
    });
  },

  render() {

      return (
        <div>
            <div id="basics" className="section-header text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
              <p className="text-muted">
                Let's quickly get you set up.
              </p>
            </div>

            <CompanyForm
              company={this.state.company}
              update_company={this.updateCompany}
            />

            <div className='section-header text-center col-md-8 col-md-offset-2'>Your Personal Info</div>

            <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>Title at Your Company</ControlLabel>
              <FormControl
                type='text'
                name='title'
                placeholder='CEO, Project Manager, Product Manager, etc.'
                value={this.state.profile.title}
                onChange={this.handleFormChange}
              />
            </FormGroup>

            <AccountForm
              profile={this.state.profile}
              update_profile={this.updateProfile}
            />

          <div className='text-center form-group col-md-12'>
            <Button type='submit' bsClass='btn btn-step' onClick={this._createCompany}>Save</Button>
          </div>

        </div>
      );
  }

});

module.exports = EntrepreneurOnboard;

