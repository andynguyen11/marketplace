import React from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Select2 from 'react-select2-wrapper'
import { SkillWidget } from '../skill'
import { objectToFormData } from './utils'

function convertToDate(event){
    event.preventDefault();
    return {value:  new Date(event.target.value).toJSON()}
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

class TypeSelect extends React.Component {
    render(){
        let { data, ...props } = this.props;
        return (
            <select defaultValue={this.props.data[0].id} {...props}>
                {data.map(({id, text}) => (<option key={id} value={id}>{text}</option>))}
            </select>
        )

    }
}

function BigFormGroup({label, children, className='col-md-8 col-md-offset-2'}){
    return (
        <FormGroup bsClass={`form-group ${className}`} >
            <ControlLabel>{label}</ControlLabel>
            {children}
        </FormGroup>
    )
}

function UpdateInput({name, update, className, onChange, ...props}){
    onChange = onChange || (event => update[name]({event}))
    return (
        <input name={name} className={`form-control ${className}`} onChange={onChange} {...props}/>
    )
}

function ProgressBar(){
    return (
        <div className="top-bar row">
            <div className="col-sm-push-1 col-sm-10">
                <ul className="dq-progress-bar col-sm-7">
                    <li className="basics info-pill col-sm-3">Basics</li>
                    <li className="details info-pill col-sm-6">Project Details</li>
                    <li className="budget info-pill col-sm-3">Budget</li>
                </ul>
                <ul className="progress-state col-sm-5">
                    <li className="col-sm-6"><button className="preview info-pill">Preview</button></li>
                    <li className="col-sm-6"><button className="post info-pill">Post</button></li>
                </ul>
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
                <SkillWidget skills={[{id: 1, name: 'dancing'}, {id: 2, name: 'ballet'}]} onChange={value => update.skills({value})}/>
            </BigFormGroup>

        </div>
    )
}

class Details extends React.Component {
    state = { data: {} }

    fieldUpdater = (field, getValue = event=>event.target.value) => {
        return ({value, event}) => {
            value = value || event.target.value
            let data = Object.assign(this.state.data, {[field]: value })
            this.setState({ data })
            this.props.update.details({ value: data })
            if(event)
                event.preventDefault();
        }
    }

    attachmentUpdater = (tag) => {
        let updater = this.fieldUpdater('attachments')
        return (event) => {
            let { attachments = [] } = this.state.data
            let file = event.target.files[0]
            updater({value: [{file, tag}, ...attachments.filter(a => a.tag != tag)]})
        }
    }

    render(){
        let {update, ...props} = this.props
        return (
            <div {...props}>
                <p className="section-header form-group">
                    What are you creating?
                </p>
                <p>
                    This is where you should outline all the project specifics.
                    The more details you provide, the more quality bids you will recieve.
                </p>
                {/* video */}
                <BigFormGroup label="Project Image">
                    <input className="form-control" type="file" name="image" 
                        onChange={this.attachmentUpdater("image")} />
                </BigFormGroup>
                <div className="form-group">
                    <div className="col-md-12">
                        <label>Details</label>
                        <textarea className="form-control" name="description" 
                            onChange={event => this.fieldUpdater("description")({event})}
                            placeholder="This is the public longform description associated with your project." />
                    </div>
                    <div className="clearfix"/>
                </div>
                {/* info */}
            </div>
        )
    }
}

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

function Preview(){ return <div/> }

export default class CreateProject extends React.Component {

    componentDidMount() {
        this.setState({
            data: ['company', 'project_manager'].reduce((data, key) => ({
                [key]: $('#project-root').data(key),
                ...data
            }), {})
        })
    }

    save = (e) => {
        if(e) e.preventDefault();
        this.setState({ is_loading: true });
        $.ajax({
            url: loom_api.project,
            method: 'POST',
            data: objectToFormData(this.state.data),
            contentType: false,
            processData: false,
            success: result => {
                window.result = result
                window.location = `/project/${result.id}/`;
            }
        });
    }

    state = {
        is_loading: false, 
        currentSection: 'basics',
        sections: ['basics', 'details', 'budget', 'preview', 'post'],
        data: {}
    }

    currentSectionIsValid = _ => true

    sectionAction = event => {
        event.preventDefault();
        if(this.currentSectionIsValid()){
            let { currentSection, sections } = this.state
            let index = sections.indexOf(currentSection)
            if(index >= sections.length - 1){
                this.save()
            } else {
                this.setState({currentSection: sections[index + 1]})
            }
        }
    }
    
    fieldUpdater = (field) => {
        return ({value, event}) => {
            value = value || event.target.value
            this.setState({ data: Object.assign(this.state.data, {[field]: value }) })
            if(event)
                event.preventDefault();
        }
    }

    fieldUpdateMap = (...fields) => {
        return fields.reduce((actions, field) => {
            actions[field] = this.fieldUpdater(field)
            return actions
        }, {})
    }

    render(){
        return (
            <div className={`sections ${this.state.currentSection} is active`}>
                <ProgressBar/>
                <form id="project-form" method="post" enctype="multipart/form-data">
                    { this.props.csrf_token }
                    <Basics className='basics section' update={this.fieldUpdateMap(
                        'title', 'type', 'overview', 'start_date', 'end_date', 'skills')}/>

                    <Details className='details section' update={this.fieldUpdateMap('details', 'info')}/>

                    <Budget className='budget section' update={this.fieldUpdateMap(
                        'estimated_hours', 'estimated_cash', 'estimated_equity', 'confidential_info')}/>

                    <Preview className='preview section' />

                    <div className='text-center form-group col-md-12'>
                        <Button type='submit' bsClass='btn btn-step' onClick={this.sectionAction}>Save Project and Continue</Button>
                    </div>
                </form>
            </div>
        )
    }
}
