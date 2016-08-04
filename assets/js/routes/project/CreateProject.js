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
                    <NavItem {...props('basics', 'first-step')}>Basics</NavItem>
                    <NavItem {...props('details')}>Project Details</NavItem>
                    <NavItem {...props('budget', 'last-step')}>Budget</NavItem>
                    <NavItem {...props('preview', 'final')}>Preview</NavItem>
                    <NavItem {...props('post', 'final')}>Post</NavItem>
                </Nav>
            </div>
        </div>
    )
}

function Basics({update, ...props}){
    return (
        <div {...props}>
            <div className="form-fancy bootstrap-material">
                <p className="text-center section-header form-group">
                    What do you want to name this new project?
                    <UpdateInput name='title' className='large text-center' type="text" placeholder="Title project here" update={update}/>
                </p>
                <div className="text-center section-header form-group ">
                    Choose a category for this project
                    <br />
                    <TypeSelect className="form-control select" name='type' data={typeOptions} onChange={event => update.type({event})}/>
                </div>

                <BigFormGroup label="Short Project Overview">
                    <textarea type="text" rows="3" className="form-control" name="short_blurb"
                        onChange={event => update.overview({event})}
                        placeholder="Think of this as your elevator pitch to developers. Get them excited in 250 characters or less." />
                </BigFormGroup>

                <BigFormGroup label="Preferred Project Start Date">
                    <UpdateInput type="date" name="start_date" onChange={e => update.start_date(convertToDate(e))}/>
                </BigFormGroup>

                <BigFormGroup label="Preferred Project End Date">
                    <UpdateInput type="date" name="end_date" onChange={e => update.end_date(convertToDate(e))}/>
                </BigFormGroup>
            </div>

            <BigFormGroup label="Preferred Technology Stack (Optional)">
                <br />
                This helps developers determine if they're the right person for the job.
                <br />
                If you don't have a preference, no sweat. You can leave this section blank.
                <SkillWidget onChange={value => update.skills({value})}/>
            </BigFormGroup>

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
                <p className="section-header form-group col-md-8 col-md-offset-2">
                    What are you creating?
                </p>
                <p className="form-group col-md-8 col-md-offset-2">
                    This is where you should outline all the project specifics.
                    The more details you provide, the more quality bids you will recieve.
                </p>
                <BigFormGroup label="Project Video">
                    <AttachmentField accept="video/*" tag="video" onChange={this.attachmentUpdater} />
                </BigFormGroup>
                <BigFormGroup label="Project Image">
                    <AttachmentField accept="image/*" tag="image" onChange={this.attachmentUpdater} />
                </BigFormGroup>
                <ProjectInfoField id='details' data={details} update={update.details} />
                { info.map((data, key) => (
                    <ProjectInfoField {...{data, key, id: key}} update={this.infoUpdater(key)} className={key == 0 ? 'primary' : ''}/>
                ))}
                <BigFormGroup label={(
                    <a onClick={e => this.infoUpdater(info.length)({value: this.defaultInfo})} className="add-info">
                        <i className="fa fa-plus-circle" aria-hidden="true"/> Add Another Tab
                    </a>
                    )}>
                    <p style={{textAlign: 'center'}}>
                        This is optional, but some people like to add tabs that house addtional project details, <br/>
                        onboarding documents, design guidlines, UX documentation, etc.
                    </p>
                    <p style={{textAlign: 'center'}}>
                        Make as many as you'd like. You can set them to public or private.
                    </p>
                </BigFormGroup>
            </div>
        )
    }
})

function Budget({update, ...props}){
    return (
        <div {...props}>
            <div className="form-group">
                <div className="col-md-4">
                    <label>Time Estimate & Compensation</label>
                    <div className="input-group">
                        <UpdateInput type="number" name="estimated_hours" placeholder="Estimated Hours" update={update}/>
                        <div className="input-group-addon">hours</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <label>&nbsp;</label>
                    <div className="input-group">
                        <div className="input-group-addon">$</div>
                        <UpdateInput type="number" name="estimated_cash" placeholder="Estimated Cash" update={update}/>
                        <div className="input-group-addon">.00</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <label>&nbsp;</label>
                    <div className="input-group">
                        <UpdateInput type="number" name="estimated_equity" placeholder="Estimated Equity" placeholder="Equity Offered" update={update}/>
                        <div className="input-group-addon">%</div>
                    </div>
                </div>
                <div className="clearfix"/>
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
        this.setState({ is_loading: true });
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

    currentSectionIsValid(){ return true },

    sectionAction(event){
        $('html body').animate({ scrollTop: 0 }, 'fast');
        event.preventDefault();
        if(this.currentSectionIsValid()){
            let { currentSection, sections } = this.state
            let index = sections.indexOf(currentSection)
            if(index >= sections.length - 2){
                this.save()
            } else {
                this.selectSection(sections[index + 1])
            }
        }
    },

    selectSection( currentSection ){
        return this.setState({currentSection})
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
        let { data: {details, info}, sections, currentSection } = this.state
        return (
            <div className={`sections ${currentSection} is active`}>
                <ProgressBar flow={sections} active={currentSection} onSelect={this.selectSection}/>
                <form id="project-form" method="post" enctype="multipart/form-data">
                    { this.props.csrf_token }
                    <Basics className='basics section' update={this.fieldUpdateMap(
                        'title', 'type', 'overview', 'start_date', 'end_date', 'skills')}/>

                    <Details className='details section' update={this.fieldUpdateMap('details', 'info')} data={{details, info}} />

                    <Budget className='budget section' update={this.fieldUpdateMap(
                        'estimated_hours', 'estimated_cash', 'estimated_equity', 'confidential_info')}/>

                    <ProjectPreview className='preview section' data={this.state.data} active={this.state.currentSection == 'preview'}/>

                    <div className='text-center form-group col-md-12'>
                        <a type='submit' className='btn btn-brand btn-brand--attn' onClick={this.sectionAction}>
                            { (sections.indexOf(currentSection) < sections.length - 2) ? 'Save Project and Continue' : 'Post Project'}
                        </a>
                    </div>
                </form>
            </div>
        )
    }
})

export default CreateProject
