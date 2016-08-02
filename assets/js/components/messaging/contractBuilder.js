import React from 'react';
import _ from 'lodash';
import FormHelpers from '../../utils/formHelpers';

let ContractBuilder = React.createClass({

  getInitialState() {
    return {
      isLoading: false,
      formError: false,
      step: 0
    };
  },

  componentWillMount() {
    this.setState({ formElements: this.formElements() });
  },

  componentDidMount() {

  },

  formElements() {
    const { terms } = this.props;

    return {
      project: {
        name: 'project',
        label: 'Project Name',
        value: terms.project || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { terms } = this.props;
          terms.project = value;
          this.setState({ project });
        }
      },
      contractee: {
        name: 'contractee',
        label: 'Company Name',
        value: terms.contractee || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { terms } = this.props;
          terms.contractee = value;
          this.setState({ project });
        }
      },
      contractor: {
        name: 'contractor',
        label: 'Contractor Name',
        value: terms.contractor || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { terms } = this.props;
          terms.contractor = value;
          this.setState({ project });
        }
      },
      start_date: {
        name: 'start_date',
        label: 'Start Date',
        value: terms.start_date || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { terms } = this.props;
          terms.start_date = value;
          this.setState({ project });
        }
      },
      end_date: {
        name: 'end_date',
        label: 'End Date',
        value: terms.end_date || '',
        validator: FormHelpers.checks.isRequired,
        update: (value) => {
          const { terms } = this.props;
          terms.end_date = value;
          this.setState({ project });
        }
      },
      scope: {
        name: 'scope',
        label: 'Scope of Work',
        value: terms.scope || '',
        update: (value) => {
          const { terms } = this.props;
          terms.scope = value;
          this.setState({ project });
        }
      },
      deliverables: {
        name: 'deliverables',
        label: 'Deliverables and Specs',
        value: terms.deliverables || '',
        update: (value) => {
          const { terms } = this.props;
          terms.deliverables = value;
          this.setState({ project });
        }
      },
      milestones: {
        name: 'milestones',
        label: 'Project Milestones',
        value: terms.deliverables || '',
        update: (value) => {
          const { terms } = this.props;
          terms.milestones = value;
          this.setState({ project });
        }
      },
      compensation_type: {
        name: 'compensation_type',
        label: 'Compensation Type',
        value: terms.compensation_type || '',
        update: (value) => {
          const { terms } = this.props;
          terms.compensation_type = value;
          this.setState({ project });
        }
      },
      equity: {
        name: 'equity',
        label: 'Equity',
        value: terms.equity || '',
        update: (value) => {
          const { terms } = this.props;
          terms.equity = value;
          this.setState({ project });
        }
      },
      cash: {
        name: 'cash',
        label: 'Cash',
        value: terms.cash || '',
        update: (value) => {
          const { terms } = this.props;
          terms.cash = value;
          this.setState({ project });
        }
      },
      schedule: {
        name: 'schedule',
        label: 'How do you want to schedule payment?',
        value: terms.schedule || '',
        update: (value) => {
          const { terms } = this.props;
          terms.schedule = value;
          this.setState({ project });
        }
      },
      halfway: {
        name: 'halfway',
        label: 'Define the halfway milestone',
        value: terms.halfway || '',
        update: (value) => {
          const { terms } = this.props;
          terms.halfway = value;
          this.setState({ project });
        }
      }
    }
  },

  _saveContract() {
    const { formElements } = this.state;

    FormHelpers.validateForm(formElements, (valid, formElements) => {
      this.setState({formElements});

      if (valid) {
        this.setState({ formError: false, isLoading: true });
        $.ajax({
          url: loom_api.terms + this.props.terms.id + '/',
          method: 'PATCH',
          data: JSON.stringify(this.props.terms),
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

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  render() {
    const { formElements, formError } = this.state;
    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    return (
      <div>
        <div>
          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.project.name}>{formElements.project.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.project.name}
              id={formElements.project.name}
              value={formElements.project.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.contractee.name}>{formElements.contractee.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.contractee.name}
              id={formElements.contractee.name}
              value={formElements.contractee.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.contractor.name}>{formElements.contractor.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.contractor.name}
              id={formElements.contractor.name}
              value={formElements.contractor.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label className="control-label" htmlFor={formElements.start_date.name}>{formElements.start_date.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.start_date.name}
              id={formElements.start_date.name}
              placeholder={formElements.start_date.placeholder}
              value={formElements.start_date.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label className="control-label" htmlFor={formElements.end_date.name}>{formElements.end_date.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.end_date.name}
              id={formElements.end_date.name}
              value={formElements.end_date.value}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div>
          <div className='form-group col-md-12'>
            <label className="control-label" htmlFor={formElements.scope.name}>{formElements.scope.label}</label>
            <textarea
              className="form-control"
              name={formElements.scope.name}
              id={formElements.scope.name}
              value={formElements.scope.value}
              onChange={this.handleChange}
            >
            </textarea>
          </div>

          <div className='form-group col-md-12'>
            <label className="control-label" htmlFor={formElements.deliverables.name}>{formElements.deliverables.label}</label>
            <textarea
              className="form-control"
              name={formElements.deliverables.name}
              id={formElements.deliverables.name}
              value={formElements.deliverables.value}
              onChange={this.handleChange}
            >
            </textarea>
          </div>

          <div className='form-group col-md-12'>
            <label className="control-label" htmlFor={formElements.milestones.name}>{formElements.milestones.label}</label>
            <textarea
              className="form-control"
              name={formElements.milestones.name}
              id={formElements.milestones.name}
              placeholder={formElements.milestones.placeholder}
              value={formElements.milestones.value}
              onChange={this.handleChange}
            >
            </textarea>
          </div>
        </div>

        <div>
          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.compensation_type.name}>{formElements.compensation_type.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.compensation_type.name}
              id={formElements.compensation_type.name}
              value={formElements.compensation_type.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.cash.name}
              id={formElements.cash.name}
              value={formElements.cash.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label className="control-label" htmlFor={formElements.equity.name}>{formElements.equity.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.equity.name}
              id={formElements.equity.name}
              value={formElements.equity.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.schedule.name}>{formElements.schedule.label}</label>
            <select>

            </select>

            <input
              className="form-control"
              type='text'
              name={formElements.schedule.name}
              id={formElements.schedule.name}
              value={formElements.schedule.value}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.halfway.name}>{formElements.halfway.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.halfway.name}
              id={formElements.halfway.name}
              value={formElements.halfway.value}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className={this.state.step}>
          <a className={this.state.step ? 'pull-left' : 'hidden'} onClick={this.previousStep} ><i className='fa fa-arrow-left'></i> Back</a>
          <a className='pull-right' onClick={this.nextStep} ><i className='fa fa-arrow-left'></i> Back</a>
        </div>
        <div className='text-center form-group col-md-12'>
            {error}
            <button type='submit' className='btn btn-step' onClick={this._saveContract}>Send Preview</button>
        </div>

        <div className='clearfix'></div>
      </div>
    );
  }

});

export default ContractBuilder;

