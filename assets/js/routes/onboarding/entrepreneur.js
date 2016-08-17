import React from 'react';
import AccountForm from './account';
import CompanyForm from './company';
import FormHelpers from '../../utils/formHelpers';
import { objectToFormData } from '../project/utils'
import Loader from '../../components/loadScreen';

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
        },
        country: 'United States of America'
      },
      company: {
        id: '',
        name: '',
        description: '',
        type: '',
        filing_location: '',
        city: '',
        state: '',
        long_description: '',
        user_id: $('#onboard-form').data('id')
      },
      photo_file: '',
      photo_url: '',
      logo_file: '',
      logo_url: '',
      formError: false,
      formErrorsList: [],
      apiError: false,
      isCompany: true,
      isLoading: false
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
        new_profile.username = result.email;
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
        errorClass: '',
        label: 'Title at Your Company',
        value: profile.title || '',
        placeholder: 'CEO, Project Manager, Product Manager, etc.',
        validator: (value) => {
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;

          if (!valid) {
            formElements.title.errorClass = 'has-error';
            formErrorsList.push('Please add your job title.');
          } else {
            formElements.title.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyName.errorClass = 'has-error';
            formErrorsList.push('Please add a company name.');
          } else {
            formElements.companyName.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyState.errorClass = 'has-error';
            formErrorsList.push('Please add a company state.');
          } else {
            formElements.companyState.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyCity.errorClass = 'has-error';
            formErrorsList.push('Please add a company city.');
          } else {
            formElements.companyCity.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.city = value;
          this.setState({ company });
        }
      },
      companyPhoto: {
        errorClass: '',
        validator: () => {
          const { isCompany, logo_file, formElements, formErrorsList } = this.state;
          let valid = false;

          if(typeof logo_file !== 'object' && isCompany) {
            formElements.companyPhoto.errorClass = 'has-error';
            formErrorsList.push('Please add a company logo.');
            valid =  false;
          }else {
            formElements.companyPhoto.errorClass = '';
            valid = true;
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        }
      },
      companyDescription: {
        name: 'companyDescription',
        errorClass: '',
        label: 'Company Overview (Limited to 500 characters)',
        value: company.description || '',
        placeholder: 'This is a top-line description of your company.',
        validator: (value) => {
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyDescription.errorClass = 'has-error';
            formErrorsList.push('Please add a company overview.');
          } else {
            formElements.companyDescription.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyType.errorClass = 'has-error';
            formErrorsList.push('Please add a company type.');
          } else {
            formElements.companyType.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyFilingLocation.errorClass = 'has-error';
            formErrorsList.push('Please add a company filing location.');
          } else {
            formElements.companyFilingLocation.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.filing_location = value;
          this.setState({ company });
        }
      },
      companyBio: {
        name: 'companyBio',
        label: 'Company Bio (optional)',
        value: company.description || '',
        placeholder: 'This is a long form bio of your company. Tell developers the story of your company, your goals, and all they need to know about working with you.  You can add images in this section to help your story.',
        update: (value) => {
          const { company } = this.state;
          company.long_description = value;
          this.setState({ company });
        }
      },
      profileFirstName: {
        name: 'profileFirstName',
        label: 'First Name',
        value: profile.first_name || '',
        errorClass: '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileFirstName.errorClass = 'has-error';
            formErrorsList.push('Please add a first name.');
          } else {
            formElements.profileFirstName.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileLastName.errorClass = 'has-error';
            formErrorsList.push('Please add a last name.');
          } else {
            formElements.profileLastName.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.last_name = value;
          this.setState({ profile });
        }
      },
      profilePhoto: {
        errorClass: '',
        validator: () => {
          const { photo_url, formElements, formErrorsList } = this.state;
          let valid = false;

          if(photo_url.length) {
            formElements.profilePhoto.errorClass = '';
            valid = true;
          }else {
            formElements.profilePhoto.errorClass = 'has-error';
            formErrorsList.push('Please add a profile picture.');
            valid =  false;
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        }
      },
      profileCity: {
        name: 'profileCity',
        label: 'City',
        value: profile.city || '',
        errorClass: '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileCity.errorClass = 'has-error';
            formErrorsList.push('Please add a city.');
          } else {
            formElements.profileCity.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileStateProvince.errorClass = 'has-error';
            formErrorsList.push('Please add a state/province.');
          } else {
            formElements.profileStateProvince.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileCountry.errorClass = 'has-error';
            formErrorsList.push('Please add a country.');
          } else {
            formElements.profileCountry.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
        label: 'Quick Bio (max 250 characters)',
        placeholder:'Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.',
        value: profile.biography || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList } = this.state;
          const maxLen = 250;
          const minLen = 1;
          const valid = value.length >= minLen && value.length <= maxLen;

          if (!valid) {
            formElements.profileBio.errorClass = 'has-error';
            if (value.length > maxLen) {
              formErrorsList.push('Your bio is longer than 250 characters.');
            }
            else {
              formErrorsList.push('Please add a bio.');
            }
          } else {
            formElements.profileBio.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.biography = value;
          this.setState({ profile });
        }
      }
    }
  },

  _createCompany() {
    const { formElements, isCompany } = this.state;

    this.setState({ isLoading: true, formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements, apiError: false});

        if (valid) {
          this.setState({ formError: false, isLoading: true });

          let company = this.state.company;
          company.logo = this.state.logo_file;
          if (isCompany) {
            $.ajax({
              url: loom_api.company,
              method: 'POST',
              data: objectToFormData(company),
              contentType: false,
              processData: false,
              success: function (result) {
                this.setState({
                  company: result
                });
                this._saveAccount();
              }.bind(this),
              error: (xhr, status, error) => {
                console.log(xhr, status, error)
                this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
              }
            });
          }
          else {
            this._saveAccount();
          }
        } else {
          this.setState({formError: 'Please fill out all fields.', isLoading: false});
        }
      });
    });
  },

  _saveAccount() {
    const { formElements } = this.state;

    this.setState({ isLoading: true, formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements, apiError: false});

        if (valid) {
          this.setState({ formError: false, isLoading: true });
          let profile = this.state.profile;
          profile.photo = this.state.photo_file;
          $.ajax({
            url: loom_api.profile + profile.id + '/',
            method: 'PATCH',
            data: objectToFormData(profile),
            processData: false,
            contentType: false,
            success: function (result) {
              window.location = '/profile/dashboard/';
            }.bind(this),
            error: (xhr, status, error) => {
              console.log(xhr, status, error)
              this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({formError: 'Please fill out all fields.', isLoading: false});
        }
      });
    });
  },

  setCompany() {
    this.setState({isCompany:!this.state.isCompany});
  },


  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].value = value;
    formElements[fieldName].update(value);

    this.setState({ formElements, formError: false });
  },

  handleBio(value) {
    const { formElements } = this.state;

    formElements['companyBio'].value = value;
    formElements['companyBio'].update(value);

    this.setState({ formElements, formError: false });
  },

  handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    let re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    if(re.exec(file.name)) {
      reader.onloadend = () => {
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
        this.setState({
          logo_url: reader.result,
          logo_file: file
        });
      };
      reader.readAsDataURL(file);
    }
  },

  render() {
    const { formElements, formError, formErrorsList, apiError, profile, company, isCompany, isLoading } = this.state;
    const error = (formError || apiError) && function() {
        let errorsList = formErrorsList.map((thisError, i) => {
          return <span key={i}>{thisError}<br/></span>;
        });

        if(!formErrorsList.length){
          errorsList = formError;
        }

        if(apiError) {
          errorsList = apiError;
        }

        return <div className="alert alert-danger text-left" role="alert">{errorsList}</div>;
      }();

    const yourTitle = isCompany && (
      <div className={ 'form-group col-md-8 col-md-offset-2 ' + formElements.title.errorClass }>
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
          handleBio={this.handleBio}
          isCompany={this.state.isCompany}
          setCompany={this.setCompany}
          logo_url={this.state.logo_url}
          company={company}
          settings={false}
          prelaunch={false}
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

        <div className='text-center sub-section form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit' disabled={ this.state.isLoading ? 'true': ''} className='btn btn-brand btn-brand--attn' onClick={this._createCompany}>
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Sign Up
          </a>
        </div>

      </div>
    );
  }

});

export default EntrepreneurOnboard;

