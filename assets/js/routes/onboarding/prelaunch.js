import React from 'react';
import moment from 'moment';
import AccountForm from './account';
import CompanyForm from './company';
import FormHelpers from '../../utils/formHelpers';
import { objectToFormData } from '../project/utils'
import Loader from '../../components/loadScreen';

const dateFormatForSave = 'YYYY-MM-DD';
const dateFormatForDisplay = 'MM/DD/YYYY';

const convertDateForSave = (date) => {
  const dateMoment = moment(date);
  const formattedDate = dateMoment.format(dateFormatForSave);

  return formattedDate;
};

const convertDateForDisplay = (date) => {
  const dateMoment = moment(date);
  const formattedDate = dateMoment.format(dateFormatForDisplay);

  return formattedDate;
};

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
        user_id: '',
        country: 'United States of America',
        address1: '',
        address2: '',
        zipcode: '',
        incorporation_date: '',
        ein: ''
      },
      photo_file: '',
      photo_url: '',
      logo_file: '',
      logo_url: '',
      formError: false,
      formErrorsList: [],
      apiError: false,
      isCompany: true,
      accountType: '',
      isInternational: false
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

  componentDidUpdate(prevProps, prevState) {
    const { accountType } = this.state;
    if (prevState.accountType != accountType) {
      if (accountType ==  'company') {
        document.getElementById('company-form-header').scrollIntoView({ behavior: 'smooth'});
      }
      else if (accountType == 'individual') {
        document.getElementById('account-form-header').scrollIntoView({ behavior: 'smooth'});
      }
    }
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
        placeholder: 'Awesome Inc.',
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
      companyCountry: {
        name: 'companyCountry',
        label: 'Where is you company located?',
        value: company.country || 'United States of America',
        errorClass: '',
        update: (value) => {
          const { company } = this.state;
          company.address = value;
          this.setState({
            company,
            isInternational: value == 'United States of America' ? false : true
          });
        }
      },
      companyAddress: {
        name: 'companyAddress',
        label: 'Company Address',
        placeholder: 'Address 1',
        value: company.address || '',
        errorClass: '',
        validator: (value) => {
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyAddress.errorClass = 'has-error';
            formErrorsList.push('Please add a company address.');
          } else {
            formElements.companyAddress.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.address = value;
          this.setState({ company });
        }
      },
      companyAddress2: {
        name: 'companyAddress2',
        placeholder: 'Address 2 - Apartment, Unit, etc.',
        value: company.address2 || '',
        errorClass: '',
        update: (value) => {
          const { company } = this.state;
          company.address2 = value;
          this.setState({ company });
        }
      },
      companyState: {
        name: 'companyState',
        label: 'Company State',
        errorClass: '',
        value: company.name || '',
        validator: (value) => {
          const { isCompany, isInternational, formElements, formErrorsList } = this.state;
          const valid = isCompany && !isInternational ? FormHelpers.checks.isRequired(value) : true;
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
      companyZipcode: {
        name: 'companyZipcode',
        label: 'Postal Code',
        value: company.zipcode || '',
        errorClass: '',
        validator: (value) => {
          const { isCompany, formElements, formErrorsList } = this.state;
          const valid = isCompany ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyZipcode.errorClass = 'has-error';
            formErrorsList.push('Please add a postal code.');
          } else {
            formElements.companyZipcode.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.zipcode = value;
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
      companyTaxID: {
        name: 'companyTaxID',
        label: 'Tax ID',
        placeholder: '00-0000000',
        value: company.ein || '',
        errorClass: '',
        validator: (value) => {
          const { isCompany, isInternational, formElements, formErrorsList } = this.state;
          const valid = isCompany && !isInternational ? FormHelpers.checks.isRequired(value) : true;
          if (!valid) {
            formElements.companyTaxID.errorClass = 'has-error';
            formErrorsList.push('Please add a tax id.');
          } else {
            formElements.companyTaxID.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { company } = this.state;
          company.ein = value;
          this.setState({ company });
        }
      },
      companyIncorporationDate: {
        name: 'companyIncorporationDate',
        label: 'Company Incorporation Date',
        placeholder: 'MM/DD/YYYY',
        value: company.incorporation_date || '',
        errorClass: '',
        error: false,
        validator: (value) => {
          const { isCompany, isInternational, formElements, formErrorsList } = this.state;
          const prettyDate = convertDateForDisplay(value);
          const valid = isCompany && !isInternational ? FormHelpers.checks.isMomentFormat(prettyDate, dateFormatForDisplay) : true;
          if (!valid) {
            formElements.companyIncorporationDate.errorClass = 'has-error';
            formElements.companyIncorporationDate.error = 'Please enter a valid incorporation date (MM/DD/YYYY).'
            formErrorsList.push('Please enter a valid incorporation date (MM/DD/YYYY).');
          } else {
            formElements.companyIncorporationDate.errorClass = '';
            formElements.companyIncorporationDate.error = false;
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        onChange: (value) => {
          const { company, formElements } = this.state;
          company.incorporation_date = convertDateForSave(value);
          formElements['companyIncorporationDate'].value = convertDateForDisplay(value);
          this.setState({ company, formElements });
        }
      },
      companyFilingLocation: {
        name: 'companyFilingLocation',
        label: 'State Filing Location',
        errorClass: '',
        value: company.filing_location || '',
        placeholder: 'State/Province',
        validator: (value) => {
          const { isCompany, isInternational, formElements, formErrorsList } = this.state;
          const valid = isCompany && !isInternational ? FormHelpers.checks.isRequired(value) : true;
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
          const valid = value && value.length >= minLen && value.length <= maxLen;

          if (!valid) {
            formElements.profileBio.errorClass = 'has-error';
            formErrorsList.push('Please add a bio.');
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
      },
      profileEmail: {
        name: 'profileEmail',
        label: 'Email',
        placeholder:'name@company.com',
        value: profile.email || '',
        errorClass: '',
        validator: (value) => {
          // const valid = FormHelpers.checks.isRequired(value);
          const valid = FormHelpers.checks.isEmail(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileEmail.errorClass = 'has-error';
            formErrorsList.push('Please enter a valid email address.');
          } else {
            formElements.profileEmail.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.password.errorClass = 'has-error';
            formErrorsList.push('Please enter a password.');
          } else {
            formElements.password.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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

    this.setState({ isLoading: true, formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements, apiError: false});

        if (valid) {
          this.setState({ formError: false });

          let company = this.state.company;
          company.user_id = this.state.profile.id;

          $.ajax({
            url: loom_api.company,
            method: 'POST',
            data: objectToFormData(company),
            contentType: false,
            processData: false,
            success: function (result) {
              window.location = '/prelaunch/';
            },
            error: (xhr, status, error) => {
              this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({formError: 'Please fill out all fields.', isLoading: false});
        }
      });
    });
  },

  _createAccount() {
    const { formElements } = this.state;

    this.setState({ isLoading: true, formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements, apiError: false});

        if (valid) {
          this.setState({ formError: false });

          let profile = this.state.profile;
          profile.username = profile.email;
          profile.photo = this.state.photo_file ? this.state.photo_file : '';

          $.ajax({
            url: loom_api.profile,
            method: 'POST',
            data: objectToFormData(profile),
            contentType: false,
            processData: false,
            success: function (result) {
              this.setState({profile: result});
              if (this.state.isCompany) {
                this._createCompany();
              }
              else {
                window.location = '/confirm-email/';
              }
            }.bind(this),
            error: (xhr, status, error) => {
              this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({formError: 'Please fill out all fields.', isLoading: false});
        }
      });
    });
  },

  setCompany(e) {
    let companyFlag = e.currentTarget.getAttribute('data-account') == 'company' ? true : false;
    this.setState({
      isCompany: companyFlag,
      accountType: e.currentTarget.getAttribute('data-account')
    });
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
      <div className={ 'form-group col-md-6 col-md-offset-3 ' + formElements.title.errorClass }>
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
          isCompany={this.state.isCompany}
          isInternational={this.state.isInternational}
          setCompany={this.setCompany}
          logo_url={this.state.logo_url}
          handleBio={this.handleBio}
          company={company}
          settings={false}
          prelaunch={true}
        />

        <h3 className='brand sub-section col-md-6 col-md-offset-3' id='account-form-header'>Your Personal Info</h3>

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

        <div className='col-md-3 col-md-offset-3'>
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
        <div className='col-md-3'>
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

        <div className='text-center sub-section form-group col-md-6 col-md-offset-3'>
          {error}

          <a type='submit' disabled={ this.state.isLoading ? 'true': ''} className='btn btn-brand btn-brand--attn' onClick={this._createAccount}>
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Sign Up
          </a>
        </div>

      </div>
    );
  }

});

export default PrelaunchOnboarding;