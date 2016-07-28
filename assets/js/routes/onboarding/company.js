import React from 'react';
import FormHelpers from '../../utils/formHelpers';

const CompanyForm = React.createClass({
  propTypes: {
    formElements: React.PropTypes.object.isRequired,
    handleChange: React.PropTypes.func.isRequired,
    isCompany: React.PropTypes.bool.isRequired
  },

  render() {
    const { formElements, handleChange, isCompany } = this.props;

    const isCompanySelector = formElements.isCompany.options.map((option, i) => {
      return (
        <label className="control-label" htmlFor={option.value} key={i}>
          <input type="radio" name={formElements.isCompany.name} id={option.value} onChange={handleChange} value={option.value}/>
          {option.label}
        </label>
      );
    });

    const companyTypeSelector = formElements.companyType.options.map((option, i) => {
      return (
        <label className="control-label" htmlFor={option.value} key={i}>
          <input type="radio" name={formElements.companyType.name} id={option.value} onChange={handleChange} value={option.value}/>
          {option.label}
        </label>
      );
    });

    const companyForm = isCompany && (
      <div>
        <div className='section-header text-center col-md-8 col-md-offset-2'>Company Info</div>

        <div className='form-group col-md-8 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.companyDescription.name}>{formElements.companyDescription.label}</label>
          <textarea
            className="form-control"
            name={formElements.companyDescription.name}
            id={formElements.companyDescription.name}
            placeholder={formElements.companyDescription.placeholder}
            value={formElements.companyDescription.value}
            onChange={handleChange}
          >
          </textarea>
        </div>
        <div className='form-group col-md-8 col-md-offset-2'>
          <label className="control-label">Company Type</label>
          {companyTypeSelector}
        </div>

        <div className='form-group col-md-8 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.companyFilingLocation.name}>{formElements.companyFilingLocation.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.companyFilingLocation.name}
            id={formElements.companyFilingLocation.name}
            placeholder={formElements.companyFilingLocation.placeholder}
            value={formElements.companyFilingLocation.value}
            onChange={handleChange}
          />
        </div>

      </div>
    );

    return (
      <div>
        <div className="section-header text-center col-md-8 col-md-offset-2">
          {formElements.isCompany.label}
        </div>

        <div className="form-group col-md-8 col-md-offset-2">
          {isCompanySelector}
        </div>

        {companyForm}

      </div>
    );
  }

});

export default CompanyForm;

