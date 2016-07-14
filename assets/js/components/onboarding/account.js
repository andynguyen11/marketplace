import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

let AccountForm = React.createClass({

  _handleFormChange: function (e) {
    this.props.form_change(e);
  },

  render() {
      return (
        <div>
          <div className={ this.props.profile.linkedin ? 'hidden' : 'text-center section-header col-md-8 col-md-offset-2' }>
              <a className="btn btn-linkedin text-center" href={'/login/linkedin-oauth2/?next=' + window.location.pathname }>
                <i className="fa fa-linkedin"></i>
                Sync with LinkedIn
              </a>
              <h4 className="text-skinny">
                &nbsp; for an easier set up <strong>OR</strong> fill in the forms below:
              </h4>
              <div className="clearfix"></div>
          </div>

          <div className={ this.props.profile.linkedin ? 'alert alert-success text-center col-md-8 col-md-offset-2' : 'hidden' } role="alert">
            Your LinkedIn account is now <strong>SYNCED UP</strong>! You can review and edit the fields below.
          </div>

          <FormGroup
            bsClass='form-group col-md-4 col-md-offset-2'
          >
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type='text'
              name='first_name'
              placeholder='First Name'
              value={this.props.profile.first_name}
              onChange={this._handleFormChange}
            />
          </FormGroup>

          <FormGroup
            bsClass='form-group col-md-4'
          >
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
            bsClass='form-group col-md-8 col-md-offset-2'
          >
            <ControlLabel>Email</ControlLabel>
            <FormControl
              type='text'
              name='email'
              placeholder='Email'
              value={this.props.profile.email}
              onChange={this._handleFormChange}
            />
          </FormGroup>

          <FormGroup
            bsClass='form-group col-md-8 col-md-offset-2'
          >
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type='password'
              name='password'
              onChange={this._handleFormChange}
            />
          </FormGroup>
        </div>
      );
  }

});

module.exports = AccountForm;