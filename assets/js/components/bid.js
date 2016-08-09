import _ from  'lodash';
import React from 'react';
import FormHelpers from '../utils/formHelpers';

const Bid = React.createClass({
  getInitialState() {
    return {
      wantsCash: false,
      wantsEquity: false
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  formElements() {
    const { job } = this.props;

    // TODO Bad Andy. Passing props into state.
    return {
      compensationType: {
        name: 'compensationType',
        value: job.compensationType || '',
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
        validator: (value) => {
          const { job } = this.props;
          return job.compensationType ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { job, updateJob } = this.props;
          let { wantsCash, wantsEquity } = this.state;
          job.compensationType = value;
          wantsCash = (value == 'cash') || (value == 'mix');
          wantsEquity = (value == 'equity') || (value == 'mix');
          job.cash = wantsCash ? job.cash : 0;
          job.equity = wantsEquity ? job.equity : 0;
          this.setState({ wantsCash, wantsEquity });
          updateJob(job);
        }
      },
      cash: {
        name: 'cash',
        label: 'Cash Offer',
        value: job.cash || '',
        placeholder: '$0,000.00',
        validator: (value) => {
          const { wantsCash } = this.state;
          return wantsCash ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { job, updateJob } = this.props;
          job.cash = value;
          job.equity = job.compensationType == 'mix' ? job.equity : 0;
          updateJob(job);
        }
      },
      equity: {
        name: 'equity',
        label: 'Equity Offer',
        value: job.equity || '',
        validator: (value) => {
          const { wantsEquity } = this.state;
          return wantsEquity ? FormHelpers.checks.isRequired(value) : true;
        },
        update: (value) => {
          const { job, updateJob } = this.props;
          job.equity = value;
          job.cash = job.compensationType == 'mix' ? job.cash : 0;
          updateJob(job);
        }
      },
      hours: {
        name: 'hours',
        label: 'Time Estimate',
        value: job.hours || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { job, updateJob } = this.props;
          job.hours = value;
          updateJob(job);
        }
      },
      message: {
        name: 'message',
        placeholder: 'Include a message with your job to increase your chances of winning the job.',
        value: job.message || '',
        update: (value) => {
          const { job, updateJob } = this.props;
          job.message = value;
          updateJob(job);
        }
      }
    }
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  saveBid() {
    const { formElements } = this.state;
    const { job } = this.props;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});
      if (valid) {
        this.setState({ formError: false, isLoading: true });
        $.ajax({
          url: loom_api.job + job.id + '/',
          method: 'PATCH',
          data: JSON.stringify(job),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (result) {

          }.bind(this)
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.' });
      }
    });
  },

  createBid() {
    const { formElements } = this.state;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});
      if (valid) {
        this.setState({ formError: false, isLoading: true });
        let new_job = _.reduce(formElements, function(result, value, key) {
          result[key] = value['value'];
          return result;
        }, {});
        $.ajax({
          url: loom_api.job,
          method: 'POST',
          data: JSON.stringify(new_job),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (result) {

          }.bind(this)
        });
      } else {
        this.setState({ formError: 'Please fill out all fields.' });
      }
    });
  },

  render() {
    const { job, project, bid_sent, current_user } = this.props;
    const { formElements, wantsCash, wantsEquity, formError } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;


    const compensationTypeSelector = formElements.compensationType.options.map((option, i) => {
      return (
        <div className="radio" key={i}>
            <label>
                <input type="radio" name={formElements.compensationType.name} id={option.value} onChange={this.handleChange} value={option.value}/>
                {option.label}
            </label>
        </div>
      );
    });

    const cashInput = wantsCash && (
      <div>
        <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.cash.name}
            id={formElements.cash.name}
            placeholder={formElements.cash.placeholder}
            value={formElements.cash.value}
            onChange={this.handleChange}
          />
      </div>
    );

    const equityInput = wantsEquity && (
      <div>
        <label className="control-label" htmlFor={formElements.equity.name}>{formElements.equity.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.equity.name}
            id={formElements.equity.name}
            placeholder={formElements.equity.placeholder}
            value={formElements.equity.value}
            onChange={this.handleChange}
          />
      </div>
    );


    const messageInput = bid_sent || (
      <div>
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

    return(
      <div className="text-center">
        <h4 className="text-skinny">Place your bid to work on:</h4>
        <h4 className="text-brand">{project.title}</h4>

        <h4 className="text-skinny">What type of bid do you want to submit?</h4>
        <div className='form-group'>
          {compensationTypeSelector}
        </div>
        {cashInput}
        { wantsCash && wantsEquity && <h4>+</h4> }
        {equityInput}

        <div>
        <label className="control-label" htmlFor={formElements.hours.name}>{formElements.hours.label}</label>
          <input
            className="form-control"
            type='text'
            name={formElements.hours.name}
            id={formElements.hours.name}
            placeholder={formElements.hours.placeholder}
            value={formElements.hours.value}
            onChange={this.handleChange}
          />
      </div>

        <input type="hidden" name="contractor" value={current_user.id} />
          <input type="hidden" name="project" value={project.id} />

        {messageInput}

        {error}
        <button onClick={bid_sent ? this.saveBid : this.createBid} className="btn btn-brand">Save Bid</button>

      </div>
    )
  }
});

export default Bid;
