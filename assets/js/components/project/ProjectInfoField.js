import React from 'react'
import { MultipleAttachmentsField, mergeAttachments } from './AttachmentField'
import { BigFormGroup, toTitle } from './FormUtils'
import { Checkbox } from 'react-bootstrap'
import Quill from '../editor/Quill'

function quillConf({id, type}){
   return {
        modules: { 
            toolbar: {
                container: `#toolbar-${id}`,
            },
        },
        bounds: `#project-info-${id}`,
        placeholder: `This is the ${type} longform description associated with your project.`,
        theme: 'snow',
    }
}

const ProjectInfoField = React.createClass({

    getDefaultProps() {
        return {
            data: {
                title: 'Info',
                description: undefined,
                attachments: [],
                type: 'public' // private primary
            }
        }
    },


    fieldUpdater(field){
        return (value) => {
            let data = Object.assign(this.props.data, {[field]: value })
            this.props.update({value: data})
        }
    },

    updateOnEvent(field){
        let updater = this.fieldUpdater(field)
        return event => {
            event.preventDefault()
            return updater(event.target.value)
        }
    },

    updateType(){
        this.fieldUpdater('type')(this.props.data.type == 'public' ? 'private' : 'public')
    },

    attachmentUpdater(newAttachments){
        let updater = this.fieldUpdater('attachments')
        let { attachments = [] } = this.props.data
        updater(mergeAttachments(attachments, newAttachments))
    },

    render(){
        let {update, id, data: {title, type}, className='', ...props} = this.props
        return (
            <div id={`project-info-${id}`} className={`project-info ${className} ${type}`} {...props}>
                {/* Hidden by css for className='primary' */}
                 <Checkbox checked={type == 'private'} onClick={this.updateType} readOnly={true} className='type-switch'>
                     Private
                 </Checkbox>
                {/* Hidden by css for className='primary' */}
                <BigFormGroup label="Title" className="col-md-8 col-md-offset-2 info-title">
                    <input type="text" className="form-control" 
                        value={title}
                        onChange={this.updateOnEvent("title")}
                        placeholder="" />
                </BigFormGroup>
                <BigFormGroup label={type == 'primary' ? 'Details' : `${toTitle(type)} Info`}>
                    <Quill config={quillConf({id, type})} className="description" onChange={this.fieldUpdater("description")}
                         />
                    <MultipleAttachmentsField onChange={this.attachmentUpdater} />
                </BigFormGroup>
            </div>
        )
    }
})

export default ProjectInfoField 
