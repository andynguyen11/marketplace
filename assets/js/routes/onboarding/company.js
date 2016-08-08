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
        <div className="radio" key={i}>
            <label>
              <input type="radio" name={formElements.isCompany.name} id={option.value} onChange={handleChange} value={option.value}/>
              {option.label}
            </label>
        </div>
      );
    });

    const companyTypeSelector = formElements.companyType.options.map((option, i) => {
      return (
        <div className="radio" key={i}>
            <label>
                <input type="radio" name={formElements.companyType.name} id={option.value} onChange={handleChange} value={option.value}/>
                {option.label}
            </label>
        </div>
      );
    });

    const companyForm = isCompany && (
      <div>
        <div className='section-header text-center col-md-8 col-md-offset-2'>Company Info</div>

        <div className='form-group col-md-8 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.companyName.name}>{formElements.companyName.label}</label>
          <input
              className="form-control"
              type='text'
              name={formElements.companyName.name}
              id={formElements.companyName.name}
              placeholder={formElements.companyName.placeholder}
              value={formElements.companyName.value}
              onChange={handleChange}
          />
        </div>

        <div className='form-group col-md-4 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.companyCity.name}>{formElements.companyCity.label}</label>
          <input
              className="form-control"
              type='text'
              name={formElements.companyCity.name}
              id={formElements.companyCity.name}
              placeholder={formElements.companyCity.placeholder}
              value={formElements.companyCity.value}
              onChange={handleChange}
          />
        </div>

        <div className='form-group col-md-4'>
          <label className="control-label" htmlFor={formElements.companyState.name}>{formElements.companyState.label}</label>
          <input
              className="form-control"
              type='text'
              name={formElements.companyState.name}
              id={formElements.companyState.name}
              placeholder={formElements.companyState.placeholder}
              value={formElements.companyState.value}
              onChange={handleChange}
          />
        </div>

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
          <select className="form-control" value={formElements.companyFilingLocation.value} name={formElements.companyFilingLocation.name} id={formElements.companyFilingLocation.name} onChange={handleChange} >
            <option value="DE">Delaware</option>
            <option value="TX">Texas</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DC">District of Columbia</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
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

