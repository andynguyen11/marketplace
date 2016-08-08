import React from 'react';
import _ from 'lodash';
import SkillButton from '../../components/skill';
import AccountForm from './account';
import FormHelpers from '../../utils/formHelpers';
import BigSelect from '../../components/bigSelect';

const DeveloperOnboard = React.createClass({

  getInitialState() {
    return {
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        photo: '',
        biography: '',
        capacity: '',
        role: 'full-stack',
        linkedin: {
          extra_data: ''
        },
        skills: [],
        all_skills: []
      },
      isLoading: false,
      formError: false
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {
    $.get(loom_api.profile + $('#onboard-form').data('id') + '/', function (result) {
      let new_profile = result;
      if (result.linkedin.extra_data) {
        new_profile.biography = result.linkedin.extra_data.summary;
      }
      new_profile.role = 'full-stack';
      this.setState({
        profile: new_profile,
        photo_url: result.photo_url
      });
    }.bind(this));
  },

  formElements() {
    const { profile } = this.state;

    return {
      role: {
        name: 'role',
        label: 'I am a',
        value: profile.role || '',
        options: [
          {
            label: 'full-stack',
            value: 'full-stack'
          },
          {
            label: 'mobile',
            value: 'mobile'
          },
          {
            label: 'front-end',
            value: 'front-end'
          },
          {
            label: 'back-end',
            value: 'back-end'
          }
        ],
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.role = value;
          this.setState({ profile });
        }
      },
      capacity: {
        name: 'capacity',
        label: 'Average Weekly Availability (hours)',
        placeholder: 'XX Hours/Week',
        value: profile.capacity || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.capacity = value;
          this.setState({ profile });
        }
      },
      profileFirstName: {
        name: 'profileFirstName',
        label: 'First Name',
        value: profile.first_name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.first_name = value;
          this.setState({ profile });
        }
      },
      profileLastName: {
        name: 'profileLastName',
        label: 'Last Name',
        value: profile.last_name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.last_name = value;
          this.setState({ profile });
        }
      },
      profileCity: {
        name: 'profileCity',
        label: 'City',
        value: profile.city || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.city = value;
          this.setState({ profile });
        }
      },
      profileStateProvince: {
        name: 'profileStateProvince',
        label: 'State/Province',
        value: profile.state || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.state = value;
          this.setState({ profile });
        }
      },
      profileBio: {
        name: 'profileBio',
        label: 'Quick Bio (optional)',
        placeholder:'Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.',
        value: profile.biography || '',
        update: (value) => {
          const { profile } = this.state;
          profile.biography = value;
          this.setState({ profile });
        }
      }
    }
  },

  // would like to rework this into the formElements flow at some point
  updateSkills(skill) {
    const { profile } = this.state;

    if (_.indexOf(profile.skills, skill) !== -1) {
      _.pull(profile.skills, skill);
    }
    else {
      profile.skills.push(skill);
    }

    this.setState({ profile, formError: false });
  },

  handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    let re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    if(re.exec(file.name)) {
      reader.onloadend = () => {
        debugger
        this.setState({
          photo_url: reader.result,
          photo_file: file
        });
      };
      reader.readAsDataURL(file);
    }
  },

  _uploadImage() {
    this.setState({ isLoading: true });
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
          this.setState({ isLoading: false });
          window.location = '/profile/dashboard/';
        }
      });
  },

  _saveAccount() {
    const { formElements } = this.state;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});

      if (valid) {
        this.setState({ formError: false, isLoading: true });
        let profile = this.state.profile;
        delete profile.photo; // Hacky way to prevent 400: delete photo from profile since it's not a file
        $.ajax({
          url: loom_api.profile + profile.id + '/',
          method: 'PATCH',
          data: JSON.stringify(profile),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (result) {
            if (this.state.photo_file) {
              this._uploadImage();
            }
            else {
              this.setState({ isLoading: false });
              window.location = '/profile/dashboard/';
            }
          }.bind(this)
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.' });
      }
    });
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  render() {
    const { formElements, formError, profile } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    const roleOptions = formElements.role.options.map((option, i) => {
      return <option value={option.value} key={i}>{option.label}</option>;
    });

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

    const skillsComponent = !!skills.length && (
      <div>
        <div className="section-header text-muted col-md-8 col-md-offset-2">
          Almost done! Tell us about your experience and availability.  We'll use this info to set up your profile and find great projects for you.
        </div>

        <div className='col-md-8 col-md-offset-2'>
          <div className='panel panel-default panel-skills'>
            {skills}
            <div className='clearfix'></div>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <div id="basics" className="section-header text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
          <p className="text-muted">
            Let's get your profile set up, so you can be discovered!
          </p>
          <div className="form-group">
            {/*TODO: replace this with the BigSelect component*/}
            {/*<BigSelect onSelect={this.handleChange} options={formElements.role.options} selectedOptionIndex={0} name="role" id="role" prefix="I am a" suffix={<span>developer <span className="text-yellow">looking for incredible projects.</span></span>}/>*/}
            <div className="bigSelect">
              <div className="bigSelect-prefix">I am a</div>
              <div className="bigSelect-options">
                <div className="bigSelect-selector">{profile.role}</div>
                <select name="role" id="role" value={profile.role} onChange={this.handleChange}>
                  {roleOptions}
                </select>
              </div>
              <div className="bigSelect-suffix">developer</div>
              {/*<div className="bigSelect-suffix">developer <span className="text-yellow">looking for incredible projects.</span></div>*/}
            </div>
          </div>
        </div>

        <AccountForm
            photo_url={this.state.photo_url}
            profile={profile}
            handleImageChange={this.handleImageChange}
            formElements={formElements}
            handleChange={this.handleChange}
        />

        {skillsComponent}

        <div className="form-group col-md-8 col-md-offset-2">
          <label className="control-label" htmlFor={formElements.capacity.name}>{formElements.capacity.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.capacity.name}
            id={formElements.capacity.name}
            placeholder={formElements.capacity.placeholder}
            value={formElements.capacity.value}
            onChange={this.handleChange}
          />
        </div>

        <div className='text-center form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit' className='btn btn-brand btn-brand--attn' onClick={this._saveAccount}>
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Save Profile
          </a>
        </div>

      </div>
    );
  }

});

export default DeveloperOnboard;

