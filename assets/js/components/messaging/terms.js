import React from 'react';
import _ from 'lodash';
import FormHelpers from '../../utils/formHelpers';
import DatePicker from 'react-datepicker';
import moment from 'moment';

const Terms = React.createClass({

  getInitialState() {
    return {
      isLoading: false,
      step: 1
    };
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

  handleAgreeTerms() {
    const {agreeTerms} = this.props;
    this.setState({isLoading: true});
    agreeTerms();
  },

  render() {
    const {formElements} = this.props;
    const {step, isLoading} = this.state;
    const startDateMoment = formElements.start_date.value && {selected: moment(formElements.start_date.value)};
    const endDateMoment = formElements.end_date.value && {selected: moment(formElements.end_date.value)};

    return (
      <div className="messages-tracker-content">
        <div className="messages-tracker-popup-content">
          <div className="steps pull-right">
            <strong>{step} of 2</strong>
          </div>
          <div className={step == 1 ? 'sub-section' : 'hidden'}>
            <div className="col-sm-10">
              <div className="form-group">
                <strong>
                  These are the terms that will appear in the final contract, please review thoroughly
                  and let the project manager know if there are any changes needed.
                </strong>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="control-label"
                         htmlFor={formElements.project.name}>{formElements.project.label}</label>
                  <input
                    disabled
                    className="form-control"
                    type='text'
                    name={formElements.project.name}
                    id={formElements.project.name}
                    value={formElements.project.value}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className={ 'form-group ' + formElements.contractee.errorClass }>
                  <label className="control-label"
                         htmlFor={formElements.contractee.name}>{formElements.contractee.label}</label>
                  <input
                    className="form-control"
                    type='text'
                    name={formElements.contractee.name}
                    id={formElements.contractee.name}
                    value={formElements.contractee.value}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className={ 'form-group ' + formElements.contractor.errorClass }>
                  <label className="control-label"
                         htmlFor={formElements.contractor.name}>{formElements.contractor.label}</label>
                  <input
                    className="form-control"
                    type='text'
                    name={formElements.contractor.name}
                    id={formElements.contractor.name}
                    value={formElements.contractor.value}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={'form-group ' + formElements.start_date.errorClass}>
                  <label className="control-label">{ formElements.start_date.label }</label>
                  <div className="input-group">
                    <DatePicker
                      name="start_date"
                      {...startDateMoment}
                      readOnly
                      className="form-control"/>
                    <span className="input-group-addon"><i className="fa fa-calendar"></i></span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className={'form-group ' + formElements.end_date.errorClass}>
                  <label className="control-label">{ formElements.end_date.label }</label>
                  <div className="input-group">
                    <DatePicker
                      name="end_date"
                      {...endDateMoment}
                      readOnly
                      className="form-control"/>
                    <span className="input-group-addon"><i className="fa fa-calendar"></i></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="control-label">{ formElements.hours.label }*</label>
                  <input className="form-control" type="text" value={formElements.hours.value} readOnly/>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className='form-group '>
                  <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}*</label>
                  <div className="input-group">
                    <span className="input-group-addon">$</span>
                    <input
                      className="form-control"
                      type='text'
                      name={formElements.cash.name}
                      id={formElements.cash.name}
                      value={formElements.cash.value}
                      readOnly
                    />
                    <span className="input-group-addon">USD</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="control-label"
                         htmlFor={formElements.equity.name}>{formElements.equity.label}*</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type='text'
                      name={formElements.equity.name}
                      id={formElements.equity.name}
                      value={formElements.equity.value}
                      readOnly
                    />
                    <span className="input-group-addon">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group small text-muted">
                *You control the project hours and compensation on the project. If this needs to change, let the project
                manager
                know and adjust your bid.
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label className="control-label"
                       htmlFor={formElements.schedule.name}>{formElements.schedule.label}</label>
                <div><strong>{formElements.schedule.value}</strong></div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label className="control-label"
                       htmlFor={formElements.halfway.name}>{formElements.halfway.label}</label>
                <p className="text-muted small">
                  This is the 50% milestone that your compensation schedule is dependent on.
                </p>
                <input
                  className="form-control"
                  type='text'
                  name={formElements.halfway.name}
                  id={formElements.halfway.name}
                  value={formElements.halfway.value}
                  readOnly
                />
              </div>
            </div>

          </div>

          <div className={this.state.step == 2 ? 'sub-section' : 'hidden'}>
            <div className='col-md-12'>
              <div className="form-group">
                <label className="control-label" htmlFor={formElements.scope.name}>{formElements.scope.label}</label>
                <p className="text-muted small">
                  This section outlines the services you are expected to perform.
                </p>
                <textarea
                  className="form-control"
                  name={formElements.scope.name}
                  id={formElements.scope.name}
                  value={formElements.scope.value}
                  readOnly
                >
              </textarea>
              </div>
            </div>

            <div className='col-md-12'>
              <div className="form-group">
                <label className="control-label"
                       htmlFor={formElements.deliverables.name}>{formElements.deliverables.label}</label>
                <p className="text-muted small">
                  This is a list of your expected deliverables.
                </p>
                <textarea
                  className="form-control"
                  name={formElements.deliverables.name}
                  id={formElements.deliverables.name}
                  value={formElements.deliverables.value}
                  readOnly
                >
              </textarea>
              </div>
            </div>

            <div className='col-md-12'>
              <div className="form-group">
                <label className="control-label"
                       htmlFor={formElements.milestones.name}>{formElements.milestones.label}</label>
                <p className="text-muted small">
                  These are the project milestones with reviews and delivery dates.
                </p>
                <textarea
                  className="form-control"
                  name={formElements.milestones.name}
                  id={formElements.milestones.name}
                  placeholder={formElements.milestones.placeholder}
                  value={formElements.milestones.value}
                  readOnly
                >
              </textarea>
              </div>
            </div>
          </div>

          <div className="col-md-12 agreement-panel-footer">
            <div className="form-group">
              <a onClick={this.previousStep} className={step > 1 ? '' : 'visible-hidden'}><i
                className='fa fa-arrow-left'></i> Back</a>
              <div className={step == 2 ? '' : 'visible-hidden'}>
                <button type='submit' className='btn btn-brand' onClick={this.handleAgreeTerms}>
                  <i className={ isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
                  Agree to Terms
                </button>
              </div>
              <a onClick={this.nextStep} className={step == 2 ? 'visible-hidden' : ''}>Next <i
                className='fa fa-arrow-right'></i></a>
            </div>
          </div>
          <div className='clearfix'></div>
        </div>
      </div>
    );
  }

});

export default Terms;

