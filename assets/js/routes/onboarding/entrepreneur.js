import React from 'react';
import AccountForm from './account';
import CompanyForm from './company';
import FormHelpers from '../../utils/formHelpers';

const EntrepreneurOnboard = React.createClass({

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
      photo_url: '',
      formError: false,
      isCompany: false
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {
    $.get(loom_api.profile + $('#onboard-form').data('id') + '/', (result) => {
      const new_profile = result;
      if (result.linkedin.extra_data) {
        new_profile.biography = result.linkedin.extra_data.summary;
      }

      this.setState({
        profile: new_profile,
        photo_url: result.photo_url
      }, () => {
        this.setState({ formElements: this.formElements() });
      });
    });
  },

  formElements() {
    const { profile, company, isCompany } = this.state;

    return {
      title: {
        name: 'title',
        label: 'Title at Your Company',
        value: profile.title || '',
        placeholder: 'CEO, Project Manager, Product Manager, etc.',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.title = value;
          this.setState({ profile });
        }
      },
      isCompany: {
        name: 'isCompany',
        label: 'Do you need to set up a company profile?',
        value: isCompany,
        options: [
          {
            label: 'Yes, I need to set up a new company profile.',
            value: 'true'
          },
          {
            label: 'No, I\'m an individual looking to hire developers.',
            value: 'false'
          }
        ],
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          this.setState({ isCompany: value === 'true' });
        }
      },
      companyName: {
        name: 'companyName',
        label: 'Company Name',
        value: company.name || '',
        validator: (value) => {
          const { isCompany } = this.state;

          return isCompany ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { company } = this.state;
          company.name = value;
          this.setState({ company });
        }
      },
      companyDescription: {
        name: 'companyDescription',
        label: 'Company Bio (This is what developers will see)',
        value: company.description || '',
        placeholder: 'Think of this as your elevator pitch to developers.  Get them excited in 250 characters or less.',
        validator: (value) => {
          const { isCompany } = this.state;

          return isCompany ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { company } = this.state;
          company.description = value;
          this.setState({ company });
        }
      },
      companyType: {
        name: 'companyType',
        label: 'State Filing Location',
        value: company.company_type || '',
        placeholder: 'State/Province',
        options: [
          {
            label: 'Limited Liability Company (LLC)',
            value: 'llc'
          },
          {
            label: 'Corporation (Inc)',
            value: 'inc'
          },
          {
            label: 'Sole Proprietorship',
            value: 'sp'
          },
          {
            label: 'Limited Partnership',
            value: 'lp'
          },
          {
            label: 'Limited Liability Partnership',
            value: 'llp'
          },
          {
            label: 'Non-Profit',
            value: 'nonprofit'
          }
        ],
        validator: (value) => {
          const { isCompany } = this.state;

          return isCompany ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { company } = this.state;
          company.company_type = value;
          this.setState({ company });
        }
      },
      companyFilingLocation: {
        name: 'companyFilingLocation',
        label: 'State Filing Location',
        value: company.filing_location || '',
        placeholder: 'State/Province',
        validator: (value) => {
          const { isCompany } = this.state;

          return isCompany ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { company } = this.state;
          company.filing_location = value;
          this.setState({ company });
        }
      },
      profileFirstName: {
        name: 'profileFirstName',
        label: 'First Name',
        value: profile.first_name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.first_name = value;
          this.setState({ profile });
        }
      },
      profileLastName: {
        name: 'profileLastName',
        label: 'Last Name',
        value: profile.last_name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.last_name = value;
          this.setState({ profile });
        }
      },
      profileCity: {
        name: 'profileCity',
        label: 'City',
        value: profile.city || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.city = value;
          this.setState({ profile });
        }
      },
      profileStateProvince: {
        name: 'profileStateProvince',
        label: 'State/Province',
        value: profile.state || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.state = value;
          this.setState({ profile });
        }
      },
      profileBio: {
        name: 'profileBio',
        label: 'Quick Bio (optional)',
        placeholder:'Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.',
        value: profile.biography || '',
        update: (value) => {
          const { profile } = this.state;
          profile.biography = value;
          this.setState({ profile });
        }
      }
    }
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
    const { formElements } = this.state;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({ formElements });

      if(valid) {
        this.setState({ formError: false });

        $.ajax({
          url: loom_api.company,
          method: 'POST',
          data: JSON.stringify(this.state.company),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (result) {
            window.location = '/profile/dashboard/';
          }.bind(this)
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.' });
      }
    });
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  render() {
    const { formElements, formError, profile } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    return (
      <div>
        <div id="basics" className="section-header text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
          <p className="text-muted">
            Let's quickly get you set up.
          </p>
        </div>

        <CompanyForm
          formElements={formElements}
          handleChange={this.handleChange}
          isCompany={this.state.isCompany}
        />

        <div className='section-header text-center col-md-8 col-md-offset-2'>Your Personal Info</div>

        <div className='form-group col-md-8 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.title.name}>{formElements.title.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.title.name}
            id={formElements.title.name}
            placeholder={formElements.title.placeholder}
            value={formElements.title.value}
            onChange={this.handleChange}
          />
        </div>

        <AccountForm
          photo_url={this.state.photo_url}
          profile={profile}

          formElements={formElements}
          handleChange={this.handleChange}
          isCompany={this.state.isCompany}
        />

        <div className='text-center form-group col-md-12'>
          {error}

          <div>
            <button type='submit' className='btn btn-step' onClick={this._createCompany}>Save</button>
          </div>
        </div>

      </div>
    );
  }

});

export default EntrepreneurOnboard;

