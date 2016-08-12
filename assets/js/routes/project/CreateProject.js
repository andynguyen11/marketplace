import React from 'react'
import { Button, FormGroup, FormControl, ControlLabel, Nav, NavItem } from 'react-bootstrap';
import { BigFormGroup } from './FormUtils';
import Select2 from 'react-select2-wrapper'
import { SkillWidget } from '../../components/skill'
import { objectToFormData } from './utils'
import AttachmentField, { MultipleAttachmentsField, mergeAttachments } from './AttachmentField'
import ProjectInfoField from './ProjectInfoField'
import ProjectPreview from './ProjectPreview'

function convertToDate(event){
    event.preventDefault();
    return {value:  new Date(event.target.value).toJSON().slice(0,10)}
}

var typeOptions = [
    { id: '', text: 'Please choose one'},
    { id: 'art', text: 'art & design' },
    { id: 'technology', text: 'technology' },
    { id: 'gaming', text: 'gaming' },
    { id: 'nonprofit', text: 'non-profit' },
    { id: 'social', text: 'social' },
    { id: 'news', text: 'news & publishing' },
    { id: 'music', text: 'music & media' },
    { id: 'location', text: 'location-based' },
    { id: 'health', text: 'health & fitness' },
]

const TypeSelect = React.createClass({
    render(){
        let { data, ...props } = this.props;
        return (
            <select defaultValue={this.props.data[0].id} {...props}>
                {data.map(({id, text}) => (<option key={id} value={id}>{text}</option>))}
            </select>
        )

    }
})

function UpdateInput({name, update, className, onChange, ...props}){
    onChange = onChange || (event => update[name]({event}))
    return (
        <input name={name} className={`form-control ${className}`} onChange={onChange} {...props}/>
    )
}

function ProgressBar({flow, active, valid=true, onSelect}){
    let activeIndex = flow.indexOf(active)
    let hasValidIndex = key => ((activeIndex >= flow.indexOf(key)) || (activeIndex == flow.indexOf(key) - 1 && valid))
    let props = (eventKey, className='') => ({
        eventKey,
        className: `${eventKey} info-pill ${className}`,
        disabled: !hasValidIndex(eventKey)
    })
    return (
        <div className="top-bar row">
            <div className="col-sm-push-1 col-sm-10 ">
                <Nav bsStyle="pills" className="dq-progress-bar" activeKey={1} onSelect={onSelect}>
                    <NavItem {...props('basics', 'first-step')}>Project Basics</NavItem>
                    <NavItem {...props('details')}>Project Details</NavItem>
                    <NavItem {...props('budget', 'last-step')}>Budget</NavItem>
                    <NavItem {...props('preview', 'final')}>Post Project</NavItem>
                </Nav>
            </div>
        </div>
    )
}

function Basics({update, ...props}){
    return (
        <div {...props}>
            <div className="form-fancy bootstrap-material">
                <div className={'text-center col-md-8 col-md-offset-2 form-group ' + props.formErrors.title} >
                    <h3 className="brand">What do you want to name this new project?</h3>
                    <UpdateInput name='title' className='large text-center' type="text" placeholder="Title project here" update={update}/>
                </div>
                <div className={'text-center col-md-8 col-md-offset-2 form-group ' + props.formErrors.type}>
                    <h3 className="brand">Choose a category for this project</h3>
                    <TypeSelect className="form-control select" name='type' data={typeOptions} onChange={event => update.type({event})}/>
                </div>

                <div className={'form-group col-md-8 col-md-offset-2 ' + props.formErrors.short_blurb}>
                    <label className='control-label'>Project Overview</label>
                    <textarea type="text" rows="3" className="form-control" name="short_blurb"
                        onChange={event => update.short_blurb({event})}
                        placeholder="Think of this as your elevator pitch to developers. Get them excited in 250 characters or less." />
                </div>

                <div className={'form-group col-md-4 col-md-offset-2 ' + props.formErrors.start_date} >
                    <label className="control-label">Preferred Start Date</label>
                    <UpdateInput type="date" name="start_date" onChange={e => update.start_date(convertToDate(e))}/>
                </div>

                <div className={'form-group col-md-4 ' + props.formErrors.end_date} >
                    <label className="control-label">Preferred End Date</label>
                    <UpdateInput type="date" name="end_date" onChange={e => update.end_date(convertToDate(e))}/>
                </div>
            </div>

            <BigFormGroup label="Preferred Technology Stack (Optional)">
              <p className="text-muted small">
                This helps developers determine if they're the right person for the job.
                If you don't have a preference, no sweat. You can leave this section blank.
              </p>
              <SkillWidget onChange={value => update.skills({value})}/>
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
            let data = Object.assign(this.props.data.details || {}, {[field]: value })
            this.props.update.details({ value: data })
            if(event)
                event.preventDefault();
        }
    },

    attachmentUpdater(newAttachments){
        let updater = this.fieldUpdater('attachments')
        let { details: { attachments = [] } = {} } = this.props.data
        updater({value: mergeAttachments(attachments, newAttachments)})
    },

    infoUpdater(index){
        let updater = this.fieldUpdater('info')
        return ({value: newInfo}) => {
            let { info } = this.props.data
            info[index] = newInfo
            updater({value: info})
        }
    },

    render(){
        let {update, data: {details, info}, ...props} = this.props

        return (
            <div {...props}>
              <div className="col-md-8 col-md-offset-2 sub-section">
                <h3 className="brand">
                    What are you creating?
                </h3>
                <p className="text-muted">
                    This is where you should outline all the project specifics.
                    The more details you provide, the more quality bids you will recieve.
                </p>
              </div>
                <BigFormGroup label="Project Image">
                    <AttachmentField accept="image/*" tag="image" onChange={this.attachmentUpdater} />
                </BigFormGroup>
                <div className={props.formErrors.details} >
                  <ProjectInfoField id='details' data={details} update={update.details} />
                </div>
                { info.map((data, key) => (
                    <ProjectInfoField {...{data, key, id: key}} update={this.infoUpdater(key)} className={key == 0 ? 'primary' : ''}/>
                ))}
            {/*
              <BigFormGroup label={(
                <a onClick={e => this.infoUpdater(info.length)({value: this.defaultInfo})} className="add-info">
                  <i className="fa fa-plus-circle" aria-hidden="true"/>
                  Add Another Tab
                </a>
              )}>
                <p style={{textAlign: 'center'}}>
                  This is optional, but some people like to add tabs that house addtional project details,
                  <br/>
                  onboarding documents, design guidlines, UX documentation, etc.
                </p>
                <p style={{textAlign: 'center'}}>
                  Make as many as you'd like. You can set them to public or private.
                </p>
              </BigFormGroup>
            */}
              <div className="clearfix"></div>
            </div>
        )
    }
})

function Budget({update, ...props}){
    const equity = ( props.company ?
        <div className={props.company ? 'col-md-2' : hidden}>
            <div className="input-group">
                <UpdateInput name="estimated_equity_percentage" placeholder="Estimated Equity" placeholder="Equity Offered" update={update}/>
                <div className="input-group-addon">%</div>
            </div>
        </div>
        :
        <div className='col-md-2'>&nbsp;</div>
      )

    return (
        <div {...props}>
            <div className="form-group">
                <label className='col-md-9 col-md-offset-3'>Time Estimate & Compensation</label>
                <div className={'col-md-2 col-md-offset-3 ' + props.formErrors.estimated_hours} >

                    <div className="input-group">
                        <UpdateInput type="number" name="estimated_hours" placeholder="Estimated Hours" update={update}/>
                        <div className="input-group-addon">hours</div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="input-group">
                        <div className="input-group-addon">$</div>
                        <UpdateInput type="number" name="estimated_cash" placeholder="Estimated Cash" update={update}/>
                        <div className="input-group-addon">.00</div>
                    </div>
                </div>
                { equity }
                <div className="clearfix"></div>
            </div>
        </div>
    )
}

const CreateProject = React.createClass({

    componentDidMount() {
        this.setState({
            data: ['company', 'project_manager', ].reduce((data, key) => ({
                [key]: $('#project-root').data(key),
                [`_${key}_name`]: $('#project-root').data(`_${key}_name`),
                ...data
            }), this.state.data || {})
        })
    },

    save(e){
        if(e) e.preventDefault();
        this.setState({ isLoading: true });
        $.ajax({
            url: loom_api.project,
            method: 'POST',
            data: objectToFormData(this.state.data),
            contentType: false,
            processData: false,
            success: result => {
                window.location = `/project/${result.id}/`;
            }
        });
    },

    getInitialState(){
        return {
            is_loading: false, 
            currentSection: 'basics',
            sections: ['basics', 'details', 'budget', 'preview', 'post'],
            formErrors: {
              title: '',
              type: '',
              short_blurb: '',
              start_date: '',
              end_date: '',
              details: '',
              estimated_hours: ''
            },
            formError: false,
            data: {
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
                }]
            }
        }
    },

    // TODO this is a quick and dirty validator, switch to formElements
    validateBasics() {
      const short_blurb_error = this.state.data.short_blurb ? '' : 'has-error';
      const start_date_error = this.state.data.start_date ? '' : 'has-error';
      const end_date_error = this.state.data.end_date ? '' : 'has-error';
      const title_error = this.state.data.title ? '' : 'has-error';
      const type_error = this.state.data.type ? '' : 'has-error';
      this.setState({
        formErrors: {
          short_blurb: short_blurb_error,
          start_date: start_date_error,
          end_date: end_date_error,
          title: title_error,
          type: type_error
        }
      });
      return !title_error && !type_error && !short_blurb_error && !start_date_error && !end_date_error;
    },

    // TODO this is a quick and dirty validator, switch to formElements
    validateDetails() {
      const details_error = this.state.data.details.description ? '' : 'has-error';
      this.setState({
        formErrors: {
          details: details_error
        }
      });
      return !details_error;
    },

    // TODO this is a quick and dirty validator, switch to formElements
    validateBudget() {
      const hours_error = this.state.data.estimated_hours ? '' : 'has-error';
      this.setState({
        formErrors: {
          estimated_hours: hours_error
        }
      });
      return !hours_error;
    },

    currentSectionIsValid(currentSection) {
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
      this.setState({ formError: !valid });
      return valid;
    },

    sectionAction(event){
        $('html body').animate({ scrollTop: 0 }, 'fast');
        event.preventDefault();
        let { currentSection, sections } = this.state;
        if(this.currentSectionIsValid(currentSection)){
            let index = sections.indexOf(currentSection)
            if(index >= sections.length - 2){
                this.save()
            } else {
                this.selectSection(sections[index + 1])
            }
        }
    },

    selectSection( currentSection ){
      if(this.currentSectionIsValid(this.state.currentSection)) {
        return this.setState({currentSection})
      }
    },
    
    fieldUpdater(field){
        return ({value, event}) => {
            value = value || event.target.value
            this.setState({ data: Object.assign(this.state.data, {[field]: value }) })
            if(event)
                event.preventDefault();
        }
    },

    fieldUpdateMap(...fields){
        return fields.reduce((actions, field) => {
            actions[field] = this.fieldUpdater(field)
            return actions
        }, {})
    },

    render(){
        let { data: {details, info}, sections, currentSection, formErrors, formError } = this.state;
        const error = formError && <div className="alert alert-danger col-md-8 col-md-offset-2" role="alert">Please correct errors above.</div>;
        return (
            <div className={`sections ${currentSection} is active`}>
                <ProgressBar flow={sections} active={currentSection} onSelect={this.selectSection}/>
                <form id="project-form" method="post" encType="multipart/form-data">

                    { this.props.csrf_token }
                    <Basics
                      className={currentSection == 'basics' ? 'basics' : 'hidden'}
                      update={this.fieldUpdateMap('title', 'type', 'short_blurb', 'start_date', 'end_date', 'skills')}
                      formErrors={formErrors}
                    />

                    <Details
                      className={currentSection == 'details' ? 'details' : 'hidden'}
                      update={this.fieldUpdateMap('details', 'info')}
                      data={{details, info}}
                      formErrors={formErrors}
                    />

                    <Budget className={currentSection == 'budget' ? 'budget' : 'hidden'}
                      update={this.fieldUpdateMap('estimated_hours', 'estimated_cash', 'estimated_equity_percentage', 'confidential_info')}
                      formErrors={formErrors}
                      company={this.state.data.company}
                    />

                    <div className='text-center form-group'>
                        {error}
                        <a type='submit' className='btn btn-brand btn-brand--attn' onClick={this.sectionAction}>
                            { (sections.indexOf(currentSection) < sections.length - 2) ? 'Save Project and Continue' : 'Post Project'}
                        </a>
                    </div>

                    <h4 className={this.state.currentSection == 'preview' ? "text-skinny" : 'hidden'}>
                      <i className={ this.state.isLoading ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
                       Project Preview
                    </h4>

                    <ProjectPreview className='project-preview' data={this.state.data} active={this.state.currentSection == 'preview'}/>

                </form>
            </div>
        )
    }
})

export default CreateProject
