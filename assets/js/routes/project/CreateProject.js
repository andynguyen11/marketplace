import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { BigFormGroup } from './FormUtils';
import { SkillWidget } from '../../components/skill';
import { objectToFormData } from './utils';
import AttachmentField, { mergeAttachments } from './AttachmentField';
import ProjectInfoField from './ProjectInfoField';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Loader from '../../components/loadScreen';

var typeOptions = [
  { id: '', label: 'Please choose one' },
  { id: 'art', label: 'art & design' },
  { id: 'technology', label: 'technology' },
  { id: 'gaming', label: 'gaming' },
  { id: 'nonprofit', label: 'non-profit' },
  { id: 'social', label: 'social' },
  { id: 'news', label: 'news & publishing' },
  { id: 'music', label: 'music & media' },
  { id: 'location', label: 'location-based' },
  { id: 'health', label: 'health & fitness' },
];

const TypeSelect = React.createClass({
  render(){
    let {data, value, ...props} = this.props;
    return (
      <select value={value || this.props.data[0].id} {...props}>
        {data.map(({id, label}) => (<option key={id} value={id}>{label}</option>))}
      </select>
    )
  }
});

function ProgressBar({flow, active, isEditing, onSelect}) {
  let activeIndex = flow.indexOf(active)
  let hasValidIndex = key => (
    (activeIndex >= flow.indexOf(key)) || (activeIndex == flow.indexOf(key) - 1) || isEditing
  )

  let navItemProps = (eventKey) => ({
    eventKey,
    className: `${eventKey} info-pill ${(flow.indexOf(eventKey) === flow.indexOf(active) ? ' active' : '')} ${(flow.indexOf(eventKey) < flow.indexOf(active) ? ' done' : '')}`,
    disabled: !hasValidIndex(eventKey)
  })

  return (
    <div className="top-bar row">
      <div className="col-md-8 col-md-offset-2 ">
        <Nav bsStyle="pills" className="dq-progress-bar" activeKey={2} onSelect={onSelect}>
          <NavItem {...navItemProps('basics')}>Basics</NavItem>
          <NavItem {...navItemProps('details')}>Project Details</NavItem>
          <NavItem {...navItemProps('budget')}>Budget</NavItem>
        </Nav>
      </div>
    </div>
  )
}

function cursor({update, data, key, handler = event => ({event}), valueKey = 'value'}) {
  return {
    name: key,
    [valueKey]: data[key],
    onChange: event => update[key](handler(event))
  }
}

function Basics({update, data, formErrors, ...props}) {
  const {convertFromMomentToStartDate, convertFromMomentToEndDate} = props;
  const {start_date, end_date} = data;
  const startDateMoment = start_date && {selected: moment(start_date)};
  const endDateMoment = end_date && {selected: moment(end_date)};
  const endDateLimits = startDateMoment ? {
    startDate: start_date && moment(start_date).add(1, 'day'),
    minDate: start_date && moment(start_date).add(1, 'day')
  } : {
    disabled: true
  };

  return (
    <div className={props.className}>
      <div className="col-md-8 col-md-offset-2 details-header">
        <h3 className="brand text-center brand-bold">
          Let’s bring your digital project to life.
        </h3>
        <h4 className="text-muted text-skinny text-center">
          Posting projects is easy and free. Start here by adding the name and category of your project, a quick overview and some basic preferences.
        </h4>
      </div>
      <div className={'form-group col-md-8 col-md-offset-2 ' + formErrors.title}>
        <label className='control-label'>Project Name</label>
        <input className="form-control" type="text" value={data.title || ''} {...cursor({update, data, key: 'title'})}/>
      </div>

      <div className={'form-group col-md-8 col-md-offset-2 ' + formErrors.type}>
        <label className='control-label'>Project Category</label>
        <TypeSelect className="form-control select" data={typeOptions} {...cursor({update, data, key: 'type'})} />
      </div>

      <div className={'form-group col-md-8 col-md-offset-2 ' + formErrors.short_blurb}>
        <label className='control-label'>Project Overview</label>
        <textarea type="text" rows="3" className="form-control" {...cursor({update, data, key: 'short_blurb'})} maxLength="250"
                  placeholder="Think of this as your elevator pitch to developers. Get them excited in 250 characters or less."/>
      </div>

      <div className={'form-group col-md-4 col-md-offset-2 ' + formErrors.start_date}>
        <label className="control-label">Preferred Start Date</label>
        <DatePicker
          name="start_date"
          {...startDateMoment}
          minDate={moment()}
          onChange={convertFromMomentToStartDate}
          className="form-control"/>
      </div>

      <div className={'form-group col-md-4 ' + formErrors.end_date}>
        <label className="control-label">Preferred End Date</label>
        <DatePicker
          name="end_date"
          {...endDateMoment}
          {...endDateLimits}
          onChange={convertFromMomentToEndDate}
          className="form-control"/>
      </div>

      <BigFormGroup label="Preferred Technology Stack (Optional)">
        <p className="text-muted small">
          This helps developers determine if they're the right person for the job.
          If you don't have a preference, no sweat. You can leave this section blank.
        </p>
        <SkillWidget {...cursor({update, data, key: 'skills', handler: value => ({value}), valueKey: 'mySkills'})} />
      </BigFormGroup>
      <div className="clearfix"></div>
    </div>
  )
}

const Details = React.createClass({

  defaultInfo: {
    title: 'Info',
    description: undefined,
    attachments: [],
    type: 'public'
  },

  fieldUpdater(field, getValue = event=>event.target.value){
    return ({value, event}) => {
      value = value || event.target.value
      let data = Object.assign(this.props.data.details || {}, {[field]: value})
      this.props.update.details({value: data})
      if (event)
        event.preventDefault();
    }
  },

  attachmentUpdater(newAttachments){
    let updater = this.fieldUpdater('attachments')
    let {details: {attachments = []} = {}} = this.props.data
    updater({value: mergeAttachments(attachments, newAttachments)})
  },

  infoUpdater(index){
    let updater = this.fieldUpdater('info')
    return ({value: newInfo}) => {
      let {info} = this.props.data
      info[index] = newInfo
      updater({value: info})
    }
  },

  render(){
    let {update, data: {details, info}, formErrors, ...props} = this.props
    let image = (details.attachments.filter(a => a.tag == 'image')[0] || {})

    return (
      <div className={props.className}>
        <div className="col-md-8 col-md-offset-2 details-header">
          <h3 className="brand text-center">
            Tell us more about what you want to create:
          </h3>
          <h4 className="text-muted text-skinny text-center">
            This is where you should outline all the project specifics.
            The more details you provide, the more quality bids you will recieve.
          </h4>
        </div>
        <BigFormGroup label="Project Image">
          <p className="text-muted small">
            This is the key image that will be associated with your project. It will appear in search
            and help your project stand out to developers.
          </p>
          <AttachmentField accept="image/*" tag="image"
                           value={image} onChange={this.attachmentUpdater}/>
        </BigFormGroup>
        <ProjectInfoField type="primary" id='details' data={details} update={update.details}
                          formErrors={formErrors.details} label="Public Details" placeholder="lol"/>
        <ProjectInfoField type="private" id="private" update={this.infoUpdater(0)} className="private"
                          label="Private Details"
                          placeholder="This private information tab is secure and can only be unlocked by a developer you approve, and only after they sign a non-disclosure agreement."/>
        <div className="clearfix"></div>
      </div>
    )
  }
});

function Budget({update, data, company, formErrors, ...props, updateBudgetType, budgetType, budgetMix}) {

  const budgetTypeChange = function (event) {
    const type = event.target.value;
    // This isn't ideal -- we'd be better off using Element.dataset, but IE10 doesn't support it :(
    const mix = !!event.target.getAttribute('data-mix');
    updateBudgetType && updateBudgetType(type, mix);
  };

  const headerPrefix = company && <span>Set your budget in equity, cash or a mix of both.</span>;
  const budgetSelector = company && (
      <div className={'form-group col-md-8 col-md-offset-2 budget-selector ' + formErrors.budgetType}>
        <label>Budget Types (Select one)</label>
        <div className="radios">
          <label className="radio-inline">
            <input type="radio" name="budgetTypes" id="cash" value="cash" selected={budgetType === 'cash'}
                   onChange={budgetTypeChange}/>
            Cash Only
          </label>
          <label className="radio-inline">
            <input type="radio" name="budgetTypes" id="cash-equity" value="cash-equity"
                   selected={budgetType === 'cash-equity' && budgetMix === true} data-mix={true}
                   onChange={budgetTypeChange}/>
            Cash + Equity Mix
          </label>
        </div>
        <div className="radios">
          <label className="radio-inline">
            <input type="radio" name="budgetTypes" id="equity" value="equity" selected={budgetType === 'equity'}
                   onChange={budgetTypeChange}/>
            Equity Only
          </label>
          <label className="radio-inline">
            <input type="radio" name="budgetTypes" id="cash-equity" value="cash-equity"
                   selected={budgetType === 'cash-equity' && budgetMix !== true} onChange={budgetTypeChange}/>
            Cash or Equity
          </label>
        </div>
      </div>
    );

  const equity = company && (budgetType === 'equity' || budgetType === 'cash-equity') && (
      <div className={'form-group col-md-8 col-md-offset-2 ' + formErrors.estimated_equity_percentage}>
        <label>Equity</label>
        <div className="input-group">
          <input className="form-control" type="number" step="any" {...cursor({
            update,
            data,
            key: 'estimated_equity_percentage'
          })} value={data.estimated_equity_percentage} placeholder="Equity Offered"/>
          <div className="input-group-addon">%</div>
        </div>
      </div>
    );

  const cash = (budgetType === 'cash' || budgetType === 'cash-equity') && (
      <div className={'form-group col-md-8 col-md-offset-2 ' + formErrors.estimated_cash}>
        <label>Cash</label>
        <div className="input-group">
          <div className="input-group-addon">$</div>
          <input className="form-control" type="number" {...cursor({update, data, key: 'estimated_cash'})}
                 value={data.estimated_cash} placeholder="Estimated Cash"/>
          <div className="input-group-addon">.00</div>
        </div>
      </div>
    );

  return (
    <div className={props.className}>
      <div className="col-md-8 col-md-offset-2 details-header">
        <h3 className="brand text-center">What's your budget?</h3>
        <h4 className="text-muted text-skinny text-center">
          {headerPrefix}
          This is just a starting point for bidding. You'll confirm compensation once you accept a bid you like.<br/><br/>
          <span>Note: The "Cash or Equity" option allows you to set your budget for cash and equity, but signals to the developer that you’ll pay in either cash or equity, not both.</span>
        </h4>
      </div>

      {budgetSelector}

      {cash}

      {equity}

      <div className="clearfix"></div>
    </div>
  )
}

const CreateProject = React.createClass({

  componentDidMount() {
    this.setState({
      budgetType: this.state.data.company ? 'cash-equity' : 'cash',
      isEditing: window.project && window.project.id || false,
      data: ['company', 'project_manager'].reduce((data, key) => ({
        [key]: $('#project-root').data(key),
        [`_${key}_name`]: $('#project-root').data(`_${key}_name`),
        ...data
      }), Object.assign({}, this.state.data || {}, window.project || {}))
    })
  },

  save(e){
    if (e) e.preventDefault();
    this.setState({ isLoading: true, apiError: false });
    let {id = undefined} = this.state.data;
    $.ajax({
      url: loom_api.project + (id !== undefined ? id + '/' : ''),
      method: (id !== undefined ? 'PUT' : 'POST'),
      data: objectToFormData(this.state.data),
      contentType: false,
      processData: false,
      success: result => {
        if(result.slug)
            window.location = `/project/${result.slug}/`;
      },
      error: (xhr, status, error) => {
        this.setState({ apiError: 'unknown error: ' + xhr.responseText, isLoading: false });
      }
    });
  },

  getInitialState(){
    return {
      is_loading: false,
      currentSection: 'basics',
      sections: ['basics', 'details', 'budget'],
      formErrors: {
        title: '',
        type: '',
        short_blurb: '',
        start_date: '',
        end_date: '',
        details: ''
      },
      formError: false,
      data: {
        skills: [],
        details: {
          title: 'Project Overview',
          description: undefined,
          attachments: [],
          type: 'primary' // private primary
        },
        info: [{
          title: 'Private Information',
          description: undefined,
          attachments: [],
          type: 'private'
        }],
        title: '',
        start_date: '',
        end_date: '',
        estimated_cash: '',
        estimated_equity_percentage: ''
      },
      budgetType: '',
      budgetMix: false,
      apiError: false
    }
  },

  // TODO this is a quick and dirty validator, switch to formElements
  validateBasics() {
    const short_blurb_error = this.state.data.short_blurb ? '' : 'has-error';
    const start_date_error = this.state.data.start_date ? '' : 'has-error';
    const end_date_error = this.state.data.end_date ? '' : 'has-error';
    const title_error = this.state.data.title ? '' : 'has-error';
    const type_error = this.state.data.type ? '' : 'has-error';
    const valid = !title_error && !type_error && !short_blurb_error && !start_date_error && !end_date_error;

    this.setState({
      formErrors: {
        short_blurb: short_blurb_error,
        start_date: start_date_error,
        end_date: end_date_error,
        title: title_error,
        type: type_error
      }
    });

    return valid;
  },

  // TODO this is a quick and dirty validator, switch to formElements
  validateDetails() {
    const details_error = this.state.data.details.description ? '' : 'has-error';
    const valid = !details_error;

    this.setState({
      formErrors: {
        details: details_error
      }
    });

    return valid;
  },

  // TODO this is a quick and dirty validator, switch to formElements
  validateBudget() {
    const {budgetType, data: {estimated_equity_percentage, estimated_cash}} = this.state;

    const budgetType_error = budgetType ? '' : 'has-error';
    const equity_error = function () {
      const error = 'has-error';

      if (budgetType === 'cash') {
        return false;
      } else {
        if (!!estimated_equity_percentage) {
          return false;
        }
      }

      return error;
    }();
    const cash_error = function () {
      const error = 'has-error';

      if (budgetType === 'equity') {
        return false;
      } else {
        if (!!estimated_cash) {
          return false;
        }
      }

      return error;
    }();

    const valid = !equity_error && !cash_error && !budgetType_error;

    this.setState({
      formErrors: {
        estimated_equity_percentage: equity_error,
        estimated_cash: cash_error,
        budgetType: budgetType_error
      }
    });

    return valid;
  },

  sectionIsValid(currentSection) {
    let valid = true;
    if (currentSection == 'basics') {
      valid = this.validateBasics();
    }
    if (currentSection == 'details') {
      valid = this.validateDetails();
    }
    if (currentSection == 'budget') {
      valid = this.validateBudget();
    }

    this.setState({formError: !valid});
    return valid;
  },

  sectionAction(event){
    $('html body').scrollTop(0);
    event.preventDefault();
    let {currentSection, sections} = this.state;
    if (this.sectionIsValid(currentSection)) {
      let index = sections.indexOf(currentSection)
      if (sections[index + 1] == 'preview') {
        this.setState({isEditing: true})
      }
      if (index >= sections.length - 1) {
        this.save()
      } else {
        this.selectSection(sections[index + 1])
      }
    }
  },

  selectSection(currentSection){
    if (this.sectionIsValid(this.state.currentSection)) {
      return this.setState({currentSection})
    }
  },

  fieldUpdater(field){
    return ({value, event}) => {
      value = value || event.target.value
      this.setState({data: Object.assign(this.state.data, {[field]: value})})
      if (event)
        event.preventDefault();
    }
  },

  fieldUpdateMap(...fields){
    return fields.reduce((actions, field) => {
      actions[field] = this.fieldUpdater(field)
      return actions
    }, {})
  },

  cursor(...fields){
    let data = fields.reduce((data, field) => ({...data, [field]: this.state.data[field]}), {})
    return {data, update: this.fieldUpdateMap(...fields)}
  },

  sectionProps({name, fields}){
    let {currentSection, formErrors} = this.state;
    return {
      className: currentSection == name ? name : 'hidden',
      formErrors,
      ...this.cursor(...fields)
    }
  },

  convertFromMomentToStartDate(moment) {
    const {data} = this.state;
    const newDate = moment.format('YYYY-MM-DD');

    data.start_date = newDate;

    this.setState({data})
  },

  convertFromMomentToEndDate(moment) {
    const {data} = this.state;
    const newDate = moment.format('YYYY-MM-DD');

    data.end_date = newDate;

    this.setState({data})
  },

  updateBudgetType(budgetType = '', budgetMix = false) {
    const {data} = this.state;
    data.mix = budgetMix;

    if (budgetType === 'cash') {
      data.estimated_equity_percentage = '';
    }

    if (budgetType === 'equity') {
      data.estimated_cash = '';
    }

    this.setState({
      budgetType,
      budgetMix,
      data
    });
  },

  render(){
    let {data: {details, info}, sections, currentSection, formErrors, formError, apiError, isLoading} = this.state;
    const error = formError &&
      <div className="alert alert-danger" role="alert">{ apiError || 'Please correct errors above.' }</div>;
    return (
      <div className={`sections ${currentSection} is active`}>
         { isLoading && <Loader /> }
        <ProgressBar flow={sections} active={currentSection} isEditing={this.state.isEditing} onSelect={this.selectSection}/>
        <form id="project-form" method="post" encType="multipart/form-data">

          { this.props.csrf_token }
          <Basics
            {...this.sectionProps({
              name: 'basics',
              fields: ['title', 'type', 'short_blurb', 'start_date', 'end_date', 'skills']
            })}
            convertFromMomentToStartDate={this.convertFromMomentToStartDate}
            convertFromMomentToEndDate={this.convertFromMomentToEndDate}
          />

          <Details
            {...this.sectionProps({name: 'details', fields: ['details', 'info']})}
          />

          <Budget
            {...this.sectionProps({
              name: 'budget',
              fields: ['estimated_cash', 'estimated_equity_percentage', 'confidential_info', 'budgetType', 'budgetMix']
            })}
            company={this.state.data.company}
            updateBudgetType={this.updateBudgetType}
            budgetType={this.state.budgetType}
            budgetMix={this.state.budgetMix}
          />

          <div className='text-center form-group col-md-8 col-md-offset-2'>
            {error}
            <a type='submit' className='btn btn-brand btn-brand--attn btn-create-project' onClick={this.sectionAction}>
              { (sections.indexOf(currentSection) < sections.length - 1) ? 'Save Project and Continue' : 'Post Project'}
            </a>
          </div>

        </form>
      </div>
    )
  }
});

import { createHashHistory } from 'history';
import { Router, Route, IndexRedirect, Link, useRouterHistory, withRouter } from 'react-router';
import classNames from 'classnames';
import momentPropTypes from 'react-moment-proptypes';
import Quill from '../../components/editor/Quill';
import FormHelpers from '../../utils/formHelpers';

const SkillsSelector = React.createClass({
  getInitialState() {
    return {
      allSkills: []
    }
  },

  getDefaultProps() {
    return {
      selectedSkills: []
    }
  },

  componentWillMount() {
    $.get(loom_api.skills, (allSkills) => {
      this.setState({ allSkills });
    });
  },

  toggleSkill(skillId) {
    const { toggleSkill, inputDisabled } = this.props;

    if(!inputDisabled) {
      toggleSkill(skillId);
    }
  },

  render(){
    const { allSkills } = this.state;
    const { selectedSkills, error, className, isDisabled } = this.props;
    const formGroupClass = classNames('skillSelector', 'form-group', className, { 'has-error': !!error});
    const skillsError = error && <InputError>{error}</InputError>;
    const skillsDisplay = allSkills.map((skill, i) => {
      const active = selectedSkills.indexOf(skill.id) >= 0 ? 'active' : '';
      const skillClass = classNames('btn', 'btn-skill', 'skillSelector-skill', { 'active': active });
      const toggleSkill = () => {
        this.toggleSkill(skill.id);
      };

      return (
        <div key={i} className={skillClass} onClick={toggleSkill}>
          {skill.name}
        </div>
      );
    });

    return (
      <div className={formGroupClass}>
        <label className="control-label">Do you know what type of developer you need?</label>
        <p className="text-muted small">This will help interested developers know what type of developer you're looking for at a glance.</p>
        <div className="skillSelector-skills form-control">
          {skillsDisplay}
        </div>
        {skillsError}
      </div>
    )
  }
});

const InputError = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired
  },

  render() {
    const { children } = this.props;

    return <div className="form-error"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> {children}</div>;
  }
});

const Button = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    onClick: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    isLoading: React.PropTypes.bool
  },

  render() {
    const { children, onClick, className, disabled, isLoading } = this.props;
    const buttonClass = classNames('btn', 'btn-brand', 'btn-brand--attn', className);
    const attrDisabled = !!disabled && { disabled: true };
    const loadingIcon = isLoading && <i className="fa fa-circle-o-notch fa-spin fa-fw"></i>;

    return (
      <button className={buttonClass} onClick={onClick} {...attrDisabled}>
        {children}
        {loadingIcon}
      </button>
    );
  }
});

const Input = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    prefix: React.PropTypes.string,
    suffix: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      placeholder: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      maxLength: React.PropTypes.number,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler() {
    const { config: { onChange } } = this.props;
    const input = this.refs.input;
    const value = input.value;

    onChange(value);
  },

  render() {
    const { className, prefix, suffix, inputDisabled, config: { name, label, value, error, placeholder, disabled, maxLength } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const inputError = error && <InputError>{error}</InputError>;
    const attrPlaceholder = !!placeholder && { placeholder };
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };
    const attrMaxLength = !!maxLength && { maxLength };
    const input = <input className="form-control" type="text" name={name} id={name} value={value} onChange={this.changeHandler} ref="input" {...attrPlaceholder} {...attrDisabled} {...attrMaxLength}/>;
    const inputGroup = !!prefix || !!suffix ? (
      <div className="input-group">
        { prefix && <div className="input-group-addon">{prefix}</div> }
        {input}
        { suffix && <div className="input-group-addon">{suffix}</div> }
      </div>
    ) : input;

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        {inputGroup}
        {inputError}
      </div>
    );
  }
});

const DateInput = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.oneOfType([
        React.PropTypes.string,
        momentPropTypes.momentObj
      ]),
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      placeholder: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      minDate: React.PropTypes.oneOfType([
        React.PropTypes.string,
        momentPropTypes.momentObj
      ]),
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler(momentObj) {
    const { config: { onChange } } = this.props;
    const value = momentObj.format('YYYY-MM-DD');

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, error, placeholder, disabled, minDate } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const dateError = error && <InputError>{error}</InputError>;
    const attrPlaceholder = !!placeholder && { placeholder };
    const attrMinDate = !!minDate && { minDate };
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };
    const selectedDate = value ? { selected: moment(value) } : '';

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <DatePicker className="form-control" name={name} id={name} onChange={this.changeHandler} ref="date" {...attrPlaceholder} {...attrMinDate} {...attrDisabled} {...selectedDate} autoComplete="off"/>
        {dateError}
      </div>
    );
  }
});

const Textarea = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      placeholder: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      maxLength: React.PropTypes.number,
      rows: React.PropTypes.number,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler() {
    const { config: { onChange } } = this.props;
    const textarea = this.refs.textarea;
    const value = textarea.value;

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, error, placeholder, disabled, maxLength, rows } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const textareaError = error && <InputError>{error}</InputError>;
    const attrPlaceholder = !!placeholder && { placeholder };
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };
    const attrMaxLength = !!maxLength && { maxLength };
    const attrRows = !!rows && { rows };

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <textarea className="form-control" name={name} id={name} value={value} onChange={this.changeHandler} ref="textarea" {...attrPlaceholder} {...attrDisabled} {...attrMaxLength} {...attrRows}></textarea>
        {textareaError}
      </div>
    );
  }
});

const WYSIWYG = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      helperText: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]),
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler(value, valueClean) {
    const { inputDisabled, config: { onChange } } = this.props;

    if(value === '<p><br></p>') {
      value = '';
    }

    if(!inputDisabled) {
      onChange(value);
    }
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, error, helperText } } = this.props;
    const formGroupClass = classNames('form-group', 'form-group-helper', className, { 'has-error': !!error, 'quill-disabled': inputDisabled });
    const textareaError = error && <InputError>{error}</InputError>;
    const quillConfig = {
      modules: {
        toolbar: {
          container: '#toolbar-long_description' + name,
        },
      },
      bounds: '#project-info-long_description' + name,
      theme: 'snow'
    };
    const helperBubble = !!helperText && (
      <div className="form-group-helper-text">
        <HelperBubble helperText={helperText} />
      </div>
    );

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <div className="form-group-helper-input">
          <Quill className="long_description" name={name} id={name} value={value} onChange={this.changeHandler} ref="textarea" config={quillConfig}/>
          {textareaError}
        </div>
        {helperBubble}
      </div>
    );
  }
});

const Select = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    inputDisabled: React.PropTypes.bool,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      options: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          id: React.PropTypes.string.isRequired,
          label: React.PropTypes.string.isRequired
        })
      ).isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      disabled: React.PropTypes.bool,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler() {
    const { config: { onChange } } = this.props;
    const select = this.refs.select;
    const value = select.value;

    onChange(value);
  },

  render() {
    const { className, inputDisabled, config: { name, label, value, options, error, disabled } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error});
    const selectError = error && <InputError>{error}</InputError>;
    const attrDisabled = (!!inputDisabled || !!disabled) && { disabled: true };

    const selectOptions = options && options.map((option, i) => {
      return <option key={i} value={option.id}>{option.label}</option>;
    });

    return (
      <div className={formGroupClass}>
        <label className="control-label" htmlFor={name}>{label}</label>
        <select className="form-control" name={name} id={name} value={value} onChange={this.changeHandler} ref="select" {...attrDisabled}>
          {selectOptions}
        </select>
        {selectError}
      </div>
    );
  }
});

const RadioGroup = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    config: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      label: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]).isRequired,
      value: React.PropTypes.string.isRequired,
      options: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          id: React.PropTypes.string.isRequired,
          label: React.PropTypes.string.isRequired,
          disabled: React.PropTypes.bool
        })
      ).isRequired,
      error: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]).isRequired,
      validator: React.PropTypes.func.isRequired,
      onChange: React.PropTypes.func.isRequired
    })
  },

  changeHandler(value) {
    const { config: { onChange } } = this.props;

    onChange(value);
  },

  render() {
    const { className, config: { name, label, value, options, error } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error });
    const radioError = error && <InputError>{error}</InputError>;

    const radioButtons = options && options.map((option, i) => {
      const attrChecked = { checked: value === option.id };
      const attrDisabled = !!option.disabled && { disabled: option.disabled };
      const radioClass = classNames('radio', { 'form-group--disabled': !!option.disabled });
      const toggleRadio = () => {
        this.changeHandler(option.id);
      };

      return (
        <div className={radioClass} key={i}>
          <label>
            <input type="radio" name={name} id={option.id} value={option.id} onChange={toggleRadio} {...attrDisabled} {...attrChecked}/>
            {option.label}
          </label>
        </div>
      );
    });

    return (
      <div className={formGroupClass}>
        <label className="radio-group-label" htmlFor={name}>{label}</label>
        <div className="radio-group">
          {radioButtons}
        </div>
        {radioError}
      </div>
    );
  }
});

const HelperBubble = React.createClass({
  propTypes: {
    helperText: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.node
    ]).isRequired
  },

  render() {
    const { helperText } = this.props;

    return (
      <div className="helper-bubble">
        <div className="helper-bubble-inner">
          {helperText}
        </div>
      </div>
    );
  }
});

const getProjectCreationLink = function(path, projectId) {
  return projectId ? '/' + projectId + '/' + path : path;
};

const ProjectProgress = React.createClass({
  propTypes: {
    routes: React.PropTypes.array.isRequired,
    childRoutes: React.PropTypes.array.isRequired,
    projectId: React.PropTypes.string
  },

  getRouteName(routeIndex) {
    const { routes } = this.props;
    const { path } = routes[routeIndex];

    return path;
  },

  getCurrentRouteIndex() {
    const { routes, childRoutes } = this.props;
    const currentRoute = routes[routes.length - 1].path;
    let currentRouteIndex;

    childRoutes.forEach((route, i) => {
      if(route.path === currentRoute){
        currentRouteIndex = i;
      }
    });

    return currentRouteIndex;
  },

  render() {
    const { childRoutes, projectId } = this.props;
    const isEditing = !!projectId;
    const currentRouteIndex = this.getCurrentRouteIndex();

    const progressBarItems = childRoutes.map((route, i) => {
      const isComplete = i < currentRouteIndex;
      const isActive = i === currentRouteIndex;
      const isDisabled = i > currentRouteIndex && !isEditing;
      const itemClass = classNames('progressBar-item', {
        'progressBar-item--complete': isComplete,
        'progressBar-item--active': isActive,
        'progressBar-item--disabled': isDisabled
      });
      const link = getProjectCreationLink(route.path, projectId);
      const item = isDisabled || isActive ? route.path : <Link to={link}>{route.path}</Link>;

      return (
        <div className={itemClass} key={i}>
          {item}
        </div>
      );
    });

    return (
      <div className="progressBar">
        {progressBarItems}
      </div>
    );
  }
});

const newProjectContainer = document.getElementById('newProject');
let newProjectInfo = {};
if(newProjectContainer){
  newProjectInfo = newProjectContainer.dataset;
  console.log(newProjectInfo)
}

const defaultProjectState = {
  projectId: newProjectInfo.id || null,
  data: {
    company: newProjectInfo.company,
    _company_name: newProjectInfo._company_name,
    project_manager: newProjectInfo.project_manager,
    _project_manager_name: newProjectInfo._project_manager_name,
    skills: [],
    title: '',
    type: '',
    start_date: '',
    end_date: '',
    estimated_cash: '',
    estimated_equity_percentage: '',
    mix: false,
    short_blurb: '',
    project_image: null,
    background: '',
    progress: '',
    scope: '',
    milestones: '',
    specs: '',
    private_info: '',
    published: false
  },
  budgetType: '',
  apiError: false,
  formError: false,
  isSending: false,
  isLoading: true,
  project_image_file: ''
};

const getProjectData = (projectId, successCallback, errorCallback) => {
  if(projectId) {
    const url = loom_api.project + projectId + '/';
    const method = 'GET';

    $.ajax({
      url,
      method,
      contentType: false,
      processData: false,
      success: (result) => {
        successCallback(result);
      },
      error: (xhr, status, error) => {
        errorCallback(xhr, status, error);
      }
    });
  } else {
    console.error('`submitProjectData` method expects a projectId, a successCallback and an errorCallback.');
  }
};

const submitProjectData = (data, successCallback, errorCallback) => {
  if(data && successCallback && errorCallback) {
    const url = loom_api.project + (data.id ? data.id + '/' : '');
    const method = data.id ? 'PATCH' : 'POST';

    $.ajax({
      url,
      method,
      data: objectToFormData(data),
      contentType: false,
      processData: false,
      success: (result) => {
        successCallback(result);
      },
      error: (xhr, status, error) => {
        errorCallback(xhr, status, error);
      }
    });
  } else {
    console.error('`submitProjectData` method expects a data object, a successCallback and an errorCallback.');
  }
};

const dateFormatForSave = 'YYYY-MM-DD';
const dateFormatForDisplay = 'MM/DD/YYYY';

const convertDateForSave = (date) => {
  const dateMoment = moment(date);
  const formattedDate = dateMoment.format(dateFormatForSave);

  return formattedDate;
};

const convertDateForDisplay = (date) => {
  const dateMoment = moment(date);
  const formattedDate = dateMoment.format(dateFormatForDisplay);

  return formattedDate;
};

const ProjectBasics = withRouter(React.createClass({

  getInitialState(){
    return defaultProjectState;
  },

  imageTypes() {
    return /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
  },

  formFields(loadedData) {
    const initialState = loadedData || this.state.data;

    return {
      projectName: {
        name: 'project_name',
        label: 'Project Name',
        value: initialState.title,
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.isRequired(value);

          if(!isValid) {
            formFields.projectName.error = 'Please enter a project name.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.title = value;
          formFields.projectName.value = value;
          formFields.projectName.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectType: {
        name: 'project_category',
        label: 'Project Category',
        value: initialState.type,
        options: [
          { id: '', label: 'Please choose one' },
          { id: 'art', label: 'art & design' },
          { id: 'technology', label: 'technology' },
          { id: 'gaming', label: 'gaming' },
          { id: 'nonprofit', label: 'non-profit' },
          { id: 'social', label: 'social' },
          { id: 'news', label: 'news & publishing' },
          { id: 'music', label: 'music & media' },
          { id: 'location', label: 'location-based' },
          { id: 'health', label: 'health & fitness' }
        ],
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.isRequired(value);

          if(!isValid) {
            formFields.projectType.error = 'Please select a project category.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.type = value;
          formFields.projectType.value = value;
          formFields.projectType.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectOverview: {
        name: 'project_overview',
        label: 'Short Project Overview (limit 250 characters)',
        value: initialState.short_blurb,
        error: false,
        placeholder: 'Think of this as your elevator pitch to developers. Get them excited in 250 characters or less.',
        maxLength: 250,
        rows: 3,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.minLength(value, 1) && FormHelpers.checks.maxLength(value, 250);

          if(!isValid) {
            formFields.projectOverview.error = 'Please enter a short project overview (maximum of 250 characters).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.short_blurb = value;
          formFields.projectOverview.value = value;
          formFields.projectOverview.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectStartDate: {
        name: 'start_date',
        label: <span><span className="hide-xs">Preferred</span> Start Date</span>,
        value: initialState.start_date,
        error: false,
        minDate: moment(),
        validator: (value) => {
          const { formFields } = this.state;
          const prettyDate = convertDateForDisplay(value);
          const isValid = FormHelpers.checks.isMomentFormat(prettyDate, dateFormatForDisplay);

          if(!isValid) {
            formFields.projectStartDate.error = 'Please enter a valid start date (MM/DD/YYYY).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;
          const uglyDate = convertDateForSave(value);
          const prettyDate = convertDateForDisplay(value);

          data.start_date = uglyDate;
          formFields.projectStartDate.value = prettyDate;
          formFields.projectStartDate.error = false;
          formFields.projectEndDate.minDate = moment(value).add(1, 'day');
          formFields.projectEndDate.disabled = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectEndDate: {
        name: 'end_date',
        label: <span><span className="hide-xs">Preferred</span> End Date</span>,
        value: initialState.end_date,
        error: false,
        disabled: !initialState.start_date.length && true,
        minDate: this.state.data.start_date ? moment(this.state.data.start_date) : moment(),
        validator: (value) => {
          const { formFields } = this.state;
          const prettyDate = convertDateForDisplay(value);
          const isValid = FormHelpers.checks.isMomentFormat(prettyDate, dateFormatForDisplay);

          if(!isValid) {
            formFields.projectEndDate.error = 'Please enter a valid end date (MM/DD/YYYY).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;
          const uglyDate = convertDateForSave(value);
          const prettyDate = convertDateForDisplay(value);

          data.end_date = uglyDate;
          formFields.projectEndDate.value = prettyDate;
          formFields.projectEndDate.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectImage: {
        value: initialState.project_image,
        validator: (value) => {
          const { formFields, filename, data, project_photo_file } = this.state;
          const image = value || data.project_image
          const isValid = image && image.length;

          if(!isValid) {
            formFields.projectImage.error = 'Please upload a project image.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange(event) {
          event.preventDefault();

          const { data, formFields } = this.state;
          const reader = new FileReader();
          const file = event.target.files[0];

          if(this.imageTypes().exec(file.name)) {
            this.setState({ imageIsLoading: true });

            reader.onloadend = () => {
              data.project_image = reader.result;
              formFields.projectImage.value = reader.result;
              formFields.projectImage.error = false;

              this.setState({
                data,
                project_image_file: file,
                formFields,
                filename: file.name,
                imageIsLoading: false,
                formError: false
              });
            };

            reader.readAsDataURL(file);
          }
        }
      },
      projectSkills: {
        value: initialState.skills,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = value && value.length;

          if(!isValid) {
            formFields.projectSkills.error = 'Please choose project skills.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange(clickedSkill) {
          const { data, formFields } = this.state;
          const selectedSkillIndex = data.skills.indexOf(clickedSkill);

          if(selectedSkillIndex === -1) {
            data.skills.push(clickedSkill)
          }else{
            data.skills.splice(selectedSkillIndex, 1);
          }

          formFields.projectSkills.value = data.skills;
          formFields.projectSkills.error = false;

          this.setState({ data, formFields, formError: false });
        }
      }
    }
  },

  componentWillMount() {
    const { router, location: { state }, params: { projectId } } = this.props;

    if(projectId){
      getProjectData(projectId, (result) => {
        const data = Object.assign({}, defaultProjectState.data, result);
        const formFields = this.formFields(data);

        this.setState({
          data,
          formFields,
          isLoading: false
        });
      }, () => {});
    }else{
      const cleanState = Object.assign({}, defaultProjectState);
      const formFields = this.formFields();

      this.setState({
        ...cleanState,
        formFields,
        isLoading: false
      });
    }
  },

  submitBasics() {
    const { data, formFields, project_image_file } = this.state;

    FormHelpers.validateForm(formFields, (valid, formFields) => {
      this.setState({ formError: !valid, apiError: false });

      if(valid) {
        this.setState({ isSending: true });

        const dataToSend = Object.assign({}, data);
        if (project_image_file) {
          dataToSend.project_image = project_image_file;
        } else {
          delete dataToSend.project_image;
        }


        submitProjectData(dataToSend, (result) => {
          this.goToDetails(result);
        }, () => {
          this.setState({
            isSending: false,
            apiError: true
          });
          console.warn(arguments);
        });
      }
    })
  },

  goToDetails(data) {
    const { router, params: { projectId } } = this.props;

    router.replace({
      pathname: getProjectCreationLink('details', projectId),
      state: { data }
    });
  },

  render() {
    const { route: { path } } = this.props;
    const { data, filename, formFields, imageIsLoading, isLoading, isSending, formError, apiError } = this.state;

    if(isLoading) {
      return <Loader/>;
    }

    const imageError = formFields.projectImage.error && <InputError>{formFields.projectImage.error}</InputError>;
    const imageInput = <input type="file" onChange={formFields.projectImage.onChange.bind(this)} disabled={imageIsLoading || isSending}/>;
    const imageAttach = !data.project_image && (
      <div className="newProject-attachImage-requirements">
        <div className="newProject-attachImage-button">
          <div className="btn btn-brand">
            Upload Image
            { imageIsLoading && <i className="fa fa-circle-o-notch fa-spin fa-fw"></i> }
            {imageInput}
          </div>
          {imageError}
        </div>
        <p className="small dark">Acceptable file types are: jpg, jpeg, gif, png, bmp - limit 15MB</p>
        <p className="small dark">Images will be cropped</p>
      </div>
    );
    const imagePreview = data.project_image && (
      <span>
        <div className="newProject-attachImage-preview">
          <img src={data.project_image}/>
          { filename && <div className="newProject-attachImage-preview-filename">{filename}</div> }
          {imageInput}
        </div>
        {imageError}
      </span>
    );
    const formErrorMessage = formError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Please fix the errors above and try again.</div>;
    const apiErrorMessage = apiError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Something went wrong! Please try again.</div>;

    return (
      <div className="newProject-basics">
        <div className="newProject-headCap">
          <h3 className="text-center brand-bold">
            Let's bring your digital project to life.
          </h3>
          <h4 className="text-center text-muted text-skinny">
            Posting projects is easy and free. Start here by adding the name and category of your project, a quick overview and some basic preferences.
          </h4>
        </div>

        <Input config={formFields.projectName} inputDisabled={isSending}/>
        <Select config={formFields.projectType} inputDisabled={isSending}/>
        <Textarea config={formFields.projectOverview} inputDisabled={isSending}/>

        <div className="newProject-selectDates">
          <DateInput className="newProject-selectDates-projectStartDate" config={formFields.projectStartDate} inputDisabled={isSending}/>
          <DateInput className="newProject-selectDates-projectEndDate" config={formFields.projectEndDate} inputDisabled={isSending}/>
        </div>

        <div className="newProject-attachImage">
          <label>Project Image</label>
          <p className="text-muted small">This is the key image that will be associated with your project. It will appear in search and help your project stand out to developers.</p>
          {imageAttach}
          {imagePreview}
        </div>

        <SkillsSelector toggleSkill={formFields.projectSkills.onChange.bind(this)} selectedSkills={formFields.projectSkills.value} error={formFields.projectSkills.error} inputDisabled={isSending} />

        {formErrorMessage}
        {apiErrorMessage}
        <Button className="newProject-button--proceed" onClick={this.submitBasics} isLoading={isSending} disabled={isLoading || isSending || formError}>Save Project &amp; Continue</Button>
      </div>
    );
  }
}));

const ProjectDetails = withRouter(React.createClass({
  getInitialState() {
    return defaultProjectState;
  },

  formFields() {
    return {
      projectBackground: {
        name: 'project_background',
        label: 'Project Background (at least 140 characters)',
        value: this.state.data.background,
        helperText: 'Give the developer community some background. Where did the idea come from? How did you get here? Who have you been working on this with?',
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.minLength(value, 140);

          if(!isValid) {
            formFields.projectBackground.error = 'Please fill out your project background (minimum of 140 characters).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.background = value;
          formFields.projectBackground.value = value;
          formFields.projectBackground.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectProgress: {
        name: 'project_progress',
        label: 'Where are you today?',
        value: this.state.data.progress,
        helperText: <span>What's the current status of the project? Do you have funding? Do you have existing designs, wireframes and/or prototypes for the idea? Do you have an existing website or product that you're creating a new feature for?</span>,
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.minLength(value, 140);

          if(!isValid) {
            formFields.projectProgress.error = 'Please fill out your project progress (minimum of 140 characters).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.progress = value;
          formFields.projectProgress.value = value;
          formFields.projectProgress.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectScope: {
        name: 'project_scope',
        label: 'What, specifically, do you need a developer to do?',
        value: this.state.data.scope,
        helperText: <span>This is where you should outline the scope of the project.<br/><br/>Think about the project from bedinning to end and be as specific as you can about what you expect to be done.</span>,
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.minLength(value, 140);

          if(!isValid) {
            formFields.projectScope.error = 'Please fill out your project scope (minimum of 140 characters).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.scope = value;
          formFields.projectScope.value = value;
          formFields.projectScope.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectMilestones: {
        name: 'project_milestones',
        label: 'Project Milestones',
        value: this.state.data.milestones,
        helperText: 'This is where you should list project milestones and important dates.',
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.minLength(value, 140);

          if(!isValid) {
            formFields.projectMilestones.error = 'Please fill out your project milestones (minimum of 140 characters).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.milestones = value;
          formFields.projectMilestones.value = value;
          formFields.projectMilestones.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectSpecs: {
        name: 'project_specs',
        label: <span>Project Deliverables &amp; Specs</span>,
        value: this.state.data.specs,
        helperText: <span>This is where you should list key deliverables and required specs for each. Sometimes milestones are tied to deliverables. A little overlap is okay. It's better to over-inform developers about your expectations.</span>,
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.minLength(value, 140);

          if(!isValid) {
            formFields.projectSpecs.error = 'Please fill out your project deliverables & specs (minimum of 140 characters).';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.specs = value;
          formFields.projectSpecs.value = value;
          formFields.projectSpecs.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      projectPrivateInfo: {
        name: 'project_private_info',
        label: 'Private Project Details',
        value: this.state.data.private_info,
        helperText: <span>Business plans? Algorithms? Secret Sauce? This is the place for any and all details about the project that might be too sensitive for public view, but you want to make available to developers that have signed an NDA.</span>,
        error: false,
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.private_info = value;
          formFields.projectPrivateInfo.value = value;

          this.setState({ data, formFields });
        }
      }
    }
  },

  componentWillMount() {
    const { router, location: { state }, params: { projectId } } = this.props;
    const formFields = this.formFields();

    if(state && state.data) {
      console.log('passed')
      const data = Object.assign({}, defaultProjectState, state.data);

      this.setState({
        data,
        formFields,
        isLoading: false
      });
    }else if(projectId){
      getProjectData(projectId, (result) => {
        const data = Object.assign({}, defaultProjectState, result);
        console.log('fetched', data)

        this.setState({
          data,
          formFields,
          isLoading: false
        });
      }, () => {
        const cleanState = Object.assign({}, defaultProjectState);
        const formFields = this.formFields();

        this.setState({
          ...cleanState,
          formFields,
          isLoading: false
        });
      });
    }else{
      router.replace('/');
    }
  },

  submitDetails() {
    const { data, formFields } = this.state;

    FormHelpers.validateForm(formFields, (valid, formFields) => {
      this.setState({ formError: !valid, apiError: false });

      if(valid) {
        this.setState({ isSending: true });

        const dataToSend = Object.assign({}, data);
        delete dataToSend.project_image;

        submitProjectData(dataToSend, (result) => {
          this.goToBudget(result);
        }, () => {
          this.setState({
            isSending: false,
            apiError: true
          });
          console.warn(arguments);
        });
      }
    })
  },

  goToBudget(data) {
    const { router, params: { projectId } } = this.props;
    const { id } = data;

    router.replace({
      pathname: getProjectCreationLink('budget', projectId),
      state: { data }
    });
  },

  render() {
    const { route: { path } } = this.props;
    const { data, formFields, isSending, isLoading, formError, apiError } = this.state;
    const formErrorMessage = formError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Please fix the errors above and try again.</div>;
    const apiErrorMessage = apiError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Something went wrong! Please try again.</div>;

    if(isLoading) {
      return <Loader/>;
    }

    return (
      <div className="newProject-details">
        <div className="newProject-headCap">
          <h3 className="text-center brand-bold">
            Tell developers the details about what you want to create:
          </h3>
          <h4 className="text-center text-muted text-skinny">
            Start from the beginning with project background, then lay out the current status of the project, followed by specific goals, milestones and deliverables.
          </h4>
        </div>

        <WYSIWYG config={formFields.projectBackground} inputDisabled={isSending} />

        <WYSIWYG config={formFields.projectProgress} inputDisabled={isSending} />

        <WYSIWYG config={formFields.projectScope} inputDisabled={isSending} />

        <WYSIWYG config={formFields.projectMilestones} inputDisabled={isSending} />

        <WYSIWYG config={formFields.projectSpecs} inputDisabled={isSending} />

        <div className="newProject-private-info-header">
          <h4>Private Project Info <span className="text-muted">(optional)</span> <i className="fa fa-lock" aria-hidden="true"></i></h4>
          <p>The private information tab is secure and can only be unlocked by a developer you approve, after they sign a non-disclosure agreement.</p>
        </div>

        <WYSIWYG config={formFields.projectPrivateInfo} inputDisabled={isSending} />

        {formErrorMessage}
        {apiErrorMessage}
        <Button className="newProject-button--proceed" onClick={this.submitDetails} isLoading={isSending} disabled={isLoading || isSending || formError}>Save Project &amp; Continue</Button>

      </div>
    );
  }
}));

const ProjectBudget = withRouter(React.createClass({
  getInitialState() {
    return defaultProjectState;
  },

  formFields() {
    return {
      compensationType: {
        name: 'compensationType',
        label: 'Budget Type (select one)',
        value: '',
        options: [
          {
            label: 'Cash Only',
            id: 'cash'
          },
          {
            label: 'Equity Only',
            id: 'equity'
          },
          {
            label: 'Cash or Equity',
            id: 'cash-or-equity'
          },
          {
            label: 'Cash + Equity Mix',
            id: 'cash-and-equity'
          }
        ],
        error: false,
        validator: (value) => {
          const { formFields } = this.state;
          const isValid = FormHelpers.checks.isRequired(value);

          if(!isValid) {
            formFields.compensationType.error = 'Please tell us how you\'d like to compensate developers.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { budgetType, data, formFields } = this.state;

          let type = budgetType;

          switch(value) {
            case 'cash-or-equity':
              type = 'cash-equity';
              data.mix = false;
              break;
            case 'cash-and-equity':
              type = 'cash-equity';
              data.mix = true;
              break;
            case 'cash':
              type = 'cash';
              data.mix = false;
              formFields.equity.onChange('');
              break;
            case 'equity':
              type = 'equity';
              data.mix = false;
              formFields.cash.onChange('');
              break;
          }

          formFields.compensationType.value = value;
          formFields.compensationType.error = false;

          this.setState({
            budgetType: type,
            data,
            formFields,
            formError: false
          });
        }
      },
      cash: {
        name: 'cash',
        label: 'Cash Offer',
        value: '',
        error: false,
        validator: (value) => {
          const { budgetType, budgetMix, formFields } = this.state;
          const valueClean = typeof value === 'string' ? value.replace(/,/g, '') : value;
          const cashValue = parseInt(valueClean);
          const cleanValue = value.toString().match(/^\d*?\d*$/);
          const isValid = (budgetType === 'cash' || budgetType === 'cash-equity') ? (typeof cashValue === 'number' && cashValue > 0) && cleanValue : true;

          if(!isValid){
            formFields.cash.error = 'Please enter a cash offer.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.estimated_cash = value;
          formFields.cash.value = value;
          formFields.cash.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
      equity: {
        name: 'equity',
        label: 'Equity Offer',
        value: '',
        error: false,
        validator: (value) => {
          const { budgetType, budgetMix, formFields } = this.state;
          const equityValue = parseFloat(value);
          const cleanValue = value.toString().match(/^\d*\.?\d*$/);
          const isValid = (budgetType === 'equity' || budgetType === 'cash-equity') ? ((typeof equityValue === 'number' && equityValue > 0 && equityValue < 100) && cleanValue) : true;

          if(!isValid) {
            formFields.equity.error = 'Please enter an equity offer.';

            this.setState({ formFields });
          }

          return isValid;
        },
        onChange: (value) => {
          const { data, formFields } = this.state;

          data.estimated_equity_percentage = value;
          formFields.equity.value = value;
          formFields.equity.error = false;

          this.setState({ data, formFields, formError: false });
        }
      },
    }
  },

  componentWillMount() {
    const { router, location: { state }, params: { projectId } } = this.props;
    const formFields = this.formFields();

    if(state && state.data) {
      console.log('passed')
      const data = Object.assign({}, defaultProjectState, state.data);

      this.setState({
        data,
        formFields,
        isLoading: false
      });
    }else if(projectId){
      getProjectData(projectId, (result) => {
        const data = Object.assign({}, defaultProjectState, result);
        console.log('fetched', data)

        this.setState({
          data,
          formFields,
          isLoading: false
        });
      }, () => {
        const cleanState = Object.assign({}, defaultProjectState);
        const formFields = this.formFields();

        this.setState({
          ...cleanState,
          formFields,
          isLoading: false
        });
      });
    }else{
      router.replace('/');
    }
  },

  componentDidMount() {
    this.setCompanyState();
  },

  setCompanyState() {
    const { data: { company }, formFields } = this.state;

    if(!company){
      formFields.compensationType.options.forEach((option, i) => {
        if(option.id !== 'cash'){
          option.disabled = true;
        }
      });
      this.setState({ formFields }, () => {
        formFields.compensationType.onChange('cash');
      });
    }
  },

  submitBudget() {
    const { data, formFields } = this.state;

    FormHelpers.validateForm(formFields, (valid, formFields) => {
      this.setState({ formError: !valid, apiError: false });

      if(valid) {
        this.setState({ isSending: true });

        const dataToSend = Object.assign({}, data);
        delete dataToSend.project_image;

        dataToSend.published = true;

        submitProjectData(dataToSend, (result) => {
          // this.goToBudget(result);
        }, () => {
          this.setState({
            isSending: false,
            apiError: true
          });
          console.warn(arguments);
        });
      }
    })
  },

  goToProjectPage(data) {
    const { router, params: { projectId } } = this.props;
    const { id } = data;
    console.log('success!', data)

    // router.replace({
    //   pathname: getProjectCreationLink('budget', id),
    //   state: { data }
    // });
  },

  render() {
    const { data: { company, mix }, budgetType,formFields, isSending, isLoading, formError, apiError } = this.state;

    if(isLoading) {
      return <Loader/>;
    }

    const companyMessage = !company && <div className="alert alert-info"><strong>Want to offer equity?</strong> Register as a company in your <a href="/profile/settings/#/company" target="_blank">dashboard</a>.</div>;
    const cashInput = (budgetType === 'cash' || budgetType === 'cash-equity') && <Input config={formFields.cash} prefix="$" suffix=".00" />;
    const equityInput = (budgetType === 'equity' || budgetType === 'cash-equity') && <Input config={formFields.equity} suffix="%" />;
    const and = mix && 'and';
    const or = (!and && cashInput && equityInput) && 'or';
    const andOr = (and || or) && <div className="newProject-compensation-andOr">{and}{or}</div>;
    const formErrorMessage = formError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Please fix the errors above and try again.</div>;
    const apiErrorMessage = apiError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Something went wrong! Please try again.</div>;

    return (
      <div className="newProject-details">
        <div className="newProject-headCap">
          <h3 className="text-center brand-bold">
            What's your budget?
          </h3>
          <h4 className="text-center text-muted text-skinny">
            This is just a starting point for bidding. You'll confirm compensation once you accept a bid you like.
          </h4>
          <p className="text-muted">Note: The "Cash or Equity" option allows you to set your budget for cash and equity, but signals to the developer that you'll pay in either cash or equity, not both.</p>
        </div>

        {/* This is awful */}
        <RadioGroup config={formFields.compensationType} className="newProject-compensationType" />
        {companyMessage}

        <div className="newProject-compensationInputs">
          {cashInput}
          {andOr}
          {equityInput}
        </div>

        {formErrorMessage}
        {apiErrorMessage}
        <Button className="newProject-button--proceed" onClick={this.submitBudget} isLoading={isSending} disabled={isLoading || isSending || formError}>Post Project</Button>
      </div>
    );
  }
}));

const NewProjectContainer = React.createClass({
  render() {
    const { routes, route: { childRoutes }, params: { projectId } } = this.props;

    return (
      <div className="newProject page-content--small">
        <ProjectProgress routes={routes} childRoutes={childRoutes} projectId={projectId} />
        {this.props.children}
      </div>
    )
  }
});

const browserHistory = useRouterHistory(createHashHistory)();

export const NewProject = (
  <Router history={browserHistory}>
    <Route path="/(:projectId/)" component={NewProjectContainer}>
      <Route path="basics" component={ProjectBasics}/>
      <Route path="details" component={ProjectDetails}/>
      <Route path="budget" component={ProjectBudget}/>
      <IndexRedirect to="basics"/>
    </Route>
  </Router>
);

export default CreateProject;
