import React from 'react';
import moment from 'moment';
import AccountForm from '../onboarding/account';
import CompanyForm from '../onboarding/company';
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

const CompanySettings = React.createClass({

  getInitialState() {
    return {
      company: {
        id: '',
        name: '',
        description: '',
        type: '',
        filing_location: '',
        country: 'United States of America',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        incorporation_date: '',
        ein: '',
        user_id: $('#settings').data('id')
      },
      formError: false,
      isCompany: true,
      isLoading: true
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {
    // TODO No ID in request should return current user so we don't have to pass in the id from the dom
    if ($('#settings').data('company')) {
      $.get(loom_api.company + $('#settings').data('company') + '/', (result) => {
        this.setState({
          company: result,
          isLoading: false
        }, () => {
          this.setState({ formElements: this.formElements() });
        });
      });
    }
    this.setState({ isLoading: false });
  },

  formElements() {
    const { company } = this.state;

    return {
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
      }
    }
  },

  _saveCompany() {
    const { formElements, isCompany } = this.state;
    this.setState({ isLoading: true });

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({ formElements });
      let company = this.state.company;
      company.user_id = $('#settings').data('id');
      if(valid) {
        this.setState({ formError: false });
          $.ajax({
            url: loom_api.company + this.state.company.id + '/',
            method: 'PATCH',
            data: objectToFormData(company),
            contentType: false,
            processData: false,
            success: function (result) {
              window.location = '/profile/dashboard/';
            }.bind(this)
          });
      } else {
        this.setState({ formError: 'Please fill out all fields.', isLoading: false });
      }
    });
  },

  _createCompany() {
    const { formElements, isCompany } = this.state;
    this.setState({ isLoading: true });

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({ formElements });

      if(valid) {
        this.setState({ formError: false });
        let company = this.state.company;
        company.user_id = $('#settings').data('id');
        company.logo = this.state.logo_file;
          $.ajax({
            url: loom_api.company,
            method: 'POST',
            data: objectToFormData(company),
            contentType: false,
            processData: false,
            success: function (result) {
              // TODO We should make this one post
              this.setState({
                company: result,
                isLoading: false
              });
            }.bind(this)
          });
      } else {
        this.setState({ formError: 'Please fill out all fields.', isLoading: false });
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

  handleBio(event) {
    const { formElements } = this.state;

    formElements['companyBio'].update(event);
    formElements['companyBio'].value = event;

    this.setState({ formElements, formError: false });
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
    const { formElements, formError, profile, isCompany, isLoading } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    return (
      <div>
        { isLoading && <Loader /> }
        <CompanyForm
          formElements={formElements}
          handleChange={this.handleChange}
          isCompany={this.state.isCompany}
          isInternational={this.state.isInternational}
          handleBio={this.handleBio}
          setCompany={this.setCompany}
          handleLogoChange={this.handleLogoChange}
          logo_url={this.state.logo_url}
          settings={true}
          prelaunch={false}
        />

          <div className='text-center sub-section form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit'
            disabled={ this.state.isLoading ? 'true': ''}
            className='btn btn-brand btn-brand--attn'
            onClick={this.state.company.id ? this._saveCompany : this._createCompany}
          >
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Save
          </a>
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }

});

export default CompanySettings;

