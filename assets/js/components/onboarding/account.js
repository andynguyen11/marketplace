import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

let AccountForm = React.createClass({

  _handleFormChange(e) {
    let profile = this.props.profile;
    profile[$(e.currentTarget).attr('name')] = $(e.currentTarget).val();
    this.props.update_profile(profile);
  },

  _updateEmail(e) {
    let profile = this.props.profile;
    profile.email = $(e.currentTarget).val();
    profile.username = $(e.currentTarget).val();
    this.props.update_profile(profile);
  },

  render() {
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

          <FormGroup
            bsClass='form-group col-md-6 col-md-offset-2'
          >
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type='text'
              name='first_name'
              placeholder='First Name'
              value={this.props.profile.first_name}
              onChange={this._handleFormChange}
            />
            <ControlLabel>&nbsp;</ControlLabel>
            <FormControl
              type='text'
              name='last_name'
              placeholder='Last Name'
              value={this.props.profile.last_name}
              onChange={this._handleFormChange}
            />
          </FormGroup>

          <FormGroup
              bsClass='form-group col-md-2'
            >
              <ControlLabel>Profile Photo</ControlLabel>
              <div className='text-center'>
                <img className='profile-image img-circle' src={this.props.photo_url} />
              </div>
              <FormControl
                ref='file'
                name='file'
                type='file'
                label='Profile Photo'
                onChange={this.props.change_image}
              />
          </FormGroup>

          <FormGroup
            bsClass='form-group col-md-4 col-md-offset-2'
          >
            <ControlLabel>Your Location</ControlLabel>
            <FormControl
              type='text'
              name='city'
              placeholder='City'
              value={this.props.profile.city}
              onChange={this._handleFormChange}
            />
          </FormGroup>
          <FormGroup
            bsClass='form-group col-md-4'
          >
            <ControlLabel>&nbsp;</ControlLabel>
            <FormControl
              type='text'
              name='state'
              placeholder='State/Province'
              value={this.props.profile.state}
              onChange={this._handleFormChange}
            />
          </FormGroup>

          <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>Quick Bio</ControlLabel>
              <FormControl
                label='Biography'
                name='biography'
                componentClass='textarea'
                placeholder='Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.'
                value={this.props.profile.biography}
                onChange={this._handleFormChange}
              />
          </FormGroup>
        </div>
      );
  }

});

module.exports = AccountForm;