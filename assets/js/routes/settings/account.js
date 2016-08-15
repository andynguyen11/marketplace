import React from 'react';
import Loader from '../../components/loadScreen';
import FormHelpers from '../../utils/formHelpers';


const AccountSettings = React.createClass({

  getInitialState() {
    return {
      profile: {
        email: '',
        password: '',
        phone: '',
        email_notifictions: ''
      },
      isLoading: true,
      formError: false
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {
    $.get(loom_api.profile + $('#settings').data('id') + '/', function (result) {
      this.setState({
        profile: result,
        isLoading: false
      }, () => {
        this.setState({ formElements: this.formElements() });
      });
    }.bind(this));
  },

  formElements() {
    const { profile } = this.state;

    return {
      email: {
        name: 'email',
        label: "Email",
        errorClass: '',
        value: profile.email || '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const { formElements } = this.state;
          if (!valid) {
            formElements.email.errorClass = 'has-error';
          } else {
            formElements.email.errorClass = '';
          }
          this.setState({ formElements });
          return valid;
        },
        update: (value) => {
          const { profile } = this.state;
          profile.email = value;
          profile.username = value;
          this.setState({ profile });
        }
      },
      password: {
        name: 'password',
        label: "Change Password",
        value: profile.password || '',
        update: (value) => {
          const { profile } = this.state;
          profile.password = value;
          this.setState({ profile });
        }
      },
      phone: {
        name: 'phone',
        label: "Phone Number",
        value: profile.phone || '',
        update: (value) => {
          const { profile } = this.state;
          profile.phone = value;
          this.setState({ profile });
        }
      },
      email_notifications: {
        name: 'email_notifications',
        label: "Receive email notifications from Loom",
        value: profile.email_notifications || '',
        update: (value) => {
          const { profile } = this.state;
          profile.email_notifications = value;
          this.setState({ profile });
        }
      },
    }
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    console.log(value)
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].value = value;
    formElements[fieldName].update(value);

    this.setState({ formElements, formError: false });
  },

  _saveAccount() {
    const { formElements, profile } = this.state;
    const { saveAccount } = this.props;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});

      if (valid) {
        this.setState({ formError: false, isLoading: true });
        delete profile.photo;
        saveAccount(profile);
      } else {
        this.setState({ formError: 'Please fill out all fields.' });
      }
    });
  },

  render() {
    const { formElements, formError, isLoading } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    return (
      <div className='base-form sub-section'>
        { isLoading && <Loader /> }
        <div className='col-md-4 col-md-offset-2'>
          <div className={ 'form-group ' + formElements.email.errorClass }>
            <label className="control-label" htmlFor={formElements.email.name}>{formElements.email.label}</label>
            <input
              className={ 'form-control ' + formElements.email.errorClass }
              type='text'
              name={formElements.email.name}
              value={formElements.email.value}
              onChange={this.handleChange}
            />
          </div>
          <div className='form-group'>
            <label className="control-label" htmlFor={formElements.password.name}>{formElements.password.label}</label>
            <input
              className='form-control'
              type='password'
              name={formElements.password.name}
              value={formElements.password.value}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className='col-md-4'>
          <div className='form-group'>
            <label className="control-label" htmlFor={formElements.phone.name}>{formElements.phone.label}</label>
            <input
              className='form-control'
              type='text'
              name={formElements.phone.name}
              value={formElements.phone.value}
              onChange={this.handleChange}
            />
          </div>
          <div className='checkbox'>
            <label htmlFor={formElements.email_notifications.name}>
              <input
                type='checkbox'
                name={formElements.email_notifications.name}
                value={!formElements.email_notifications.value}
                checked={formElements.email_notifications.value ? 'checked' : ''}
                onChange={this.handleChange}
              />
              {formElements.email_notifications.label}
            </label>
          </div>
        </div>

        <div className='text-center form-group col-md-8 col-md-offset-2'>
          {error}

          <a type='submit' disabled={ isLoading ? 'true': ''} className='btn btn-brand btn-brand--attn' onClick={this._saveAccount}  >
            <i className={ isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
            Save Account
          </a>
        </div>


      </div>
    );
  }
});

export default AccountSettings;