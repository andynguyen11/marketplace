import _ from  'lodash';
import React from 'react';
import FormHelpers from '../utils/formHelpers';

const Bid = React.createClass({
  propTypes: {
    current_user: React.PropTypes.number,
    job: React.PropTypes.object,
    isModal: React.PropTypes.bool,
    updateJob: React.PropTypes.func,
    saveCallback: React.PropTypes.func
  },

  getInitialState() {
    const {job} = this.props;
    let equity = parseInt(job.equity);
    let cash = parseInt(job.cash);

    return {
      wantsCash: cash ? true : false,
      wantsEquity: equity ? true : false,
      newBid: job.hours ? false : true,
      formErrorsList: [],
      formError: false,
      apiError: false,
      piiError: false
    };
  },

  componentWillMount() {
    this.setState({formElements: Object.assign({}, this.formElements())});
  },

  formElements() {
    const {job} = this.props;
    const {wantsCash, wantsEquity, formErrorsList} = this.state;
    const compensationType = wantsCash ? (wantsEquity ? 'mix' : 'cash') : (wantsEquity ? 'equity' : '')

    // TODO Bad Andy. Passing props into state. Figure out how not to do this.
    return {
      compensationType: {
        name: 'compensationType',
        value: job.compensationType || compensationType,
        options: [
          {
            label: 'Cash',
            value: 'cash'
          },
          {
            label: 'Equity',
            value: 'equity'
          },
          {
            label: 'Cash / Equity Mix',
            value: 'mix'
          }
        ],
        errorClass: '',
        validator: (value) => {
          const {job} = this.props;
          const valid = job.compensationType ? true : FormHelpers.checks.isRequired(value);
          const {formElements, formErrorsList} = this.state;
          if (!valid) {
            formElements.compensationType.errorClass = 'has-error';
            formErrorsList.push('Choose a type of compensation for your bid.');
          } else {
            formElements.compensationType.errorClass = '';
          }
          this.setState({formElements, formErrorsList});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          let {wantsCash, wantsEquity} = this.state;
          job.compensationType = value;
          wantsCash = (value == 'cash') || (value == 'mix');
          wantsEquity = (value == 'equity') || (value == 'mix');
          job.cash = wantsCash ? job.cash : '';
          job.equity = wantsEquity ? job.equity : '';
          this.setState({wantsCash, wantsEquity});
          updateJob(job);
        }
      },
      cash: {
        name: 'cash',
        label: 'Cash Offer',
        value: job.cash || '',
        errorClass: '',
        validator: (value) => {
          const {wantsCash} = this.state;
          const valueClean = typeof value === 'string' ? value.replace(/,/g, '') : value;
          const cashValue = parseInt(valueClean);
          const cleanValue = value.toString().match(/^\d*?\d*$/);
          const valid = wantsCash ? (typeof cashValue === 'number' && cashValue > 0) && cleanValue : true;
          const {formElements, formErrorsList} = this.state;

          if (!valid) {
            formElements.cash.errorClass = 'has-error';
            let cashError = 'Please enter a cash offer for your bid.';

            if(!!value.length) {
              if(typeof cashValue === 'number' && cashValue <= 0) {
                cashError = 'Cash offer must be more than $0.';
              }
              if(!cleanValue) {
                cashError = 'Your cash offer must be a valid whole number (no commas or decimals)';
              }
            }

            formErrorsList.push(cashError);
          } else {
            formElements.cash.errorClass = '';
          }
          this.setState({formElements, formErrorsList});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          const {formElements} = this.state;

          formElements.cash.value = value;
          job.cash = value;
          job.equity = job.compensationType == 'mix' ? job.equity : 0;
          updateJob(job);
          this.setState({formElements});
        }
      },
      equity: {
        name: 'equity',
        label: 'Equity Offer',
        value: job.equity || '',
        errorClass: '',
        validator: (value) => {
          const {wantsEquity} = this.state;
          const equityValue = parseFloat(value);
          const cleanValue = value.toString().match(/^\d*\.?\d*$/);
          const valid = wantsEquity ? ((typeof equityValue === 'number' && equityValue > 0 && equityValue < 100) && cleanValue) : true;
          const {formElements, formErrorsList} = this.state;

          if (!valid) {
            formElements.equity.errorClass = 'has-error';
            let equityError = 'Please enter an equity offer for your bid.';

            if(!!value.length) {
              if(typeof equityValue === 'number' && (equityValue <= 0 || equityValue >= 100)) {
                equityError = 'Equity offer must be more than 0% and less than 100%.';
              }
              if(!cleanValue) {
                equityError = 'Your equity offer must be a valid number.';
              }
            }

            formErrorsList.push(equityError);
          } else {
            formElements.equity.errorClass = '';
          }
          this.setState({formElements, formErrorsList});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          const {formElements} = this.state;

          formElements.equity.value = value;
          job.equity = value;
          job.cash = job.compensationType == 'mix' ? job.cash : 0;
          updateJob(job);
          this.setState({formElements});
        }
      },
      hours: {
        name: 'hours',
        label: 'How many hours do you need to complete this job?',
        value: job.hours || '',
        errorClass: '',
        validator: (value) => {
          const hoursValue = parseFloat(value);
          const cleanValue = value.toString().match(/^\d*?\d*$/);
          const valid = typeof hoursValue === 'number' && hoursValue > 0 && cleanValue;
          const {formElements, formErrorsList} = this.state;

          if (!valid) {
            formElements.hours.errorClass = 'has-error';
            let hoursError = 'Please enter a time estimate for your bid.';

            if(!!value.length) {
              if(typeof hoursValue === 'number' && hoursValue <= 0) {
                hoursError = 'Your time estimate must be more than 0.';
              }
              if(!cleanValue) {
                hoursError = 'Your time estimate must be a valid number.';
              }
            }

            formErrorsList.push(hoursError);
          } else {
            formElements.hours.errorClass = '';
          }
          this.setState({formElements, formErrorsList});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          const {formElements} = this.state;

          formElements.hours.value = value;
          formElements.hours.errorClass = '';
          job.hours = value;
          updateJob(job);
          this.setState({formElements});
        }
      },
      message: {
        name: 'message',
        placeholder: 'Include a message with your job to increase your chances of winning the job.',
        value: job.message || '',
        errorClass: '',
        validator: (value) => {
          const {newBid} = this.state;
          const hasPii = FormHelpers.doesStringContainPII(value);
          const valid = (newBid && !job.id) ? FormHelpers.checks.isRequired(value) && !hasPii : true;
          const {formElements, formErrorsList} = this.state;

          if (!valid) {
            formElements.message.errorClass = 'has-error';

            if(!hasPii) {
              formErrorsList.push('Please enter a message to submit with your bid.');
            }
          } else {
            formElements.message.errorClass = '';
          }

          this.setState({ formElements, formErrorsList, piiError: hasPii });

          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          const {formElements} = this.state;
          formElements.message.value = value;
          formElements.message.errorClass = '';
          job.message = value;
          updateJob(job);
          this.setState({formElements, piiError: false});
        }
      }
    }
  },

  handleChange(event) {
    const {formElements} = this.state;
    const {value} = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].value = value;
    formElements[fieldName].update(value);

    this.setState({formElements, formError: false});
  },

  saveBid() {
    const {formElements, formErrorsList} = this.state;
    const {job, isModal, saveCallback} = this.props;

    this.setState({ formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements, apiError: false});

        if (valid) {
          this.setState({formError: false, isLoading: true});
          $.ajax({
            url: loom_api.job + job.id + '/',
            method: 'PATCH',
            data: JSON.stringify(job),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (result) {
              if (isModal) {
                window.location = '/profile/bids/';
              }
              else {
                saveCallback();
              }
            }.bind(this),
            error: (xhr, status, error) => {
              this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({formError: 'Please fill out all fields.'});
        }
      });
    });
  },

  createBid() {
    const {formElements, formErrorsList} = this.state;
    const {current_user, project, isModal, saveCallback} = this.props;

    this.setState({ formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements, apiError: false});
        if (valid) {
          this.setState({formError: false, isLoading: true});
          let new_job = _.reduce(formElements, function (result, value, key) {
            result[key] = value['value'];
            return result;
          }, {});
          new_job.contractor = current_user;
          new_job.project = project.id;
          $.ajax({
            url: loom_api.job,
            method: 'POST',
            data: JSON.stringify(new_job),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (result) {
              if (isModal) {
                window.location = '/profile/bids/';
              }
              else {
                saveCallback();
              }
            }.bind(this),
            error: (xhr, status, error) => {
              this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({formError: 'Please fill out all fields.'});
        }
      });
    });
  },

  render() {
    const {job, project, current_user} = this.props;
    const {formElements, newBid, wantsCash, wantsEquity, formError, formErrorsList, apiError, piiError, isLoading} = this.state;
    const error = (formError || apiError || piiError) && function() {
        if(piiError) {
          return (
            <div className="alert alert-danger text-left" role="alert">
              <b>Please remove any personal contact info or external links.</b><br/><br/>
              You will be able to request a connection and exchange personal information with this user after submitting this bid.
            </div>
          );
        }

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

    const headerText = newBid ? (
      <div>
        <h4 className="brand">What type of bid do you want to submit?</h4>
      </div>
    ) : (
      <div>
        <h4 className="brand-bold">Adjust your bid for:</h4>
        <h3 className="brand-bold text-brand">{project.title}</h3>
      </div>
    );

    const compensationTypeSelector = formElements.compensationType.options.map((option, i) => {
      return (
        <div className="radio" key={i}>
          <label>
            <input type="radio" name={formElements.compensationType.name}
                   checked={formElements.compensationType.value == option.value ? 'checked' : ''} id={option.value}
                   onChange={this.handleChange} value={option.value}/>
            {option.label}
          </label>
        </div>
      );
    });

    const cashInput = wantsCash && (
        <div className="comp-inputs--cash">
          <div className={"form-group " + formElements.cash.errorClass}>
            <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}</label>&nbsp;
            <div className="input-group">
              <span className="input-group-addon">$</span>
              <input
                className="form-control"
                name={formElements.cash.name}
                id={formElements.cash.name}
                placeholder={formElements.cash.placeholder}
                value={formElements.cash.value}
                onChange={this.handleChange}
              />
              <span className="input-group-addon">.00</span>
            </div>
          </div>
        </div>
      );

    const equityInput = wantsEquity && (
        <div className="comp-inputs--equity">
          <div className={"form-group " + formElements.equity.errorClass}>
            <label className="control-label" htmlFor={formElements.equity.name}>{formElements.equity.label}</label>&nbsp;
            <div className="input-group">
              <input
                className="form-control"
                name={formElements.equity.name}
                id={formElements.equity.name}
                placeholder={formElements.equity.placeholder}
                value={formElements.equity.value}
                onChange={this.handleChange}
              />
              <span className="input-group-addon">%</span>
            </div>
          </div>
        </div>
      );


    const messageInput = (newBid && !job.id) && (
        <div className={"form-group " + formElements.message.errorClass}>
          <textarea
            className="form-control"
            name={formElements.message.name}
            id={formElements.message.name}
            placeholder={formElements.message.placeholder}
            value={formElements.message.value}
            onChange={this.handleChange}
          >
          </textarea>
        </div>
      );

    const hoursInput = (
        <div className="hours-input">
          <div className={"form-group " + formElements.hours.errorClass}>
            <h4 className="brand" htmlFor={formElements.hours.name}>{formElements.hours.label}</h4>&nbsp;
            <div className="input-group">
              <input
                  className="form-control"
                  name={formElements.hours.name}
                  id={formElements.hours.name}
                  placeholder={formElements.hours.placeholder}
                  value={formElements.hours.value}
                  onChange={this.handleChange}
              />
              <span className="input-group-addon">hours</span>
            </div>
          </div>
        </div>
    );

    return (
      <div className="bid-form text-center messages-tracker-content">
        <div className="messages-tracker-popup-content">
          <div className="bid-form-wrapper">

            {headerText}

            <div className={"form-group comp-selector " + formElements.compensationType.errorClass}>
              {compensationTypeSelector}
            </div>
            <div className="comp-inputs">
            {cashInput}
            { wantsCash && wantsEquity && <div className="comp-inputs--plus"><h4 className="bid-and">+</h4></div> }
            {equityInput}
            </div>

            {hoursInput}

            <input type="hidden" name="contractor" value={current_user} />
            <input type="hidden" name="project" value={project.id} />

            <div className="message-container">
              {messageInput}
            </div>

            {error}
            <button onClick={newBid && !job.id ? this.createBid : this.saveBid} disabled={isLoading || error} className="btn btn-brand">
              <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
               Submit Bid
            </button>
            <p className="small text-muted bid-terms">By clicking submit you agree to Loom's <a href="/terms-of-service/" target="_blank">Terms and Conditions</a></p>
          </div>
        </div>
      </div>
    )
  }
});

export default Bid;
