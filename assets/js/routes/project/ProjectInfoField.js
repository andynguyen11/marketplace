import React from 'react';
import {MultipleAttachmentsField, mergeAttachments} from './AttachmentField';
import {BigFormGroup, toTitle} from './FormUtils';
import {Checkbox} from 'react-bootstrap';
import Quill from '../../components/editor/Quill'

function quillConf({id, type}) {
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
