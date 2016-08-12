import React from 'react';
import FormHelpers from '../../utils/formHelpers';
import Quill from '../../components/editor/Quill'

const CompanyForm = React.createClass({
  propTypes: {
    formElements: React.PropTypes.object.isRequired,
    handleChange: React.PropTypes.func.isRequired,
    isCompany: React.PropTypes.bool.isRequired
  },

  quillConf(){
   return {
        modules: {
            toolbar: {
                container: `#toolbar-long_description`,
            },
        },
        bounds: `#project-info-long_description`,
        placeholder: this.props.formElements.companyBio.placeholder,
        theme: 'snow',
    }
  },

  expandPanel(){

  },

  minimizePanel() {

  },

  render() {
    const { formElements, handleChange, handleBio, isCompany, setCompany, handleLogoChange, logo_url, settings, prelaunch } = this.props;

    const companyPhoto = logo_url && { backgroundImage: 'url(' + logo_url + ')' } || {};

    const accountType = settings || (
        <div>
          <div className="form-group col-md-10 col-md-offset-1">
            <div id="confirm-profile" className="sub-section text-center">
              { prelaunch ? (
                  <div>
                    <h2 className="brand text-center">
                      Welcome to Loom!
                    </h2>
                    <h2 className="brand text-center">
                      Let's quickly get your account set up.
                    </h2>
                  </div>
                  ) :
                  (
                    <h2 className="brand text-center">
                      What type of account do you want?
                    </h2>
                  )
                }
                <div className={ isCompany ? "text-center picker company active"  : "text-center picker company"}  onClick={setCompany}>
                  <h4><span className="text-accent">Company</span></h4>
                  <p>A company can get work made for cash, equity, or a mix of both.</p>
                </div>
                <div className={ isCompany ? "text-center picker individual-ent"  : "text-center picker individual-ent active"}  onClick={setCompany}>
                  <h4><span className="text-brand">Individual <span className="hide-mobile">Entrepreneur</span></span></h4>
                  <p>Individual Entrepreneurs can get work made for cash only.</p>
                </div>
            </div>
          </div>
          <div className="clearfix"></div>
        </div>
    );

    const companyTypeSelector = formElements.companyType.options.map((option, i) => {
      return (
        <div className="col-md-6" key={i}>
            <label className="radio">
                <input type="radio" name={formElements.companyType.name} checked={formElements.companyType.value == option.value ? 'checked' : ''} id={option.value} onChange={handleChange} value={option.value}/>
                {option.label}
            </label>
        </div>
      );
    });

    const companyForm = isCompany && (
      <div>
        <h3 className='brand sub-section col-md-8 col-md-offset-2'>Company Info</h3>

        <div className={ 'form-group col-md-8 col-md-offset-2 ' + formElements.companyName.errorClass }>
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

        <div className='col-md-5 col-md-offset-2'>
          <div className='form-group'>
            <label className='control-label'>Country</label>
            <input className='form-control disabled' type="text" disabled="true" value="United States of America" />
            <span className='small text-muted'>Loom currently only serves US based companies.</span>
            <i className='fa fa-lock'></i>
          </div>

          <div className={ 'form-group ' + formElements.companyState.errorClass } >
            <label className="control-label" htmlFor={formElements.companyState.name}>{formElements.companyState.label}</label>
            <select className={ 'form-control ' + formElements.companyState.errorClass } value={formElements.companyState.value} name={formElements.companyState.name} id={formElements.companyState.name} onChange={handleChange} >
                <option value="">Choose one...</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
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
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
          </div>
          <div className={ 'form-group ' + formElements.companyCity.errorClass } >
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

        </div>

        <div className='form-group col-md-3 compay-photo-upload'>
            <label className="control-label">Company Photo</label>
            <div className='text-center'>
            <div className='text-center company-image' style={companyPhoto}></div>

            <div href="" className="btn btn-sm btn-brand btn-upload-image">
                Upload Photo
                <input
                    className="form-control"
                    ref='file'
                    name='file'
                    type='file'
                    label='Company Photo'
                    onChange={handleLogoChange}
                />
            </div>
            </div>
        </div>





        <div className={ 'form-group col-md-8 col-md-offset-2 ' + formElements.companyDescription.errorClass } >
          <label className="control-label" htmlFor={formElements.companyDescription.name}>{formElements.companyDescription.label}</label>
          <textarea
            className="form-control"
            name={formElements.companyDescription.name}
            id={formElements.companyDescription.name}
            placeholder={formElements.companyDescription.placeholder}
            value={formElements.companyDescription.value}
            onChange={handleChange}
            maxLength='500'
          >
          </textarea>
        </div>

        <div className={ 'form-group col-md-8 col-md-offset-2 ' + formElements.companyType.errorClass }>
          <label className="control-label col-md-12">Company Type</label>
          {companyTypeSelector}
          <div className="clearfix"></div>
        </div>

        <div className={ 'form-group col-md-8 col-md-offset-2 ' + formElements.companyFilingLocation.errorClass }>
          <label className="control-label" htmlFor={formElements.companyFilingLocation.name}>{formElements.companyFilingLocation.label}</label>
          <select className="form-control" value={formElements.companyFilingLocation.value} name={formElements.companyFilingLocation.name} id={formElements.companyFilingLocation.name} onChange={handleChange} >
            <option value="">Choose one...</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
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
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
        </div>

        <div className='form-group col-md-8 col-md-offset-2' >
          <label className="control-label" htmlFor={formElements.companyBio.name}>{formElements.companyBio.label}</label>
          <Quill
            config={this.quillConf()}
            name={formElements.companyBio.name}
            placeholder={formElements.companyBio.placeholder}
            className="long_description"
            value={formElements.companyBio.value}
            onChange={handleBio}
          />
        </div>
        <div className="clearfix"></div>
      </div>
    );

    return (
      <div className="base-form">
        {accountType}
        {companyForm}
      </div>
    );
  }

});

export default CompanyForm;

