import React from 'react';

const AccountForm = React.createClass({
  propTypes: {
    formElements: React.PropTypes.object.isRequired,
    handleChange: React.PropTypes.func.isRequired,
    isCompany: React.PropTypes.bool
  },

  render() {
    const { formElements, handleChange, profile } = this.props;

    return (
      <div>
        <div className={ profile.linkedin.extra_data ? 'hidden' : 'text-center section-header col-md-8 col-md-offset-2' }>
            <a className="btn btn-linkedin text-center" href={'/login/linkedin-oauth2/?next=' + window.location.pathname + window.location.hash }>
              <i className="fa fa-linkedin"></i>
              Sync with LinkedIn
            </a>
            <h4 className="text-skinny">
              &nbsp; for an easier set up <strong>OR</strong> fill in the forms below:
            </h4>
            <div className="clearfix"></div>
        </div>

        <div className={ profile.linkedin.extra_data ? 'alert alert-success text-center col-md-8 col-md-offset-2' : 'hidden' } role="alert">
          Your LinkedIn account is now <strong>SYNCED UP</strong>! You can review and edit the fields below.
        </div>

        <div className='form-group col-md-6 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.profileFirstName.name}>{formElements.profileFirstName.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.profileFirstName.name}
            value={formElements.profileFirstName.value}
            onChange={handleChange}
          />

          <label className="control-label" htmlFor={formElements.profileLastName.name}>{formElements.profileLastName.label}</label>
          <input
              className="form-control"
              type='text'
              name={formElements.profileLastName.name}
              value={formElements.profileLastName.value}
              onChange={handleChange}
          />
        </div>

        <div className='form-group col-md-2'>
            <label className="control-label">Profile Photo</label>
            <div className='text-center'>
              <img className='profile-image img-circle' src={this.props.photo_url} />
            </div>
            <input
              className="form-control"
              ref='file'
              name='file'
              type='file'
              label='Profile Photo'
              onChange={this.props.change_image}
            />
        </div>

        <div>

          <div className='form-group col-md-4 col-md-offset-2'>

            <label className="control-label" htmlFor={formElements.profileCity.name}>{formElements.profileCity.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.profileCity.name}
              value={formElements.profileCity.value}
              onChange={handleChange}
            />
          </div>

          <div className='form-group col-md-4'>

            <label className="control-label" htmlFor={formElements.profileStateProvince.name}>{formElements.profileStateProvince.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.profileStateProvince.name}
              value={formElements.profileStateProvince.value}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className='form-group col-md-8 col-md-offset-2'>
          <label className="control-label" htmlFor={formElements.profileBio.name}>{formElements.profileBio.label}</label>
          <textarea
            className="form-control"
            name={formElements.profileBio.name}
            id={formElements.profileBio.name}
            placeholder={formElements.profileBio.placeholder}
            value={formElements.profileBio.value}
            onChange={handleChange}
          >
          </textarea>
        </div>
      </div>
    );
  }
});

export default AccountForm;