import React from 'react';
import {MultipleAttachmentsField, mergeAttachments} from './AttachmentField';
import {BigFormGroup, toTitle} from './FormUtils';
import {Checkbox} from 'react-bootstrap';
import Quill from '../../components/editor/Quill'

function quillConf({id, type}) {
  const primary_placeholder = "This is the public long-form description of your project. This is where you should get really detailed to help developers understand what you’re trying to build and how much they should bid on your project.  You can add text and images to this field."
  const private_placeholder = "The private information tab is secure and can only be unlocked by a developer you approve, after they sign a non-disclosure agreement."
  let placeholder = (type == 'primary') ? primary_placeholder : private_placeholder;
  return {
    modules: {
      toolbar: {
        container: `#toolbar-${id}`,
      },
    },
    bounds: `#project-info-${id}`,
    placeholder: placeholder,
    theme: 'snow',
  }
}

const ProjectInfoField = React.createClass({

  getDefaultProps() {
    return {
      data: {
        title: 'Private Info',
        description: undefined,
        attachments: [],
        type: 'private' // private primary
      }
    }
  },

  fieldUpdater(field){
    return (value) => {
      let data = Object.assign(this.props.data, {[field]: value})
      this.props.update({value: data})
    }
  },

  render(){
    let {id, data: {description, type}, className = '', formErrors, label, placeholder} = this.props;

    return (
      <div id={`project-info-${id}`} className={`project-info ${className} ${type}`}>
        <BigFormGroup label={label} className={'form-group col-md-8 col-md-offset-2 ' + (formErrors ? formErrors : '')}>
          <Quill config={quillConf({id, type})} className="description" onChange={this.fieldUpdater("description")}
                 value={description} placeholder={placeholder}/>
        </BigFormGroup>

        <div className="clearfix"></div>

      </div>
    )
  }
})

export default ProjectInfoField;
