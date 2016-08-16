import React from 'react';
import AccountForm from '../onboarding/account';
import CompanyForm from '../onboarding/company';
import FormHelpers from '../../utils/formHelpers';
import { objectToFormData } from '../project/utils'
import Loader from '../../components/loadScreen';

// TODO Create a settings router

const CompanySettings = React.createClass({

  getInitialState() {
    return {
      company: {
        id: '',
        name: '',
        description: '',
        type: '',
        filing_location: '',
        city: '',
        state: '',
        user_id: $('#settings').data('id')
      },
      logo_file: '',
      logo_url: '',
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
          logo_url: result.logo,
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
        value: company.name || '',
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
        label: 'Company Overview (Limited to 500 characters)',
        value: company.description || '',
        placeholder: 'This is a top-line description of your company.',
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
      companyBio: {
        name: 'companyBio',
        errorClass: '',
        label: 'Company Bio (Optional - You can do this later)',
        value: company.long_description || '',
        placeholder: 'This is a long form bio of your company. Tell developers the story of your company, your goals, and all they need to know about working with you.  You can add images in this section to help your story.',
        update: (value) => {
          const { company } = this.state;
          company.long_description = value;
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
      company.logo = this.state.logo_file;
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
        console.log(company)
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

