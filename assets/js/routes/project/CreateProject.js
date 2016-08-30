import React from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Nav, NavItem} from 'react-bootstrap';
import {BigFormGroup} from './FormUtils';;
import Select2 from 'react-select2-wrapper';
import {SkillWidget} from '../../components/skill';
import {objectToFormData} from './utils';
import AttachmentField, {MultipleAttachmentsField, mergeAttachments} from './AttachmentField';
import ProjectInfoField from './ProjectInfoField';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Loader from '../../components/loadScreen';

function convertToDate(event) {
  event.preventDefault();
  return {value: new Date(event.target.value).toJSON().slice(0, 10)}
}

var typeOptions = [
  {id: '', text: 'Please choose one'},
  {id: 'art', text: 'art & design'},
  {id: 'technology', text: 'technology'},
  {id: 'gaming', text: 'gaming'},
  {id: 'nonprofit', text: 'non-profit'},
  {id: 'social', text: 'social'},
  {id: 'news', text: 'news & publishing'},
  {id: 'music', text: 'music & media'},
  {id: 'location', text: 'location-based'},
  {id: 'health', text: 'health & fitness'},
]

const TypeSelect = React.createClass({
  render(){
    let {data, value, ...props} = this.props;
    return (
      <select value={value || this.props.data[0].id} {...props}>
        {data.map(({id, text}) => (<option key={id} value={id}>{text}</option>))}
      </select>
    )

  }
})

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
    const error = (formError || apiError) &&
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
})

export default CreateProject
