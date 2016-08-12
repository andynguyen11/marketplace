import React from 'react';
import AccountForm from './account';
import CompanyForm from './company';
import FormHelpers from '../../utils/formHelpers';
import { objectToFormData } from '../project/utils'
import Loader from '../../components/loadScreen';

const PrelaunchOnboarding = React.createClass({

  getInitialState() {
    return {
      profile: {
        first_name: decodeURIComponent(this.getParam('first_name')),
        last_name: decodeURIComponent(this.getParam('last_name')),
        email: decodeURIComponent(this.getParam('email')),
        username: '',
        biography: '',
        availability: '',
        role: '',
        title: '',
        linkedin: {
          extra_data: ''
        },
        country: 'United States of America'
      },
      company: {
        id: '',
        name: decodeURIComponent(this.getParam('company')),
        description: '',
        type: '',
        filing_location: '',
        city: '',
        state: '',
        user_id: ''
      },
      photo_file: '',
      photo_url: '',
      logo_file: '',
      logo_url: '',
      formError: false,
      isCompany: true
    };
  },

  getParam(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace(
      /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
      function( m, key, value ) { // callback
        vars[key] = value !== undefined ? value : '';
      }
    );

    if ( param ) {
      return vars[param] ? vars[param] : '';
    }
    return vars;
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  formElements() {
    const { profile, company, isCompany } = this.state;

    return {
      title: {
        name: 'title',
        errorClass: '',
        label: 'Title at Your Company',
        value: profile.title || '',
        placeholder: 'CEO, Project Manager, Product Manager, etc.',
        validator: (value) => {
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.profileCountry.errorClass = 'has-error';
          } else {
            formElements.profileCountry.errorClass = '';
          }
          this.setState({ formElements });
          return valid;

        },
        update: (value) => {
          const { profile } = this.state;
          profile.title = value;
          this.setState({ profile });
        }
      },
      companyName: {
        name: 'companyName',
        label: 'Company Name',
        errorClass: '',
        value: company.name || '',
        validator: (value) => {
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyName.errorClass = 'has-error';
          } else {
            formElements.companyName.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.name = value;
          this.setState({ company });
        }
      },
      companyState: {
        name: 'companyState',
        label: 'Company State',
        errorClass: '',
        value: company.name || '',
        validator: (value) => {
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyState.errorClass = 'has-error';
          } else {
            formElements.companyState.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.state = value;
          this.setState({ company });
        }
      },
      companyCity: {
        name: 'companyCity',
        label: 'Company City',
        value: company.city || '',
        errorClass: '',
        validator: (value) => {
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyCity.errorClass = 'has-error';
          } else {
            formElements.companyCity.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.city = value;
          this.setState({ company });
        }
      },
      companyDescription: {
        name: 'companyDescription',
        errorClass: '',
        label: 'Company Bio (This is what developers will see)',
        value: company.description || '',
        placeholder: 'Think of this as your elevator pitch to developers.  Get them excited in 250 characters or less.',
        validator: (value) => {
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyDescription.errorClass = 'has-error';
          } else {
            formElements.companyDescription.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.description = value;
          this.setState({ company });
        }
      },
      companyType: {
        name: 'companyType',
        label: 'Company Type',
        errorClass: '',
        value: company.type || '',
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
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyType.errorClass = 'has-error';
          } else {
            formElements.companyType.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.type = value;
          this.setState({ company });
        }
      },
      companyFilingLocation: {
        name: 'companyFilingLocation',
        label: 'State Filing Location',
        errorClass: '',
        value: company.filing_location || '',
        placeholder: 'State/Province',
        validator: (value) => {
          const { isCompany, formElements } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyFilingLocation.errorClass = 'has-error';
          } else {
            formElements.companyFilingLocation.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
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
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.profileFirstName.errorClass = 'has-error';
          } else {
            formElements.profileFirstName.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
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
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.profileLastName.errorClass = 'has-error';
          } else {
            formElements.profileLastName.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
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
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.profileCity.errorClass = 'has-error';
          } else {
            formElements.profileCity.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
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
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.profileStateProvince.errorClass = 'has-error';
          } else {
            formElements.profileStateProvince.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.state = value;
          this.setState({ profile });
        }
      },
      profileCountry: {
        name: 'profileCountry',
        label: 'Country',
        value: profile.country || 'United States of America',
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.profileCountry.errorClass = 'has-error';
          } else {
            formElements.profileCountry.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.country = value;
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
      },
      profileEmail: {
        name: 'profileEmail',
        label: 'Email',
        placeholder:'name@company.com',
        value: profile.email || '',
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.profileEmail.errorClass = 'has-error';
          } else {
            formElements.profileEmail.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.email = value;
          profile.username = value;
          this.setState({ profile });
        }
      },
      password: {
        name: 'password',
        label: 'Password',
        value: profile.password || '',
        errorClass: '',
        validator: (value) => {
          const { formElements } = this.state;
          const valid = FormHelpers.checks.isRequired(value);
          if (!valid) {
            formElements.password.errorClass = 'has-error';
          } else {
            formElements.password.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.password = value;
          this.setState({ profile });
        }
      }
    }
  },

  _createCompany() {
    const { formElements, isCompany } = this.state;
    this.setState({ isLoading: true });

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({ formElements });

      let company = this.state.company;
      company.user_id = this.state.profile.id;
      company.logo = this.state.logo_file ? this.state.logo_file : '';

      if(valid) {
        this.setState({ formError: false });
        $.ajax({
          url: loom_api.company,
          method: 'POST',
          data: objectToFormData(company),
          contentType: false,
          processData: false,
          success: function (result) {
              window.location = '/prelaunch/';
          }
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.', isLoading: false });
      }
    });
  },

  _createAccount() {
    const { formElements } = this.state;
    this.setState({ isLoading: true });

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});

      if (valid) {
        this.setState({ formError: false, isLoading: true });
        let profile = this.state.profile;
        profile.username = profile.email;
        profile.photo = this.state.photo_file ? this.state.photo_file : '';
        //delete profile.photo; // Hacky way to prevent 400: delete photo from profile since it's not a file
        $.ajax({
          url: loom_api.profile,
          method: 'POST',
          data: objectToFormData(profile),
          contentType: false,
          processData: false,
          success: function (result) {
            this.setState({ profile:result })
            if (this.state.isCompany) {
              this._createCompany();
            }
            else {
              window.location = '/prelaunch/';
            }
          }.bind(this)
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.', isLoading: false });
      }
    });
  },

  setCompany() {
    this.setState({isCompany:!this.state.isCompany});
  },


  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    let re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    if(re.exec(file.name)) {
      reader.onloadend = () => {
        debugger
        this.setState({
          photo_url: reader.result,
          photo_file: file
        });
      };
      reader.readAsDataURL(file);
    }
  },

  handleLogoChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    let re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    if(re.exec(file.name)) {
      reader.onloadend = () => {
        debugger
        this.setState({
          logo_url: reader.result,
          logo_file: file
        });
      };
      reader.readAsDataURL(file);
    }
  },

  render() {
    const { formElements, formError, profile, company, isCompany, isLoading } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;
    const yourTitle = isCompany && (
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
    );

    return (
      <div>
      { isLoading && <Loader /> }

        <CompanyForm
          formElements={formElements}
          handleChange={this.handleChange}
          handleLogoChange={this.handleLogoChange}
          isCompany={this.state.isCompany}
          setCompany={this.setCompany}
          logo_url={this.state.logo_url}
          company={company}
          settings={false}
          prelaunch={true}
        />

        <h3 className='brand sub-section col-md-8 col-md-offset-2'>Your Personal Info</h3>

        {yourTitle}

        <AccountForm
          photo_url={this.state.photo_url}
          profile={profile}
          handleImageChange={this.handleImageChange}
          formElements={formElements}
          handleChange={this.handleChange}
          isCompany={this.state.isCompany}
          linkedIn={false}
        />

        <div className='col-md-4 col-md-offset-2'>
            <div className={ 'form-group ' + formElements.profileEmail.errorClass }>
                <label className="control-label" htmlFor={formElements.profileEmail.name}>{formElements.profileEmail.label}</label>
                <input
                    className={ 'form-control ' + formElements.profileEmail.errorClass }
                    type='text'
                    name={formElements.profileEmail.name}
                    value={formElements.profileEmail.value}
                    onChange={this.handleChange}
                />
            </div>
        </div>
        <div className='col-md-4'>
            <div className={ 'form-group ' + formElements.password.errorClass }>
                <label className="control-label" htmlFor={formElements.password.name}>{formElements.password.label}</label>
                <input
                    className={ 'form-control ' + formElements.password.errorClass }
                    type='password'
                    name={formElements.password.name}
                    value={formElements.password.value}
                    onChange={this.handleChange}
                />
            </div>
        </div>

        <div className='text-center sub-section form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit' disabled={ this.state.isLoading ? 'true': ''} className='btn btn-brand btn-brand--attn' onClick={this._createAccount}>
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Create Account
          </a>
        </div>

      </div>
    );
  }

});

export default PrelaunchOnboarding;