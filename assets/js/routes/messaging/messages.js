import React from 'react';
import ReactDOM from 'react-dom';
import TextareaAutosize from 'react-textarea-autosize';
import Loader from '../../components/loadScreen';
import FormHelpers from '../../utils/formHelpers';
import MessageAgreement from './tracker';

const MessageComposer = React.createClass({
  componentDidMount() {
    window.addEventListener('keydown', this.sendListener);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.sendListener);
  },

  onUpdate(event) {
    const { updateComposerContent } = this.props;
    const { target } = event;
    const name = target.getAttribute('name');
    const value = target.value;

    updateComposerContent(value, name);
  },

  sendListener(e) {
    const { sendMessage } = this.props;
    const textarea = ReactDOM.findDOMNode(this.refs.textarea);

    // send message when user hits enter and is focused on the textarea
    if(e.which ===  13 && !e.shiftKey && document.activeElement === textarea && textarea.value.length) {
      e.preventDefault();
      sendMessage();
    }
  },

  render() {
    const { value, name, fileUpload, attachFile, fileUploadInProgress } = this.props;

    const fileButton = fileUpload && (
      <div className="text-field-fileUpload">
        <input type="file" ref="fileInput" onChange={attachFile} />
      </div>
    );
    const disabled = {
      disabled: fileUploadInProgress
    };

    return (
      <div className="messages-thread-composer" {...disabled}>
        {fileButton}
        <TextareaAutosize minRows={1} maxRows={5} value={value} id={name} name={name} onChange={this.onUpdate} ref="textarea"></TextareaAutosize>
      </div>
    );
  }
});

const Message = React.createClass({
  render() {
    const { currentUser, avatar, text } = this.props;
    const classNames = 'messages-thread-message' + (currentUser && ' messages-thread-message-currentUser' || '');

    return (
      <div className={classNames}>
        <div className="messages-thread-message-avatar" style={ { 'backgroundImage': 'url(https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&resize_w=200&url=' + avatar + ')' } }></div>
        <pre className="messages-thread-message-text">
          {text}
        </pre>
      </div>
    );
  }
});

const Messages = React.createClass({
  propTypes: {
    threadId: React.PropTypes.number.isRequired
  },

  getInitialState() {
    return {
      message: '',
      interactions: [],
      isLoading: true,
      messageError: false,
      attachment: false,
      attachmentName: false
    }
  },

  formElements(terms) {
    return terms && {
        project: {
          name: 'project',
          label: 'Project Name',
          value: terms.project.title || ''
        },
        contractee: {
          name: 'contractee',
          label: 'Company Name',
          value: terms.contractee || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.contractee.errorClass = 'has-error';
              formErrorsList.push('Please add your company name.');
            } else {
              formElements.contractee.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.contractee = value;
            this.setState({ terms:terms });
          }
        },
        contractor: {
          name: 'contractor',
          label: 'Developer Name',
          value: terms.contractor || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.contractor.errorClass = 'has-error';
              formErrorsList.push('Please add a contractor name.');
            } else {
              formElements.contractor.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.contractor = value;
            this.setState({ terms:terms });
          }
        },
        start_date: {
          name: 'start_date',
          label: 'Project Start Date',
          value: terms.start_date || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.start_date.errorClass = 'has-error';
              formErrorsList.push('Please include a start date.');
            } else {
              formElements.start_date.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.start_date = value;
            this.setState({ terms:terms });
          }
        },
        end_date: {
          name: 'end_date',
          label: 'Project End Date',
          value: terms.end_date || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.end_date.errorClass = 'has-error';
              formErrorsList.push('Please include an end date.');
            } else {
              formElements.end_date.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.end_date = value;
            this.setState({ terms:terms });
          }
        },
        scope: {
          name: 'scope',
          label: 'Scope of Work',
          value: terms.scope || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.scope.errorClass = 'has-error';
              formErrorsList.push('Please add scope of work.');
            } else {
              formElements.scope.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.scope = value;
            this.setState({ terms:terms });
          }
        },
        deliverables: {
          name: 'deliverables',
          label: 'Deliverables and Specs',
          value: terms.deliverables || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.deliverables.errorClass = 'has-error';
              formErrorsList.push('Please add project deliverables and specs.');
            } else {
              formElements.deliverables.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.deliverables = value;
            this.setState({ terms:terms });
          }
        },
        milestones: {
          name: 'milestones',
          label: 'Project Milestones',
          value: terms.milestones || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.milestones.errorClass = 'has-error';
              formErrorsList.push('Please add project milestones.');
            } else {
              formElements.milestones.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.milestones = value;
            this.setState({ terms:terms });
          }
        },
        equity: {
          name: 'equity',
          label: 'Equity Compensation',
          value: terms.equity || ''
        },
        cash: {
          name: 'cash',
          label: 'Cash Compensation',
          value: terms.cash || ''
        },
        hours: {
          name: 'hours',
          label: 'Total Hours of Work',
          value: terms.hours || ''
        },
        schedule: {
          name: 'schedule',
          label: 'How do you want to schedule payment?',
          value: terms.schedule || '50% upfront and 50% upon completion',
          options: [
            '50% upfront and 50% upon completion',
            '50% at a halfway milestone and 50% upon completion'
          ],
          update: (value) => {
            const { terms } = this.state;
            terms.schedule = value;
            this.setState({ terms:terms });
          }
        },
        halfway: {
          name: 'halfway',
          label: 'Define the halfway milestone',
          value: terms.halfway || '',
          errorClass: '',
          validator: (value) => {
            const valid = FormHelpers.checks.isRequired(value);
            const { formElements, formErrorsList } = this.state;
            if (!valid) {
              formElements.halfway.errorClass = 'has-error';
              formErrorsList.push('Please add a halfway milestone.');
            } else {
              formElements.halfway.errorClass = '';
            }
            this.setState({ formElements, formErrorsList });
            return valid;
          },
          update: (value) => {
            const { terms } = this.state;
            terms.halfway = value;
            this.setState({ terms:terms });
          }
        }
      }
  },

  convertFromMomentToStartDate(moment) {
    const { formElements } = this.state;
    const newDate = moment.format('YYYY-MM-D');

    formElements.start_date.value = newDate;
    formElements.start_date.update(newDate);

    this.setState({ formElements });
  },

  convertFromMomentToEndDate(moment) {
    const { formElements } = this.state;
    const newDate = moment.format('YYYY-MM-D');

    formElements.end_date.value = newDate;
    formElements.end_date.update(newDate);

    this.setState({ formElements })
  },

  componentWillMount() {
    const { threadId } = this.props;

    $.ajax({
      url: loom_api.messages + threadId,
      success: (result) => {
        const currentUserId = result.current_user;
        let currentUserData;
        let otherUserData;

        result.interactions.map((interaction, i) => {
          const { sender, recipient } = interaction;
          const senderIsCurrentUser = currentUserId === sender.id;
          const recipientIsCurrentUser = currentUserId === recipient.id;

          if(senderIsCurrentUser && !currentUserData) {
            currentUserData = {
              id: currentUserId,
              photo_url: sender.photo_url,
              first_name: sender.first_name
            }
          }

          if(recipientIsCurrentUser && !currentUserData) {
            currentUserData = {
              id: currentUserId,
              photo_url: recipient.photo_url,
              first_name: recipient.first_name
            }
          }

          if(!senderIsCurrentUser && !otherUserData) {
            otherUserData = {
              id: currentUserId,
              photo_url: sender.photo_url,
              first_name: sender.first_name
            }
          }

          if(!recipientIsCurrentUser && !otherUserData) {
            otherUserData = {
              id: currentUserId,
              photo_url: recipient.photo_url,
              first_name: recipient.first_name
            }
          }
        });

        this.setState({
          currentUserData,
          otherUserData,
          currentUser: result.current_user,
          isOwner: result.is_owner,
          interactions: result.interactions || [],
          terms: result.terms,
          nda: result.nda,
          job: result.job,
          signing_url: result.signing_url,
          isLoading: false,
          messageError: false,
          formElements: this.formElements(result.terms)
        }, () => {
          this.scrollBottom();
        });
      },
      error: () => {
        this.setState({
          isLoading: false,
          messageError: 'Something went wrong with loading messages. Please reload this page.'
        })
      }
    });
  },

  componentDidMount() {
    this.startPoller();
    this.scrollBottom();
  },

  startPoller() {
    setInterval(this.updateMessages, 10000);
  },

  updateMessages() {
    const { threadId } = this.props;

    $.ajax({
      url: loom_api.messagePoller + threadId,
      success: (result) => {
        this.setState({
          interactions: result.interactions,
          messageError: false
        });
      },
      error: () => {
        this.setState({
          messageError: 'Something went wrong with loading messages. Please reload this page.'
        })
      }
    });
  },

  sendMessage() {
    const { threadId } = this.props;
    const { message, attachment } = this.state;
    const payload = {
      thread: threadId,
      body: message
    };

    if(attachment) {
      payload.attachment = attachment;
    };

    this.setState({ isLoading: true });

    $.ajax({
      url: loom_api.message,
      data: payload,
      type: 'PATCH',
      success: () => {
        const interactions = this.addMessage(payload);

        this.setState({
          interactions,
          isLoading: false,
          message: '',
          messageError: false,
          attachmentName: false,
          attachment: false
        }, () => {
          this.scrollBottom();
        });
      },
      error: () => {
        this.setState({
          isLoading: false,
          messageError: 'Something went wrong with sending your message. Please try again.'
        })
      }
    });
  },

  addMessage(payload) {
    const { interactions, currentUserData } = this.state;

    payload.sender = currentUserData;
    payload.content = payload.body;

    interactions.push(payload);

    return interactions;
  },

  // attachFile(e) {
  //   e.preventDefault();
  //   let reader = new FileReader();
  //   let file = e.target.files[0];
  //
  //   reader.onloadend = () => {
  //     console.log(reader.result, file)
  //     this.setState({
  //       attachment: reader.result,
  //       attachmentName: file.name
  //     }, () => {
  //       this.scrollBottom();
  //       this.sendMessage();
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // },

  scrollBottom() {
    const threadContainer = this.refs.thread;
    threadContainer.scrollTop = threadContainer.scrollHeight + threadContainer.offsetHeight;
  },

  updateComposerContent(value) {
    this.setState({ message: value });
  },

  render() {
    const { message, interactions, currentUser, isLoading, messageError, otherUserData, isOwner, terms, nda, job, signing_url, formElements } = this.state;
    const messages = interactions.map((interaction, i) => {
      const { content, sender } = interaction;
      const isCurrentUser = currentUser === sender.id;

      return <Message key={i} avatar={sender.photo_url} currentUser={isCurrentUser} text={content} />
    });
    const error = messageError && <div className="alert alert-danger" role="alert">{messageError}</div>;
    const otherUserName = otherUserData && 'Message with ' + otherUserData.first_name;

    return (
      <div id="messages">
        <div className="messages-thread">
          <div className="messages-topBar messages-topBar--align-center">
            {otherUserName}
          </div>
          <div className="messages-thread-content-wrapper">
            { isLoading && <Loader/> }
            <div className="messages-thread-content" ref="thread">
              {messages}
              {error}
            </div>
          </div>
          <MessageComposer fileUpload={false} attachFile={this.attachFile} value={message} updateComposerContent={this.updateComposerContent} sendMessage={this.sendMessage} />
        </div>
        <div className="messages-tracker">
          <div className="messages-topBar messages-topBar--dark">
            agreement tracker
          </div>
          { job && terms && <MessageAgreement convertFromMomentToStartDate={this.convertFromMomentToStartDate} convertFromMomentToEndDate={this.convertFromMomentToEndDate} current_user={currentUser} isOwner={isOwner} terms={terms} nda={nda} job={job} signing_url={signing_url} isLoading={isLoading} formElements={formElements}/> }
        </div>
      </div>
    );

  }
});

export default Messages;