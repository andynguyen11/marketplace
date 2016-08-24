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
      newBid: job.hours ? false : true
    };
  },

  componentWillMount() {
    this.setState({formElements: this.formElements()});
  },

  formElements() {
    const {job} = this.props;
    const {wantsCash, wantsEquity} = this.state;
    const compensationType = wantsCash ? (wantsEquity ? 'mix' : 'cash') : (wantsEquity ? 'equity' : '')

    // TODO Bad Andy. Passing props into state.  Figure out how not to do this.
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
          const {formElements} = this.state;
          if (!valid) {
            formElements.compensationType.errorClass = 'has-error';
          } else {
            formElements.compensationType.errorClass = '';
          }
          this.setState({formElements});
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
          const valid = wantsCash ? FormHelpers.checks.isRequired(value) : true;
          const {formElements} = this.state;
          if (!valid) {
            formElements.cash.errorClass = 'has-error';
          } else {
            formElements.cash.errorClass = '';
          }
          this.setState({formElements});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          job.cash = value;
          job.equity = job.compensationType == 'mix' ? job.equity : 0;
          updateJob(job);
        }
      },
      equity: {
        name: 'equity',
        label: 'Equity Offer',
        value: job.equity || '',
        errorClass: '',
        validator: (value) => {
          const {wantsEquity} = this.state;
          const valid = wantsEquity ? FormHelpers.checks.isRequired(value) : true;
          const {formElements} = this.state;
          if (!valid) {
            formElements.equity.errorClass = 'has-error';
          } else {
            formElements.equity.errorClass = '';
          }
          this.setState({formElements});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          job.equity = value;
          job.cash = job.compensationType == 'mix' ? job.cash : 0;
          updateJob(job);
        }
      },
      hours: {
        name: 'hours',
        label: 'Time Estimate',
        value: job.hours || '',
        errorClass: '',
        validator: (value) => {
          const valid = FormHelpers.checks.isRequired(value);
          const {formElements} = this.state;
          if (!valid) {
            formElements.hours.errorClass = 'has-error';
          } else {
            formElements.hours.errorClass = '';
          }
          this.setState({formElements});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          job.hours = value;
          updateJob(job);
        }
      },
      message: {
        name: 'message',
        placeholder: 'Include a message with your job to increase your chances of winning the job.',
        value: job.message || '',
        errorClass: '',
        validator: (value) => {
          const {newBid} = this.state;
          const valid = newBid ? FormHelpers.checks.isRequired(value) : true;
          const {formElements} = this.state;
          if (!valid) {
            formElements.message.errorClass = 'has-error';
          } else {
            formElements.message.errorClass = '';
          }
          this.setState({formElements});
          return valid;
        },
        update: (value) => {
          const {job, updateJob} = this.props;
          job.message = value;
          updateJob(job);
        }
      }
    }
  },

  handleChange(event) {
    const {formElements} = this.state;
    const {value} = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({formElements, formError: false});
  },

  saveBid() {
    const {formElements} = this.state;
    const {job, isModal, saveCallback} = this.props;
    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});
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
          }.bind(this)
        });
      } else {
        this.setState({formError: 'Please fill out all fields.'});
      }
    });
  },

  createBid() {
    const {formElements} = this.state;
    const {current_user, project, isModal, saveCallback} = this.props;
    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});
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
          }.bind(this)
        });
      } else {
        this.setState({formError: 'Please fill out all fields.'});
      }
    });
  },

  render() {
    const {job, project, current_user} = this.props;
    const {formElements, newBid, wantsCash, wantsEquity, formError} = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    const headerText = newBid ? (
      <div>
        <h3 className="brand-bold">Place your bid to work on:</h3>
        <h3 className="brand-bold text-brand">{project.title}</h3>
        <h4 className="brand">What type of bid do you want to submit?</h4>
      </div>
    ) : (
      <div>
        <h3 className="brand-bold">Adjust your bid for:</h3>
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
        <div className={"form-group " + formElements.cash.errorClass}>
          <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}</label>&nbsp;
          <div className="input-group">
            <span className="input-group-addon">$</span>
            <input
              className="form-control"
              type='number'
              name={formElements.cash.name}
              id={formElements.cash.name}
              placeholder={formElements.cash.placeholder}
              value={formElements.cash.value}
              onChange={this.handleChange}
            />
            <span className="input-group-addon">.00</span>
          </div>
        </div>
      );

    const equityInput = wantsEquity && (
        <div className={"form-group " + formElements.equity.errorClass}>
          <label className="control-label" htmlFor={formElements.equity.name}>{formElements.equity.label}</label>&nbsp;
          <div className="input-group">
            <input
              className="form-control"
              type='number'
              name={formElements.equity.name}
              id={formElements.equity.name}
              placeholder={formElements.equity.placeholder}
              value={formElements.equity.value}
              onChange={this.handleChange}
            />
            <span className="input-group-addon">%</span>
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

    return (
      <div className="bid-form text-center messages-tracker-content">
        <div className="messages-tracker-popup-content">

          {headerText}

          <div className={"form-group " + formElements.compensationType.errorClass}>
            {compensationTypeSelector}
          </div>
          {cashInput}
          { wantsCash && wantsEquity && <h4 className="bid-and">+</h4> }
          {equityInput}

          <div className={"form-group " + formElements.hours.errorClass}>
            <label className="control-label" htmlFor={formElements.hours.name}>{formElements.hours.label}</label>&nbsp;
            <div className="input-group">
              <input
                className="form-control"
                type='number'
                name={formElements.hours.name}
                id={formElements.hours.name}
                placeholder={formElements.hours.placeholder}
                value={formElements.hours.value}
                onChange={this.handleChange}
              />
              <span className="input-group-addon">hours</span>
            </div>
          </div>

        <input type="hidden" name="contractor" value={current_user} />
        <input type="hidden" name="project" value={project.id} />

          <div className="message-container">
            {messageInput}
          </div>

        {error}
        <button onClick={newBid && !job.id ? this.createBid : this.saveBid} disabled={ this.state.isLoading ? 'true': ''} className="btn btn-brand">
          <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
           Submit Bid
        </button>
        <p className="small text-muted">By clicking submit you agree to Loom's <a href="/terms-of-service/" target="_blank">Terms and Conditions</a></p>
      </div>
    )
  }
});

export default Bid;
