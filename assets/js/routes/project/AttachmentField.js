import React from 'react'
import Dropzone from 'react-dropzone'
import { toTitle } from './FormUtils'

function iconPreview(icon){
    return _ => (<i className={`icon-preview fa fa-${icon}`} aria-hidden="true"/>)
}

let defaultPreviews = {
    video: ({preview, type}) => (<video controls="true"> <source src={preview} type={type}/> </video>),
    image: ({preview, type}) => (<img src={preview}/>),
    '*/*': ({preview, type}) => {
        let prefix = typeof(type) == 'string' && type.split('/')[0]
        let Preview = defaultPreviews[type] ||
            (prefix && defaultPreviews[prefix]) ||
            defaultPreviews.generic
        return Preview({preview, type})
    },
    generic: iconPreview('file'),
    'application/pdf': iconPreview('file-pdf-o'),
    zip: iconPreview('file-zip-o'),
    word: iconPreview('file-word-o'),
}

function defaultPreview(accept='*/*'){
    return defaultPreviews[accept] || defaultPreviews['*/*']
}

export function mergeAttachments(existingAttachments=[], newAttachments=[]){
    let newTags = newAttachments.map(a => a.tag)
    return [...existingAttachments.filter(a => !newTags.includes(a.tag)), ...newAttachments]
}

function UploadButton({title}){
    return (
        <div className='btn btn-brand text-center'>
            Click or drop to upload {title}
        </div>
    )
}

const AttachmentField = React.createClass({
    getInitialState(){
        return {file: null}
    },

    onDrop([file]) {
        let { tag } = this.props
        this.props.onChange([{tag, file}])
        this.setState({file})
    },

    getDefaultProps() {
        return {
            multiple: false,
            className: '',
            ref: 'dropzone',
            activeClassName: 'hover'
        }
    },

    file(){
        let { url: preview, file } = this.props.value || {}
        if(preview || file){
            return file || { preview, type: this.props.accept }
        } else {
            return this.state.file
        }
    },

    render(){
        let {
            onChange, title, tag, multiple, className,
            Preview = defaultPreview(this.props.accept), ...props
        } = this.props
        let file = this.file()
        
        title = title || toTitle(tag)
        className = `${tag} attachment-field ${file ? 'preview' : 'button'} ${className}`
        return (
            <Dropzone onDrop={this.onDrop} {...props} {...{multiple, className}}>
                { file ? (
                    <div className='preview' key={tag}>
                        { Preview(file) }
                        <span className='file-name'>{ file.name }</span>
                    </div>
                ) : <UploadButton title={title}/> }
            </Dropzone>
        )
    }
})

const MultipleAttachmentsField = React.createClass({

    getInitialState(){
        return { attachments: [] }
    },

    onDrop(files) {
        let newAttachments = files.map((file) => ({tag: file.name, file}))
        this.props.onChange(newAttachments)
        this.setState({attachments: mergeAttachments(this.state.attachments, newAttachments)})
    },

    getDefaultProps() {
        return {
            multiple: true,
            className: '',
            ref: 'dropzone',
            activeClassName: 'hover'
        }
    },

    render(){
        let { attachments } = this.state 
        let {
            onChange, title, multiple, className,
            Preview = defaultPreview(this.props.accept), ...props
        } = this.props
        
        title = title || 'Attachments'
        className = `multi attachment-field ${attachments.length ? 'preview' : 'button'} ${className}`
        return (
            <Dropzone onDrop={this.onDrop} {...props} {...{multiple, className}}>
                <div className='row'>
                    {attachments.map(({file, tag}) => (
                        <div className='col-sm-3' key={tag}>
                            <div className='preview'>
                                { Preview(file) }
                                <span className='file-name'>{ file.name }</span>
                            </div>
                        </div>
                    ))}
                    <UploadButton title={title}/>
                </div>
            </Dropzone>
        )
    }
})

const MultipleAttachmentsPreview = React.createClass({

    render(){
        let { attachments } = this.props;
        let {
            onChange, title, multiple, className,
            Preview = defaultPreview(this.props.accept), ...props
        } = this.props

        title = title || 'Attachments'
        className = `multi attachment-field ${attachments.length ? 'preview' : 'button'} ${className}`
        return (
                <div className='row'>
                    {attachments.map(({file, tag}) => (
                        <div className='col-sm-3' key={tag}>
                            <div className='preview'>
                                { Preview(file) }
                                <span className='file-name'>{ file.name }</span>
                            </div>
                        </div>
                    ))}
                </div>
        )
    }
})

export { MultipleAttachmentsField, MultipleAttachmentsPreview }
export default AttachmentField
