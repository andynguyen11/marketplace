import React from 'react';
import _ from 'lodash';
import FormHelpers from '../../utils/formHelpers';
import DatePicker from 'react-datepicker';
import moment from 'moment';

const ContractBuilder = React.createClass({

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

  render() {
    const { formElements, formError, formErrorsList, handleChange, terms, saveTerms } = this.props;
    const { step } = this.state;
    const startDateMoment = formElements.start_date.value && {selected: moment(formElements.start_date.value)};
    const endDateMoment = formElements.end_date.value && {selected: moment(formElements.end_date.value)};
    const endDateLimits = startDateMoment ? {
      startDate: formElements.start_date.value && moment(formElements.start_date.value).add(1, 'day'),
      minDate: formElements.start_date.value && moment(formElements.start_date.value).add(1, 'day')
    } : {
      disabled: true
    };

    const error = formError && function() {
      let errorsList = formErrorsList.map((thisError, i) => {
        return <span key={i}>{thisError}<br/></span>;
      });

      if(!formErrorsList.length){
        errorsList = formError;
      }

      return <div className="alert alert-danger text-left" role="alert">{errorsList}</div>;
    }();

    const scheduleOptions = formElements.schedule.options.map((option, i) => {
      return (
        <div className="radio" key={i}>
          <label>
              <input
                type="radio"
                name={formElements.schedule.name}
                checked={formElements.schedule.value == option ? 'checked' : ''}
                onChange={handleChange}
                value={option}
              />
              {option}
          </label>
        </div>
        )
    });

    return (
      <div className="messages-tracker-content">
        <div className="messages-tracker-popup-content">
          <div className="steps pull-right">
            <strong>{step} of 3</strong>
          </div>
          <div className={this.state.step == 1 ? 'sub-section' : 'hidden'} >
            <div className="col-sm-10">
              <div className="form-group">
                <strong>Creating your contract with Loom is easy.</strong>
                <br />
                <br />
                <strong>We proactively filled in a lot of information for you from your project page.  Make edits as needed and fill in any fields that are empty.</strong>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="control-label" htmlFor={formElements.project.name}>{formElements.project.label}</label>
                  <div className="input-group">
                    <input
                      disabled
                      className="form-control"
                      type='text'
                      name={formElements.project.name}
                      id={formElements.project.name}
                      value={formElements.project.value}
                    />
                    <div className="input-group-addon"><i className='fa fa-lock'></i></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className={ 'form-group ' + formElements.contractee.errorClass }>
                  <label className="control-label" htmlFor={formElements.contractee.name}>{formElements.contractee.label}</label>
                  <div className="input-group">
                    <input
                      disabled
                      className="form-control"
                      type='text'
                      name={formElements.contractee.name}
                      id={formElements.contractee.name}
                      value={formElements.contractee.value}
                      onChange={handleChange}
                    />
                    <div className="input-group-addon"><i className='fa fa-lock'></i></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className={ 'form-group ' + formElements.contractor.errorClass }>
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
                      minDate={moment()}
                      onChange={this.props.convertFromMomentToStartDate}
                      className="form-control"/>
                    <div className="input-group-addon"><i className='fa fa-calendar'></i></div>
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
                      {...endDateLimits}
                      onChange={this.props.convertFromMomentToEndDate}
                      className="form-control"/>
                    <div className="input-group-addon"><i className='fa fa-calendar'></i></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="control-label">{ formElements.hours.label }</label>
                  <div className="input-group">
                    <input className="form-control" type="text" value={formElements.hours.value} disabled />
                    <div className="input-group-addon"><i className='fa fa-lock'></i></div>
                  </div>
                  <p className="small text-muted">
                    Need to adjust the total hours on the project?  Your developer will need to adjust their bid
                    with the correct hours.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className={this.state.step == 2 ? 'sub-section' : 'hidden'}>
            <div className='col-md-12'>
              <div className={ 'form-group ' + formElements.scope.errorClass }>
                <label className="control-label" htmlFor={formElements.scope.name}>{formElements.scope.label}</label>
                <p className="text-muted small">
                  This section should outline the services you expect the developer to perform.  Be sure to be specific.
                </p>
                <textarea
                  className="form-control"
                  name={formElements.scope.name}
                  id={formElements.scope.name}
                  value={formElements.scope.value}
                  onChange={handleChange}
                >
                </textarea>
              </div>
            </div>

            <div className='col-md-12'>
              <div className={ 'form-group ' + formElements.deliverables.errorClass }>
                <label className="control-label" htmlFor={formElements.deliverables.name}>{formElements.deliverables.label}</label>
                <p className="text-muted small">
                  This is where you should list your expected deliverables, along with any specifics about each deliverable (i.e.
                  file formats, code languages, delivery instructions, etc).  Be as detailes as possible to ensure you and the
                  developer are on the same page.
                </p>
                <textarea
                  className="form-control"
                  name={formElements.deliverables.name}
                  id={formElements.deliverables.name}
                  value={formElements.deliverables.value}
                  onChange={handleChange}
                >
                </textarea>
              </div>
            </div>

            <div className='col-md-12'>
              <div className={ 'form-group ' + formElements.milestones.errorClass }>
                <label className="control-label" htmlFor={formElements.milestones.name}>{formElements.milestones.label}</label>
                <p className="text-muted small">
                  List all project milestones here, such as reviews and delivery dates.  Be sure to include the dates next to
                  each milestone.
                </p>
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
          </div>

          <div className={this.state.step == 3 ? 'sub-section' : 'hidden'}>

            { formElements.cash.value && <div className="row">
              <div className="col-md-5">
                <div className='form-group '>
                  <label className="control-label" htmlFor={formElements.cash.name}>{formElements.cash.label}</label>
                  <div className="input-group">
                    <span className="input-group-addon">$</span>
                    <input
                      className="form-control"
                      type='text'
                      name={formElements.cash.name}
                      id={formElements.cash.name}
                      value={formElements.cash.value}
                      disabled
                    />
                    <span className="input-group-addon">USD</span>
                  </div>
                </div>
              </div>
            </div> }

            { formElements.equity.value && <div className="row">
              <div className="col-md-5">
                <div className="form-group">
                  <label className="control-label" htmlFor={formElements.equity.name}>{formElements.equity.label}</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type='text'
                      name={formElements.equity.name}
                      id={formElements.equity.name}
                      value={formElements.equity.value}
                      disabled
                    />
                    <span className="input-group-addon">%</span>
                  </div>
                </div>
              </div>
            </div> }

            <div className="col-md-12">
              <div className="form-group">
                <label className="control-label" htmlFor={formElements.schedule.name}>{formElements.schedule.label}</label>
                {scheduleOptions}
              </div>
            </div>

            <div className="col-md-12">
              <div className={ 'form-group ' + formElements.halfway.errorClass }>
                <label className="control-label" htmlFor={formElements.halfway.name}>{formElements.halfway.label}</label>
                <p className="text-muted small">
                  This should match one of your milestones on the previous page.
                </p>
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
          </div>
          <div className="col-md-12 agreement-panel-footer">
            <div className="form-group">
              <a onClick={this.previousStep} className={this.state.step > 1 ? '' : 'visible-hidden'} ><i className='fa fa-arrow-left'></i> Back</a>
              <div className={this.state.step == 3 ? '' : 'visible-hidden'}>
                  {error}
                  <button type='submit' className='btn btn-brand' onClick={saveTerms}>Send Preview of Terms</button>
              </div>
              <a onClick={this.nextStep} className={this.state.step == 3 ? 'visible-hidden' : ''} >Next <i className='fa fa-arrow-right'></i></a>
            </div>
          </div>
          <div className='clearfix'></div>
        </div>
      </div>
    );
  }

});

export default ContractBuilder;

