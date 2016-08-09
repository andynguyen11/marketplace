import React from 'react';
import CompanyForm from './company';
import FormHelpers from '../../utils/formHelpers';

const PrelaunchOnboard = React.createClass({

  getUrlParameter(sParam){
      var sPageURL = decodeURIComponent(window.location.search.substring(1)),
          sURLVariables = sPageURL.split('&'),
          sParameterName,
          i;

      for (i = 0; i < sURLVariables.length; i++) {
          sParameterName = sURLVariables[i].split('=');

          if (sParameterName[0] === sParam) {
              return sParameterName[1] === undefined ? true : sParameterName[1];
          }
      }
  },

  getInitialState() {
    return {
      profile: {
        first_name: this.getUrlParameter('first_name'),
        last_name: this.getUrlParameter('last_name'),
        email: this.getUrlParameter('email'),
        username: this.getUrlParameter('email'),
        biography: '',
        availability: '',
        role: '',
        title: '',
        password: '',
        linkedin: {
          extra_data: ''
        }
      },
      company: {
        id: '',
        name: this.getUrlParameter('company_name'),
        description: '',
        type: '',
        filing_location: '',
        city: '',
        state: '',
        user_id: $('#onboard-form').data('id')
      },
      photo_file: '',
      photo_url: '',
      formError: false,
      isCompany: false
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {
    $.get(loom_api.profile + $('#onboard-form').data('id') + '/', (result) => {
      const new_profile = result;
      if (result.linkedin.extra_data) {
        new_profile.biography = result.linkedin.extra_data.summary;
      }

      this.setState({
        profile: new_profile,
        photo_url: result.photo_url
      }, () => {
        this.setState({ formElements: this.formElements() });
      });
    });
  },

  formElements() {
    const { profile, company } = this.state;

    return {
      title: {
        name: 'title',
        label: 'Title at Your Company',
        value: profile.title || '',
        placeholder: 'CEO, Project Manager, Product Manager, etc.',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.title = value;
          this.setState({ profile });
        }
      },
      companyName: {
        name: 'companyName',
        label: 'Company Name',
        value: company.name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { company } = this.state;
          company.name = value;
          this.setState({ company });
        }
      },
      companyState: {
        name: 'companyState',
        label: 'Company State',
        value: company.name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { company } = this.state;
          company.state = value;
          this.setState({ company });
        }
      },
      companyCity: {
        name: 'companyCity',
        label: 'Company City',
        value: company.name || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { company } = this.state;
          company.city = value;
          this.setState({ company });
        }
      },
      companyDescription: {
        name: 'companyDescription',
        label: 'Company Bio (This is what developers will see)',
        value: company.description || '',
        placeholder: 'Think of this as your elevator pitch to developers.  Get them excited in 250 characters or less.',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { company } = this.state;
          company.description = value;
          this.setState({ company });
        }
      },
      companyType: {
        name: 'companyType',
        label: 'Company Type',
        value: company.type || '',
        options: [
          {
            label: 'Limited Liability Company (LLC)',
            value: 'llc'
          },
          {
            label: 'Corporation (Inc)',
            value: 'inc'
          },
          {
            label: 'Sole Proprietorship',
            value: 'sp'
          },
          {
            label: 'Limited Partnership',
            value: 'lp'
          },
          {
            label: 'Limited Liability Partnership',
            value: 'llp'
          },
          {
            label: 'Non-Profit',
            value: 'nonprofit'
          }
        ],
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { company } = this.state;
          company.type = value;
          this.setState({ company });
        }
      },
      companyFilingLocation: {
        name: 'companyFilingLocation',
        label: 'State Filing Location',
        value: company.filing_location || '',
        placeholder: 'State/Province',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { company } = this.state;
          company.filing_location = value;
          this.setState({ company });
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
      profileEmail: {
        name: 'profileEmail',
        label: 'Email',
        value: profile.email || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.email = value;
          profile.username = value;
          this.setState({ profile });
        }
      },
      profilePassword: {
        name: 'profilePassword',
        label: 'Password',
        value: profile.password || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { profile } = this.state;
          profile.password = value;
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

  _saveAccount(e) {
    e.preventDefault();

    $.ajax({
      url: loom_api.profile + this.state.profile.id + '/',
      method: 'PATCH',
      data: JSON.stringify(this.state.profile),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        // TODO This is kinda ghetto.  Figure out a way to async both calls.
        if (this.state.company.name) {
          this._createCompany();
        }
        else {
          window.location = '/profile/dashboard/';
        }
      }.bind(this)
    });
  },

  _createCompany() {
    const { formElements } = this.state;
    this.setState({ isLoading: true });

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({ formElements });

      if(valid) {
        this.setState({ formError: false });

        $.ajax({
          url: loom_api.company,
          method: 'POST',
          data: JSON.stringify(this.state.company),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (result) {
            // TODO We should make this one post
            this._saveAccount()
          }.bind(this)
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.', isLoading: false });
      }
    });
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
        }.bind(this)
      });
  },

  _saveAccount() {
    const { formElements } = this.state;
    this.setState({ isLoading: true });

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
        this.setState({ formError: 'Please fill out all fields.', isLoading: false });
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

  render() {
    const { formElements, formError, profile, isCompany } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;
    const yourTitle = isCompany && (
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

    return (
      <div>
        <div id="basics" className="section-header text-center form-fancy bootstrap-material col-md-8 col-md-offset-2">
          <p className="text-muted">
            Let's quickly get you set up.
          </p>
        </div>

        <CompanyForm
          formElements={formElements}
          handleChange={this.handleChange}
          isCompany={this.state.isCompany}
        />

        <div className='section-header text-center col-md-8 col-md-offset-2'>Your Personal Info</div>

        {yourTitle}

        <div>

        <div className='col-md-6 col-md-offset-2'>
            <div className="form-group">
                <label className="control-label" htmlFor={formElements.profileFirstName.name}>{formElements.profileFirstName.label}</label>
                <input
                    className="form-control"
                    type='text'
                    name={formElements.profileFirstName.name}
                    value={formElements.profileFirstName.value}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label className="control-label" htmlFor={formElements.profileLastName.name}>{formElements.profileLastName.label}</label>
                <input
                    className="form-control"
                    type='text'
                    name={formElements.profileLastName.name}
                    value={formElements.profileLastName.value}
                    onChange={handleChange}
                />
            </div>
        </div>

        <div className='form-group col-md-2 profile-photo-upload'>
            <label className="control-label">Profile Photo</label>

            <div className='text-center profile-image' style={profilePhoto}></div>

            <div href="" className="btn btn-sm btn-brand btn-upload-image">
                Upload Photo
                <input
                    className="form-control"
                    ref='file'
                    name='file'
                    type='file'
                    label='Profile Photo'
                    onChange={handleImageChange}
                />
            </div>
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

          <div>

          <div className='form-group col-md-4 col-md-offset-2'>

            <label className="control-label" htmlFor={formElements.profileEmail.name}>{formElements.profileEmail.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.profileEmail.name}
              value={formElements.profileEmail.value}
              onChange={handleChange}
            />
          </div>

          <div className='form-group col-md-4'>

            <label className="control-label" htmlFor={formElements.password.name}>{formElements.password.label}</label>
            <input
              className="form-control"
              type='password'
              name={formElements.password.name}
              value={formElements.password.value}
              onChange={handleChange}
            />
          </div>
        </div>

      </div>

        <div className='text-center form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit' disabled={ this.state.isLoading ? 'true': ''} className='btn btn-brand btn-brand--attn' onClick={this._createCompany}>
            <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Save
          </a>
        </div>

      </div>
    );
  }

});

export default PrelaunchOnboard;

