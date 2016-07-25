import SkillButton from '../skill'
import AccountForm from './account'

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
        capacity: '',
        role: '',
        linkedin: {
          extra_data: ''
        },
        skills: [],
        all_skills: []
      },
      showValidationStates: false,
      formInvalid: true
    };
  },

  componentWillMount() {
    this.setState({ validFields: this.formRequiredFieldsValid });
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
      }, () => {
        this.formValidator();
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
    this.formValidator();
    this.setState({ showValidationStates: true });

    if(!this.state.formInvalid) {
      this.setState({is_loading: true, showValidationStates: false});
      let profile = this.state.profile;
      delete profile.photo; // Hacky way to prevent 400: delete photo from profile since it's not a file
      $.ajax({
        url: loom_api.profile + this.state.profile.id + '/',
        method: 'PATCH',
        data: JSON.stringify(profile),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
          if (this.state.photo_file) {
            this._uploadImage();
          }
          else {
            this.setState({is_loading: false});
            window.location = '/profile/dashboard/';
          }
        }.bind(this)
      });
    }
  },

  profileFormInvalid(isInvalid) {
    this.setState({ profileFormIsInvalid: isInvalid }, () => {
      this.formValidator();
    });
  },

  formRequiredFieldsValid: {
    'capacity': false
  },

  formValidator() {
    const { profile, validFields } = this.state;
    let isValid = true;

    Object.keys(validFields).forEach(function(field, i) {
      validFields[field] = !!(profile[field] && profile[field].toString().length);

      if(!validFields[field]) {
        isValid = false;
      }
    });

    if(this.state.profileFormIsInvalid) {
      isValid = false;
    }

    this.setState({ formInvalid: !isValid });
  },

  handleChange: function(event) {
    const { profile, validFields } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    profile[fieldName] = value;
    validFields[fieldName] = !!value.length;

    this.setState({ profile, validFields });
    this.formValidator();
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
              showValidationStates={this.state.showValidationStates}
              profileFormInvalid={this.profileFormInvalid}
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

            <div className="form-group col-md-8 col-md-offset-2">
              <label className="control-label">Average Weekly Availability (hours)</label>
              <input
                className={"form-control" + (!this.state.validFields.capacity && this.state.showValidationStates ? ' invalid' : ' valid')}
                type='text'
                name='capacity'
                placeholder='XX Hours/Week'
                value={this.state.profile.capacity || ''}
                onChange={this.handleChange}
              />
            </div>

          <div className='text-center form-group col-md-12'>
            <button type='submit' className='btn btn-step' onClick={this._saveAccount} disabled={this.state.formInvalid}>Save Profile</button>
          </div>

        </div>
      );
  }

});

module.exports = DeveloperOnboard;

