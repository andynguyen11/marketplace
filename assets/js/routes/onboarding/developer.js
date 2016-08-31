import React from 'react';
import _ from 'lodash';
import SkillButton from '../../components/skill';
import AccountForm from './account';
import FormHelpers from '../../utils/formHelpers';
import BigSelect from '../../components/bigSelect';
import { objectToFormData } from '../project/utils';
import Loader from '../../components/loadScreen';


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
        country: 'United States of America',
        linkedin: {
          extra_data: ''
        },
        skills: [],
        all_skills: []
      },
      photo_file: '',
      photo_url: '',
      isLoading: false,
      formError: false,
      formErrorsList: [],
      apiError: false
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
        new_profile.username = result.email;
      }
      new_profile.role = 'full-stack';
      this.setState({
        profile: new_profile,
        photo_url: result.photo_url
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
        validator: FormHelpers.checks.isRequired,
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
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.capacity.errorClass = 'has-error';
            formErrorsList.push('Please add your weekly availability.');
          } else {
            formElements.capacity.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.capacity = value;
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
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileFirstName.errorClass = 'has-error';
            formErrorsList.push('Please add a first name.');
          } else {
            formElements.profileFirstName.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileLastName.errorClass = 'has-error';
            formErrorsList.push('Please add a last name.');
          } else {
            formElements.profileLastName.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.last_name = value;
          this.setState({ profile });
        }
      },
      profilePhoto: {
        errorClass: '',
        validator: () => {
          const { photo_url, formElements, formErrorsList } = this.state;
          let valid = false;

          if(photo_url.length) {
            formElements.profilePhoto.errorClass = '';
            valid = true;
          }else {
            formElements.profilePhoto.errorClass = 'has-error';
            formErrorsList.push('Please add a profile picture.');
            valid =  false;
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        }
      },
      profileCity: {
        name: 'profileCity',
        label: 'City',
        errorClass: '',
        value: profile.city || '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileCity.errorClass = 'has-error';
            formErrorsList.push('Please add a city.');
          } else {
            formElements.profileCity.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileStateProvince.errorClass = 'has-error';
            formErrorsList.push('Please add a state/province.');
          } else {
            formElements.profileStateProvince.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
          const { formElements, formErrorsList } = this.state;
          if (!valid) {
            formElements.profileCountry.errorClass = 'has-error';
            formErrorsList.push('Please add a country.');
          } else {
            formElements.profileCountry.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
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
        label: 'Quick Bio (max 250 characters)',
        placeholder:'Long walks on the beach? Bacon aficionado? Tell potential clients a little bit about yourself.',
        value: profile.biography || '',
        errorClass: '',
        validator: (value) => {
          const { formElements, formErrorsList } = this.state;
          const maxLen = 250;
          const minLen = 1;
          const valid = value && value.length >= minLen && value.length <= maxLen;

          if (!valid) {
            formElements.profileBio.errorClass = 'has-error';
            if (value.length > maxLen) {
              formErrorsList.push('Your bio is longer than 250 characters.');
            }
            else {
              formErrorsList.push('Please add a bio.');
            }
          } else {
            formElements.profileBio.errorClass = '';
          }
          this.setState({ formElements, formErrorsList });
          return valid;
        },
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

    this.setState({ formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({ formElements, apiError: false });

        if (valid) {
          this.setState({ formError: false, isLoading: true });
          let profile = this.state.profile;
          profile.photo = this.state.photo_file;
          profile.signup = true;
          $.ajax({
            url: loom_api.profile + profile.id + '/',
            method: 'PATCH',
            data: objectToFormData(profile),
            contentType: false,
            processData: false,
            success: function (result) {
              window.location = '/profile/dashboard/';
            }.bind(this),
            error: (xhr, status, error) => {
              this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({ formError: 'Please fill out all fields.' });
        }
      });
    })
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].value = value;
    formElements[fieldName].update(value);

    this.setState({ formElements, formError: false });
  },

  setHours(event) {
    const { formElements } = this.state;

    formElements['capacity'].update($(event.currentTarget).data('hours').toString());
    formElements['capacity'].value = $(event.currentTarget).data('hours').toString();

    this.setState({ formElements, formError: false });
  },

  render() {
    const { formElements, formError, formErrorsList, apiError, profile, isLoading } = this.state;
    const error = (formError || apiError) && function() {
      let errorsList = formErrorsList.map((thisError, i) => {
        return <span key={i}>{thisError}<br/></span>;
      });

      if(!formErrorsList.length){
        errorsList = formError;
      }

      if(apiError) {
        errorsList = apiError;
      }

      return <div className="alert alert-danger text-left" role="alert">{errorsList}</div>;
    }();

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

    const skillsComponent = !!skills.length && (
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

    return (
      <div>
        { isLoading && <Loader /> }
        <div id="basics" className="text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
          <div className="form-group">
            {/*TODO: replace this with the BigSelect component*/}
            {/*<BigSelect onSelect={this.handleChange} options={formElements.role.options} selectedOptionIndex={0} name="role" id="role" prefix="I am a" suffix={<span>developer <span className="text-yellow">looking for incredible projects.</span></span>}/>*/}
            <div className="bigSelect">
              <div className="bigSelect-prefix">I am a</div>
              <div className="bigSelect-options">
                <div className="bigSelect-selector">{profile.role}</div>
                <i className="fa fa-angle-down"></i>
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
            linkedIn={true}
        />

        {skillsComponent}

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

        <div className='text-center form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit' disabled={ this.state.isLoading ? 'true': ''} className='btn btn-brand btn-brand--attn' onClick={this._saveAccount}  >
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Sign Up
          </a>
        </div>

      </div>
    );
  }

});

export default DeveloperOnboard;

