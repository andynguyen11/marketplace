let AccountForm = React.createClass({
  propTypes: {
    profile: React.PropTypes.object.isRequired,
    photo_url: React.PropTypes.string,
    update_profile: React.PropTypes.func.isRequired,
    change_image: React.PropTypes.func.isRequired,
    showValidationStates: React.PropTypes.bool.isRequired,
    profileFormInvalid: React.PropTypes.func.isRequired
  },

  componentWillMount() {
    const { profile, showValidationStates } = this.props;

    this.setState({ profile, validFields: this.profileRequiredFieldsValid, showValidationStates });
  },

  componentDidMount() {
    this.profileValidator();
  },

  profileRequiredFieldsValid: {
    'first_name': false,
    'last_name': false,
    'city': false,
    'state': false
  },

  profileValidator() {
    const { profile, validFields } = this.state;
    let isValid = true;

    Object.keys(validFields).forEach(function(field, i) {
      validFields[field] = !!(profile[field] && profile[field].toString().length);

      if(!validFields[field]) {
        isValid = false;
      }
    });

    this.props.profileFormInvalid(!isValid);
  },

  handleProfileChange: function(event) {
    const { profile, validFields } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    profile[fieldName] = value;
    validFields[fieldName] = !!value.length;

    this.setState({ profile, validFields });
    this.profileValidator();
  },

  render() {
    const { profile, showValidationStates } = this.state;

      return (
        <div>
          <div className={ this.props.profile.linkedin.extra_data ? 'hidden' : 'text-center section-header col-md-8 col-md-offset-2' }>
              <a className="btn btn-linkedin text-center" href={'/login/linkedin-oauth2/?next=' + window.location.pathname + window.location.hash }>
                <i className="fa fa-linkedin"></i>
                Sync with LinkedIn
              </a>
              <h4 className="text-skinny">
                &nbsp; for an easier set up <strong>OR</strong> fill in the forms below:
              </h4>
              <div className="clearfix"></div>
          </div>

          <div className={ this.props.profile.linkedin.extra_data ? 'alert alert-success text-center col-md-8 col-md-offset-2' : 'hidden' } role="alert">
            Your LinkedIn account is now <strong>SYNCED UP</strong>! You can review and edit the fields below.
          </div>

          <div className='form-group col-md-6 col-md-offset-2'>
            <label className="control-label">First Name</label>
            <input
              className={"form-control" + (!this.state.validFields.first_name && showValidationStates ? ' invalid' : ' valid')}
              type='text'
              name='first_name'
              value={profile.first_name || ''}
              onChange={this.handleProfileChange}
            />

            <label className="control-label">Last Name</label>
            <input
              className={"form-control" + (!this.state.validFields.last_name && showValidationStates ? ' invalid' : ' valid')}
              type='text'
              name='last_name'
              value={profile.last_name || ''}
              onChange={this.handleProfileChange}
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
              <label className="control-label">City</label>
              <input
                className={"form-control" + (!this.state.validFields.city && showValidationStates ? ' invalid' : ' valid')}
                type='text'
                name='city'
                data-required="true"
                placeholder='City'
                value={profile.city || ''}
                onChange={this.handleProfileChange}
              />
            </div>

            <div className='form-group col-md-4'>
              <label className="control-label">State/Province</label>
              <input
                className={"form-control" + (!this.state.validFields.state && showValidationStates ? ' invalid' : ' valid')}
                type='text'
                name='state'
                value={profile.state || ''}
                onChange={this.handleProfileChange}
              />
            </div>
          </div>

          <div className='form-group col-md-8 col-md-offset-2'>
              <label className="control-label">Quick Bio (optional)</label>
              <textarea
                rows="4"
                className="form-control"
                label='Biography'
                name='biography'
                placeholder='Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.'
                value={this.props.profile.biography}
                onChange={this.handleProfileChange}>
              </textarea>
          </div>
        </div>
      );
  }

});

module.exports = AccountForm;