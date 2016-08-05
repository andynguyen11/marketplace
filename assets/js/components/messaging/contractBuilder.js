import React from 'react';
import _ from 'lodash';
import FormHelpers from '../../utils/formHelpers';

const ContractBuilder = React.createClass({

  getInitialState() {
    return {
      isLoading: false,
      formError: false,
      step: 1
    };
  },

  componentDidMount() {

  },

  nextStep() {
    this.setState({
      step: this.state.step + 1
    });
  },

  previousStep() {
    this.setState({
      step: this.state.step - 1
    });
  },

  render() {
    const { formElements, formError, handleChange, terms, saveTerms } = this.props;

    const error = formError && <div className="alert alert-danger" role="alert">{formError}</div>;

    return (
      <div>
        <div className={this.state.step == 1 ? '' : 'hidden'} >
          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.project.name}>{formElements.project.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.project.name}
              id={formElements.project.name}
              value={formElements.project.value}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={this.state.step == 2 ? '' : 'hidden'}>
          <div className='form-group col-md-12'>
            <label className="control-label" htmlFor={formElements.scope.name}>{formElements.scope.label}</label>
            <textarea
              className="form-control"
              name={formElements.scope.name}
              id={formElements.scope.name}
              value={formElements.scope.value}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
            >
            </textarea>
          </div>
        </div>

        <div className={this.state.step == 3 ? '' : 'hidden'}>
          <div className="form-group col-md-12">
            <label className="control-label" htmlFor={formElements.compensation_type.name}>{formElements.compensation_type.label}</label>
            <input className="form-control" type="radio" name="compensation_type" value="1" /> Cash
            <input className="form-control" type="radio" name="compensation_type" value="2" /> Equity
            <input className="form-control" type="radio" name="compensation_type" value="3" /> Cash + Equity
          </div>

          <div className="form-group col-md-6">
            <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}</label>
            <input
              className="form-control"
              type='text'
              name={formElements.cash.name}
              id={formElements.cash.name}
              value={formElements.cash.value}
              readOnly
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
              readOnly
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
              onChange={handleChange}
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
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group col-md-12">
          <a onClick={this.previousStep} className={this.state.step > 1 ? 'pull-left' : 'hidden'} ><i className='fa fa-arrow-left'></i> Back</a>
          <a onClick={this.nextStep} className={this.state.step == 3 ? 'hidden' : 'pull-right'} >Next <i className='fa fa-arrow-right'></i></a>
          <div className={this.state.step == 3 ? 'text-center' : 'hidden'}>
              {error}
              <button type='submit' className='btn btn-step' onClick={saveTerms}>Send Preview</button>
          </div>
        </div>
        <div className='clearfix'></div>
      </div>
    );
  }

});

export default ContractBuilder;

