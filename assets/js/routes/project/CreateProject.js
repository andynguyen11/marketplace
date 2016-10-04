import React from 'react';
import { objectToFormData } from './utils';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Loader from '../../components/loadScreen';
import { createHashHistory } from 'history';
import { Router, Route, IndexRedirect, Link, useRouterHistory, withRouter } from 'react-router';
import classNames from 'classnames';
import momentPropTypes from 'react-moment-proptypes';
import Quill from '../../components/editor/Quill';
import FormHelpers from '../../utils/formHelpers';

const processApiError = (apiError) => {
  const { title } = apiError;
  let errorText = 'Something went wrong! Please try again.';

  if(title) {
    if(Array.isArray(title)){
      const thisError = title[0]
      if(thisError === 'Project with this title already exists.') {
        errorText = 'A project with this name already exists!'
      }
    }
  }

  console.warn(errorText);
  return errorText;
};

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
        <label className="control-label">Do you have a technical language preference for this project? (OPTIONAL)</label>
        <p className="text-muted small">
          Do you need your project coded in a specific language? If you don’t have a preference or you don’t know, no sweat, you can leave this section blank.
        </p>
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

const ApiError = React.createClass({
  getInitialState() {
    return {
      errorMessage: ''
    };
  },

  componentWillMount() {
    const { error } = this.props;
    const errorMessage = processApiError(error);

    this.setState({ errorMessage });
  },

  render() {
    const { errorMessage } = this.state;

    return <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> {errorMessage}</div>;
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
    const { className, inputDisabled, config: { name, label, value, options, error } } = this.props;
    const formGroupClass = classNames('form-group', className, { 'has-error': !!error });
    const radioError = error && <InputError>{error}</InputError>;

    const radioButtons = options && options.map((option, i) => {
      const attrChecked = { checked: value === option.id };
      const attrDisabled = (!!option.disabled || inputDisabled) && { disabled: option.disabled };
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
  return projectId ? '/' + projectId + '/' + path : '/' + path;
};

const ProgressBar = React.createClass({
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
        'progressBar-item--complete': isComplete || (!isActive && isEditing),
        'progressBar-item--active': isActive,
        'progressBar-item--disabled': isDisabled
      });
      const index = i + 1;
      const link = getProjectCreationLink(route.path, projectId);
      const dot = isDisabled || isActive ? <div className="progressBar-item-dot">{index}</div> : <div className="progressBar-item-dot"><i className="fa fa-check" aria-hidden="true"></i></div>;
      const item = isDisabled || isActive ? <span className="progressBar-item-noLink">{dot} {route.path}</span> : <Link to={link}>{dot} {route.path}</Link>;

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
        errorCallback(xhr.responseJSON || xhr.responseText);
      }
    });
  } else {
    console.error('`getProjectData` method expects a projectId, a successCallback and an errorCallback.');
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
        errorCallback(xhr.responseJSON || xhr.responseText);
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
        placeholder: 'Your company name + what you are trying to create. Ex: Loom iOS App',
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
      }, (error) => {
        this.setState({
          isSending: false,
          apiError: error
        });
      });
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

  componentDidMount() {
    $('html,body').scrollTop(0);
  },

  submitBasics() {
    const { data, formFields, project_image_file } = this.state;

    FormHelpers.validateForm(formFields, (valid, formFields) => {
      this.setState({ formError: !valid, apiError: false });

      if(valid) {
        this.setState({ isSending: true });

        const dataToSend = Object.assign({}, data);
        const isNewProject = !dataToSend.id;
        if (project_image_file) {
          dataToSend.project_image = project_image_file;
        } else {
          delete dataToSend.project_image;
        }

        if(window.sessionStorage.loomNewProjectId && isNewProject) {
          dataToSend.id = window.sessionStorage.loomNewProjectId;
        }

        submitProjectData(dataToSend, (result) => {

          if(isNewProject) {
            window.sessionStorage.loomNewProjectId = result.id;
          }

          this.goToDetails(result);
        }, (error) => {
          this.setState({
            isSending: false,
            apiError: error
          });
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
    const apiErrorMessage = apiError && <ApiError error={apiError} />;

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

  formFields(loadedData) {
    const initialState = loadedData || this.state.data;

    return {
      projectBackground: {
        name: 'project_background',
        label: 'Project Background (MINIMUM 140 CHARACTERS)',
        value: initialState.background || '',
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
        label: 'What\'s the current status of the project? (MINIMUM 140 CHARACTERS)',
        value: initialState.progress || '',
        helperText: <span>Do you have funding? Do you have existing designs, wireframes and/or prototypes for the idea? Do you have an existing website or product that you're creating a new feature for?</span>,
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
        label: 'What do you need a developer to do? (MINIMUM 140 CHARACTERS)',
        value: initialState.scope || '',
        helperText: <span>This is where you should outline the scope of the project.<br/><br/>Think about the project from beginning to end and be as specific as you can about what you expect to be done.</span>,
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
        label: 'What are the project milestones? (MINIMUM 140 CHARACTERS)',
        value: initialState.milestones || '',
        helperText: 'Include all project milestones and accompanying dates. Have important meetings scheduled? Need certain deliverables on specific dates? List them here. It’s important to make clear all of your milestones to developers reviewing your project.',
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
        label: <span>What are the deliverables and specs? (MINIMUM 140 CHARACTERS)</span>,
        value: initialState.specs || '',
        helperText: <span>List all deliverables and required specs for each. This info is important to help developers scope the project.</span>,
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
        label: 'Private Project Tab',
        value: initialState.private_info || '',
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

    if(projectId){
      getProjectData(projectId, (result) => {
        const data = Object.assign({}, defaultProjectState.data, result);
        const formFields = this.formFields(data);

        this.setState({
          data,
          formFields,
          isLoading: false
        });
      }, (error) => {
        this.setState({
          isSending: false,
          apiError: error
        });
      });
    }else{
      if (state && state.data) {
        const formFields = this.formFields();
        const data = Object.assign({}, defaultProjectState.data, state.data);

        this.setState({
          data,
          formFields,
          isLoading: false
        });
      } else {
        router.replace('/');
      }
    }
  },

  componentDidMount() {
    $('html,body').scrollTop(0);
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
        }, (error) => {
          this.setState({
            isSending: false,
            apiError: error
          });
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
    const apiErrorMessage = apiError && <ApiError error={apiError} />;

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

        <WYSIWYG config={formFields.projectSpecs} inputDisabled={isSending} />

        <WYSIWYG config={formFields.projectMilestones} inputDisabled={isSending} />

        <div className="newProject-private-info-header">
          <h4>Private Project Info <span className="text-muted">(optional)</span> <i className="fa fa-lock" aria-hidden="true"></i></h4>
          <p>The private details tab is secure, and will not be seen by the public. The private details tab is unlocked for individual developers only when they sign a non-disclosure agreement.</p>
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

  formFields(loadedData) {
    const initialState = loadedData || this.state.data;

    return {
      compensationType: {
        name: 'compensationType',
        label: 'Budget Type (select one)',
        value: (() => {
          const { estimated_cash, estimated_equity_percentage, mix } = initialState;
          let compensationType = '';
          let equity = estimated_equity_percentage ? estimated_equity_percentage : '';

          if(estimated_cash && equity.length) {
            compensationType = mix ? 'cash-and-equity' : 'cash-or-equity';
          }else{
            if(estimated_cash) {
              compensationType = 'cash';
            }
            if(equity.length) {
              compensationType = 'equity';
            }
          }

          return compensationType;
        })(),
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
              formFields.equity.onChange(0);
              break;
            case 'equity':
              type = 'equity';
              data.mix = false;
              formFields.cash.onChange(0);
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
        value: initialState.estimated_cash + '',
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
        value: initialState.estimated_equity_percentage,
        error: false,
        validator: (value) => {
          const { budgetType, budgetMix, formFields } = this.state;
          const equityValue = parseFloat(value);
          const cleanValue = value ? value.toString().match(/^\d*\.?\d*$/) : '';
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

    if(projectId){
      getProjectData(projectId, (result) => {
        const data = Object.assign({}, defaultProjectState.data, result);
        const formFields = this.formFields(data);
        let budgetType = '';

        if(formFields.compensationType.value === 'cash-or-equity' || formFields.compensationType.value === 'cash-and-equity') {
          budgetType = 'cash-equity';
        }else{
          budgetType = formFields.compensationType.value;
        }

        this.setState({
          data,
          budgetType,
          formFields,
          isLoading: false
        });
      }, (error) => {
        this.setState({
          isSending: false,
          apiError: error
        });
      });
    }else{
      if (state && state.data) {
        const formFields = this.formFields();
        const data = Object.assign({}, defaultProjectState.data, state.data);
        let budgetType = '';

        if(formFields.compensationType.value === 'cash-or-equity' || formFields.compensationType.value === 'cash-and-equity') {
          budgetType = 'cash-equity';
        }else{
          budgetType = formFields.compensationType.value;
        }

        this.setState({
          data,
          budgetType,
          formFields,
          isLoading: false
        });
      } else {
        router.replace('/');
      }
    }
  },

  componentDidMount() {
    this.setCompanyState();
    $('html,body').scrollTop(0);
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
          this.goToProjectPage(result.slug);
        }, (error) => {
          this.setState({
            isSending: false,
            apiError: error
          });
        });
      }
    })
  },

  goToProjectPage(projectId) {
    delete window.sessionStorage.loomNewProjectId;
    window.location = `/project/${projectId}/`;
  },

  render() {
    const { data: { company, mix }, budgetType,formFields, isSending, isLoading, formError, apiError } = this.state;

    if(isLoading) {
      return <Loader/>;
    }

    const companyMessage = !company && <div className="alert alert-info"><strong>Want to offer equity?</strong> Register as a company in your <a href="/profile/settings/#/company" target="_blank">dashboard</a>.</div>;
    const cashInput = (budgetType === 'cash' || budgetType === 'cash-equity') && <Input config={formFields.cash} prefix="$" suffix=".00" inputDisabled={isSending} />;
    const equityInput = (budgetType === 'equity' || budgetType === 'cash-equity') && <Input config={formFields.equity} suffix="%" inputDisabled={isSending} />;
    const and = mix && 'and';
    const or = (!and && cashInput && equityInput) && 'or';
    const andOr = (and || or) && <div className="newProject-compensation-andOr">{and}{or}</div>;
    const formErrorMessage = formError && <div className="alert alert-danger"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Please fix the errors above and try again.</div>;
    const apiErrorMessage = apiError && <ApiError error={apiError} />;

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
        <RadioGroup config={formFields.compensationType} className="newProject-compensationType" inputDisabled={isSending} />
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
  componentWilllMount() {
    delete window.sessionStorage.loomNewProjectId;
  },

  render() {
    const { routes, route: { childRoutes }, params: { projectId } } = this.props;

    return (
      <div className="newProject page-content--small">
        <ProgressBar routes={routes} childRoutes={childRoutes} projectId={projectId} />
        {this.props.children}
      </div>
    )
  }
});

const browserHistory = useRouterHistory(createHashHistory)();

const NewProject = (
  <Router history={browserHistory}>
    <Route path="/(:projectId/)" component={NewProjectContainer}>
      <Route path="basics" component={ProjectBasics}/>
      <Route path="details" component={ProjectDetails}/>
      <Route path="budget" component={ProjectBudget}/>
      <IndexRedirect to="basics"/>
    </Route>
  </Router>
);

export default NewProject;
