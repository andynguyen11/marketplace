import React from 'react';
import _ from 'lodash';
import SkillButton from '../../components/skill';
import AccountForm from '../onboarding/account';
import FormHelpers from '../../utils/formHelpers';
import BigSelect from '../../components/bigSelect';
import Loader from '../../components/loadScreen';

//TODO this is almost an exact copy paster of onboarding/developer.js

const ProfileSettings = React.createClass({

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
        role: '',
        country: 'United States of America',
        linkedin: {
          extra_data: ''
        },
        skills: [],
        all_skills: []
      },
      photo_file: '',
      isLoading: true,
      formError: false
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {
    // TODO No ID in request should return current user so we don't have to pass in the id from the dom
    $.get(loom_api.profile + $('#settings').data('id') + '/', function (result) {
      this.setState({
        profile: result,
        photo_url: result.photo_url,
        isLoading: false
      }, () => {
        this.setState({ formElements: this.formElements() });
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
        update: (value) => {
          const { profile } = this.state;
          profile.role = value;
          this.setState({ profile });
        }
      },
      capacity: {
        name: 'capacity',
        label: "Don't see the exact number you want? You can add your hours here:",
        errorClass: '',
        placeholder: '24hrs/Week',
        value: profile.capacity || '',
        update: (value) => {
          const { profile } = this.state;
          profile.capacity = value;
          this.setState({ profile });
        }
      },
      title: {
        name: 'title',
        label: 'Title',
        errorClass: '',
        placeholder: 'Your role or title at your company',
        value: profile.title || '',
        update: (value) => {
          const { profile } = this.state;
          profile.title = value;
          this.setState({ profile });
        }
      },
      profileFirstName: {
        name: 'profileFirstName',
        label: 'First Name',
        errorClass: '',
        value: profile.first_name || '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements } = this.state;
          if (!valid) {
            formElements.profileFirstName.errorClass = 'has-error';
          } else {
            formElements.profileFirstName.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.first_name = value;
          this.setState({ profile });
        }
      },
      profileLastName: {
        name: 'profileLastName',
        label: 'Last Name',
        errorClass: '',
        value: profile.last_name || '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements } = this.state;
          if (!valid) {
            formElements.profileLastName.errorClass = 'has-error';
          } else {
            formElements.profileLastName.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.last_name = value;
          this.setState({ profile });
        }
      },
      profileCity: {
        name: 'profileCity',
        label: 'City',
        errorClass: '',
        value: profile.city || '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements } = this.state;
          if (!valid) {
            formElements.profileCity.errorClass = 'has-error';
          } else {
            formElements.profileCity.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.city = value;
          this.setState({ profile });
        }
      },
      profileStateProvince: {
        name: 'profileStateProvince',
        label: 'State/Province',
        errorClass: '',
        value: profile.state || '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements } = this.state;
          if (!valid) {
            formElements.profileStateProvince.errorClass = 'has-error';
          } else {
            formElements.profileStateProvince.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.state = value;
          this.setState({ profile });
        }
      },
      profileCountry: {
        name: 'profileCountry',
        label: 'Country',
        errorClass: '',
        value: profile.country || 'United States of America',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements } = this.state;
          if (!valid) {
            formElements.profileCountry.errorClass = 'has-error';
          } else {
            formElements.profileCountry.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.country = value;
          this.setState({ profile });
        }
      },
      profileBio: {
        name: 'profileBio',
        label: 'Your Bio (optional)',
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
        this.setState({
          photo_url: reader.result,
          photo_file: file
        });
      };
      reader.readAsDataURL(file);
    }
  },

  _saveAccount() {
    const { formElements } = this.state;
    const { saveAccount } = this.props;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});

      if (valid) {
        this.setState({ formError: false, isLoading: true });
        let profile = this.state.profile;
        profile.photo = this.state.photo_file;
        saveAccount(profile);
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

  setHours(event) {
    const { formElements } = this.state;

    formElements['capacity'].update($(event.currentTarget).data('hours'));
    formElements['capacity'].value = $(event.currentTarget).data('hours');

    this.setState({ formElements, formError: false });
  },

  render() {
    const { formElements, formError, profile, isLoading } = this.state;
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
            mySkills={this.state.profile.skills}
          />
        </div>
      );
    }.bind(this));

    const skillsComponent = !!skills.length && profile.role && (
      <div>
        <div className='form-group col-md-8 col-md-offset-2'>
          <label className='control-label'>Your Stack Experience</label>
          <div className='panel panel-default panel-skills'>
            {skills}
            <div className='clearfix'></div>
          </div>
        </div>
      </div>
    );

    const roleComponent = profile.role && (
        <div id="basics" className="text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
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
                <i className="fa fa-angle-down"></i>
              </div>
              <div className="bigSelect-suffix">developer</div>
              {/*<div className="bigSelect-suffix">developer <span className="text-yellow">looking for incredible projects.</span></div>*/}
            </div>
          </div>
        </div>
      )

    const yourTitle = (
      <div className='form-group col-md-8 col-md-offset-2'>
        <label className="control-label" htmlFor={formElements.title.name}>{formElements.title.label}</label>
        <input
            className="form-control"
            type='text'
            name={formElements.title.name}
            id={formElements.title.name}
            placeholder={formElements.title.placeholder}
            value={formElements.title.value}
            onChange={this.handleChange}
        />
      </div>
    );

    const yourCapacity = profile.role && (
      <div>
        <div>
          <h4 className="text-center col-md-12 sub-section">Select an average weekly availability (hours)</h4>
          <div className="col-sm-offset-2 col-sm-2 text-center">
            <button onClick={this.setHours} data-hours='10' className={ formElements.capacity.value == '10' ? 'btn btn-hours active' : 'btn btn-hours' }>
              <h3>
                10hrs<br />
                Week
              </h3>
            </button>
          </div>

          <div className="col-sm-2 text-center">
            <button onClick={this.setHours} data-hours='20' className={ formElements.capacity.value == '20' ? 'btn btn-hours active' : 'btn btn-hours' }>
              <h3>
                20hrs<br />
                Week
              </h3>
            </button>
          </div>

          <div className="col-sm-2 text-center">
            <button onClick={this.setHours} data-hours='30' className={ formElements.capacity.value == '30' ? 'btn btn-hours active' : 'btn btn-hours' }>
              <h3>
                30hrs<br />
                Week
              </h3>
            </button>
          </div>

          <div className="col-sm-2 text-center">
            <button onClick={this.setHours} data-hours='40' className={ formElements.capacity.value == '40' ? 'btn btn-hours active' : 'btn btn-hours' }>
              <h3>
                40hrs<br />
                Week
              </h3>
            </button>
          </div>
          <div className="clearfix"></div>
        </div>
        <div className={ 'form-group form-inline text-center mid-section col-md-8 col-md-offset-2 ' + formElements.capacity.errorClass } >
          <label className="control-label" htmlFor={formElements.capacity.name}>{formElements.capacity.label}</label>
            <input
              className={ 'form-control ' + formElements.capacity.errorClass }
              type='text'
              name={formElements.capacity.name}
              id={formElements.capacity.name}
              placeholder={formElements.capacity.placeholder}
              value={formElements.capacity.value}
              onChange={this.handleChange}
            />
          <div className="clearfix"></div>
        </div>
      </div>
    )

    return (
      <div>
        { isLoading && <Loader /> }
        {roleComponent}

        <AccountForm
          photo_url={this.state.photo_url}
          profile={profile}
          handleImageChange={this.handleImageChange}
          formElements={formElements}
          handleChange={this.handleChange}
          linkedIn={false}
        />

        {yourTitle}

        {skillsComponent}

        {yourCapacity}

          <div className='text-center form-group col-md-8 col-md-offset-2'>
            {error}
            <a type='submit' className='btn btn-brand btn-brand--attn' onClick={this._saveAccount}>
              <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
              Save Profile
            </a>
          </div>
          <div className="clearfix"></div>
      </div>
    );
  }

});

export default ProfileSettings;