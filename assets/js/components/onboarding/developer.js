import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

let SkillButton = require('../skill');
let AccountForm = require('./account');


let DeveloperOnboard = React.createClass({

  getInitialState() {
    return {
      is_loading: false,
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        photo: '',
        biography: '',
        availability: '',
        role: '',
        linkedin: {
          extra_data: ''
        },
        skills: [],
        all_skills: []
      }
    };
  },

  componentDidMount() {
      $.get(loom_api.profile + $('#onboard-form').data('id') + '/', function (result) {
        let new_profile = result;
        if (result.linkedin.extra_data) {
          new_profile.biography = result.linkedin.extra_data.summary;
        }
        this.setState({
          profile: new_profile,
          photo_url: result.photo_url
        });
      }.bind(this));
  },

  updateProfile(updated_profile) {
    this.setState({
      profile: updated_profile
    });
  },

  updateSkills(skill) {
    let updated_profile = this.state.profile;
    if (_.indexOf(updated_profile.skills, skill) !== -1) {
      _.pull(updated_profile.skills, skill);
    }
    else {
      updated_profile.skills.push(skill);
    }
    this.updateProfile(updated_profile);
  },

  handleFormChange(e) {
    let updated_profile = this.state.profile;
    updated_profile[$(e.currentTarget).attr('name')] = $(e.currentTarget).val();
    this.updateProfile(updated_profile);
  },

  handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    let re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    if(re.exec(file.name)) {
      reader.onloadend = () => {
        this.setState({
          photo_url: reader.result,
          photo_file: file
        });
      };
      reader.readAsDataURL(file);
    }
  },

  _uploadImage() {
    this.setState({ is_loading: true });
    let data = new FormData();
      data.append('photo', this.state.photo_file);
      $.ajax({
        url: loom_api.profile + this.state.profile.id + '/',
        type: 'PATCH',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
          this.setState({ is_loading: false });
          window.location = '/profile/dashboard/';
        }
      });
  },

  _saveAccount(e) {
    e.preventDefault();
    this.setState({ is_loading: true });
    let profile = this.state.profile;
    delete profile.photo; // Hacky way to prevent 400: delete photo from profile since it's not a file
    $.ajax({
      url: loom_api.profile + this.state.profile.id + '/',
      method: 'PATCH',
      data: JSON.stringify(profile),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        if (this.state.photo_file) {
          this._uploadImage();
        }
        else {
          this.setState({ is_loading: false });
          window.location = '/profile/dashboard/';
        }
      }.bind(this)
    });
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
            <div id="basics" className="section-header text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
              <p className="text-muted">
                Let's get your profile set up, so you can be discovered!
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
              photo_url={this.state.photo_url}
              update_profile={this.updateProfile}
              change_image={this.handleImageChange}
            />

            <div className="section-header text-muted col-md-8 col-md-offset-2">
              Almost done! Tell us about your experience and availability.  We'll use this info to set up your profile and find great projects for you.
            </div>

            <div className='col-md-8 col-md-offset-2'>
              <div className='panel panel-default panel-skills'>
                {skills}
                <div className='clearfix'></div>
              </div>
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

          <div className='text-center form-group col-md-12'>
            <Button type='submit' bsClass='btn btn-step' onClick={this._saveAccount}>Save Profile</Button>
          </div>

        </div>
      );
  }

});

module.exports = DeveloperOnboard;

