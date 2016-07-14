import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { Form, ValidatedInput, Radio, RadioGroup, FileValidator } from 'react-bootstrap-validation';

let SkillButton = require('../skill');
let AccountForm = require('./account');


let DeveloperOnboard = React.createClass({

  getInitialState() {
    return {
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        photo: '',
        biography: '',
        availability: '',
        role: '',
        skills: [],
        all_skills: []
      },
      step: 0
    };
  },

  componentDidMount: function () {
    if($('#onboard-form').data('id'))
    {
      $.get(loom_api.profile + $('#onboard-form').data('id') + '/', function (result) {
        let new_profile = result;
        new_profile.biography = result.linkedin.extra_data.summary;
        this.setState({
          profile: new_profile,
          photo_url: result.photo_url
        });
      }.bind(this));
    }
  },

  updateSkills: function (skill) {
    let updated_profile = this.state.profile;
    if (_.indexOf(updated_profile.skills, skill) !== -1) {
      _.pull(updated_profile.skills, skill);
    }
    else {
      updated_profile.skills.push(skill);
    }
    this.setState({
      profile: updated_profile
    });
  },

  handleFormChange: function (e) {
    let updated_profile = this.state.profile;
    updated_profile[$(e.currentTarget).attr('name')] = $(e.currentTarget).val();
    this.setState({
      profile: updated_profile
    });
  },

  _handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    let re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    if(re.exec(file.name)) {
      reader.onloadend = () => {
        this.setState({
          photo_url: reader.result
        });
      };
      reader.readAsDataURL(file);
      let data = new FormData();
      data.append('photo', file);
      $.ajax({
        url: loom_api.profile + this.state.profile.id + '/',
        type: 'PATCH',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {

        },
        error: function(jqXHR, textStatus, errorThrown) {

        }
      });
    }
  },

  _createAccount() {
    let new_account = {
      first_name: this.state.profile.first_name,
      last_name: this.state.profile.last_name,
      email: this.state.profile.email,
      username: this.state.profile.email,
      password: this.state.profile.password
    };
    $.ajax({
      url: loom_api.profile,
      method: 'POST',
      data: JSON.stringify(new_account),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        this.setState({
          profile: result,
          step: this.state.step ? 1 : 2
        });
      }.bind(this)
    });
  },

  _updateAccount() {
    $.ajax({
      url: loom_api.profile + this.state.profile.id + '/',
      method: 'PATCH',
      data: JSON.stringify(this.state.profile),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        if (this.state.step === 2) {
          window.location = '/profile/dashboard/';
        }
        else {
          this.setState({
            profile: result,
            step: this.state.step ? 1 : 2
          });
        }
      }.bind(this)
    });
  },

  _handleSubmit(e) {
    e.preventDefault();
    if (this.state.profile.id) {
      this._updateAccount();
    }
    else {
      this._createAccount();
    }
  },

  render() {
      let skills = this.state.profile.all_skills.map( function(skill, i) {
        return (
          <div key={i} className="pull-left">
            <SkillButton
              skill={skill}
              update_skills={this.updateSkills}
            />
          </div>
        );
      }.bind(this));

      return (
        <div>
          <div id="step-1" className={this.state.step ? 'hidden' : ''}>
            <div id="basics" className="section-header text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
              <p className="text-muted">
                Let's quickly get you set up.
              </p>
              <div className="form-group">
                I am a
                <select value={this.state.profile.role} onChange={this.handleFormChange} name="role" className="form-control select">
                  <option value="full-stack">full-stack</option>
                  <option value="mobile">mobile</option>
                  <option value="front-end">front-end</option>
                  <option value="back-end">back-end</option>
                </select>
                developer <span className="text-yellow">looking for incredible projects.</span>
              </div>
            </div>

            <AccountForm
              profile={this.state.profile}
              form_change={this.handleFormChange}
            />

          </div>

          <div id="step-2" className={this.state.step ? '' : 'hidden'}>
            <div className="section-header text-muted col-md-8 col-md-offset-2">
              Almost done! Tell us about your experience and availability.  We'll use this info to set up your profile and find great projects for you.
            </div>

            <div className='col-md-8 col-md-offset-2 panel panel-default'>
              {skills}
            </div>

            <FormGroup
              bsClass='form-group col-md-8 col-md-offset-2'
            >
              <ControlLabel>Weekly Availability</ControlLabel>
              <FormControl
                type='text'
                name='capacity'
                placeholder='XX Hours/Week'
                value={this.state.profile.capacity}
                onChange={this.handleFormChange}
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
                value={this.state.profile.city}
                onChange={this.handleFormChange}
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
                value={this.state.profile.state}
                onChange={this.handleFormChange}
              />
            </FormGroup>

            <FormGroup
              bsClass='form-group col-md-2 col-md-offset-2'
            >
              <ControlLabel>Profile Photo</ControlLabel>
              <div className='text-center'>
                <img className='profile-image img-circle' src={this.state.photo_url} />
              </div>
              <FormControl
                ref='file'
                name='file'
                type='file'
                label='Profile Photo'
                validate={files => {
                    if (!FileValidator.isEachFileSize(files, 0, 1048576)) {
                        return 'Photo must not be larger than 1MB';
                    }
                    if (!FileValidator.isExtension( files, [ 'jpg', 'jpeg', 'png', 'gif' ])) {
                        return 'File type must be a photo';
                    }
                    return true;
                }}
                onChange={this._handleImageChange}
              />
            </FormGroup>

            <FormGroup
              bsClass='form-group col-md-6'
            >
              <ControlLabel>Quick Bio</ControlLabel>
              <FormControl
                label='Biography'
                name='biography'
                componentClass='textarea'
                placeholder='Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.'
                value={this.state.profile.biography}
                onChange={this.handleFormChange}
              />
            </FormGroup>



          </div>
          <div className='text-center form-group col-md-12'>
            <Button type='submit' bsClass='btn btn-step' onClick={this._handleSubmit}>Save Profile</Button>
          </div>

        </div>
      );
  }

});

module.exports = DeveloperOnboard;

