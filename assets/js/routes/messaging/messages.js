import React from 'react';
import ReactDOM from 'react-dom';
import TextareaAutosize from 'react-textarea-autosize';
import Loader from '../../components/loadScreen';
import FormHelpers from '../../utils/formHelpers';
import MessageAgreement from './tracker';
import moment from 'moment';
import Modal from '../../components/modal';
import { objectToFormData } from '../project/utils';
import downloadjs from 'downloadjs';

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
    const { value, name, fileUpload, fileSending, fileToUpload, messageSending, onFileSelection } = this.props;

    const disabled = {
      disabled: messageSending || fileSending
    };
    const fileButton = fileUpload && (() => {
      const input = !fileToUpload && <input type="file" onChange={onFileSelection} {...disabled} />;

      return (
        <div className="text-field-fileUpload">
          {input}
        </div>
      );
    })();

    const loadingIndicator = (messageSending || fileSending) && <div className="text-field-loading"><i className="fa fa-circle-o-notch fa-spin fa-fw"></i></div>;

    return (
      <div className="thread-composer">
        {fileButton}
        <TextareaAutosize minRows={1} maxRows={5} value={value} id={name} name={name} onChange={this.onUpdate} ref="textarea" {...disabled}></TextareaAutosize>
        {loadingIndicator}
      </div>
    );
  }
});

const Message = React.createClass({
  render() {
    const { currentUser, avatar, text, senderName, timestamp, profileUrl } = this.props;
    const classNames = 'thread-item' + (currentUser && ' thread-item-currentUser' || '');
    const formattedTime = moment(timestamp).format('MMM D, h:mm a');
    const senderLink = <a href={profileUrl}>{senderName}</a>;
    const senderAvatar = {
      backgroundImage: 'url(https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&resize_w=200&url=' + avatar + ')'
    };

    return (
      <div className={classNames}>
        <a href={profileUrl} className="thread-item-avatar" style={senderAvatar}></a>
        <div className="thread-item-content">
          <pre className="thread-item-message">
            {text}
          </pre>
          <div className="thread-item-meta">
            {senderLink} - {formattedTime}
          </div>
        </div>
      </div>
    );
  }
});

const Attachment = React.createClass({
  triggerDownload(event) {
    const { attachment } = this.props;
    event.preventDefault();

    downloadjs(attachment.url);
  },

  deleteClicked() {
    const { confirmAttachmentDeletion, attachment } = this.props;

    confirmAttachmentDeletion(attachment);
  },

  render() {
    const { currentUser, avatar, attachment, senderName, timestamp, profileUrl } = this.props;
    const classNames = 'thread-item' + (currentUser && ' thread-item-currentUser' || '');
    const formattedTime = moment(timestamp).format('MMM D, h:mm a');
    const senderLink = <a href={profileUrl}>{senderName}</a>;
    const senderAvatar = {
      backgroundImage: 'url(https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&resize_w=200&url=' + avatar + ')'
    };

    return (
      <div className={classNames}>
        <a href={profileUrl} className="thread-item-avatar" style={senderAvatar}></a>
        <div className="thread-item-content">
          <div className="thread-item-attachment">
            <a className="thread-item-attachment-icon" onClick={this.triggerDownload}></a>
            <div className="thread-item-attachment-title">{attachment.tag}</div>
            <a onClick={this.triggerDownload} className="thread-item-attachment-filename" alt={attachment.original_name}>{attachment.original_name}</a>
            <div className="thread-item-attachment-actions">
              {/*<a onClick={this.deleteClicked} className="thread-item-attachment-delete" alt={attachment.original_name}>delete {attachment.original_name}</a>*/}
              <a onClick={this.triggerDownload} className="thread-item-attachment-download" alt={attachment.original_name}>download {attachment.original_name}</a>
            </div>
          </div>
          <div className="thread-item-meta">
            Uploaded by {senderLink} - {formattedTime}
          </div>
        </div>
      </div>
    );
  }
});

const MessageHelper = React.createClass({
	getInitialState() {
		return {
			dismissForever: false
		};
	},

	dismissForever() {
		const { dismissForever } = this.state;

		this.setState({ dismissForever: !dismissForever });
	},

  dismissHelper() {
    const { onDismiss, isProjectOwner } = this.props;
    const { dismissForever } = this.state;

		onDismiss(isProjectOwner, dismissForever);
  },

  render() {
    const { isProjectOwner } = this.props;
		const { dismissForever } = this.state;

		const ownerMessage = (
			<div>
				<p><span className="brand-color">Did you know?</span> Each message thread contains an agreement tracker to help streamline the contract process and get you working faster.</p>
				<p>When you find a freelancer you like, send a non-disclosure agreement to legally protect your ideas and provide access to your private project information. Then, when you're ready to hire the freelancer, you can build a contract and send for signature.</p>
			</div>
		);
		const talentMessage = (
			<div>
				<p><span className="brand-color">Did you know?</span> Each message thread contains an agreement tracker to help streamline the contract process and get you working faster. When project owners send you non-disclosure agreements and work contracts they will appear in the panel on the right side of each message.</p>
			</div>
		);
    const message = isProjectOwner ? ownerMessage : talentMessage;

    return (
      <div className="thread-messageHelper">
				{message}
        <button className="btn btn-brand" onClick={this.dismissHelper}>Okay, I understand</button>
				<div className="checkbox">
					<label>
						<input type="checkbox" onClick={this.dismissForever} checked={dismissForever}/> Don't show again on this computer.
					</label>
				</div>
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
      messageSending: false,
      attachmentModalIsOpen: false,
      attachmentDeleteModalIsOpen: false,
      fileToUpload: null,
      fileToUploadTitle: null,
      fileSending: false,
      showPanel: false,
      attachment: false,
      attachmentName: false,
      formErrorsList: []
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
    const newDate = moment.format('YYYY-MM-DD');

    formElements.start_date.value = newDate;
    formElements.start_date.update(newDate);

    this.setState({ formElements });
  },

  convertFromMomentToEndDate(moment) {
    const { formElements } = this.state;
    const newDate = moment.format('YYYY-MM-DD');

    formElements.end_date.value = newDate;
    formElements.end_date.update(newDate);

    this.setState({ formElements })
  },

  getMessageHelperStatus() {
    const { loom_hideMessageHelperOwner, loom_hideMessageHelperTalent } = window.localStorage;

    this.setState({
      hideMessageHelperOwner: !!loom_hideMessageHelperOwner,
      hideMessageHelperTalent: !!loom_hideMessageHelperTalent
    });
  },

	dismissMessageHelper(isProjectOwner, dismissForever) {
  	let helperKey = null;
		let storageKey = null;

  	if(isProjectOwner) {
  		helperKey = 'hideMessageHelperOwner';

			if(dismissForever) {
				storageKey = 'loom_hideMessageHelperOwner';
			}
		}else{
			helperKey = 'hideMessageHelperTalent';

			if(dismissForever) {
				storageKey = 'loom_hideMessageHelperTalent';
			}
		}

		if(helperKey){
			this.setState({ [helperKey]: true });
		}

		if(storageKey){
			window.localStorage.setItem(storageKey, true);
		}
	},

  componentWillMount() {
    this.getMessageHelperStatus();
    this.fetchThread();
  },

  componentDidMount() {
    this.startPoller();
    this.scrollBottom();
  },

  fetchThread() {
    const { threadId } = this.props;
    const { messageSending, showPanel } = this.state;

    if(!messageSending && !showPanel) {
      $.ajax({
        url: loom_api.messages + threadId + '/',
        success: (result) => {
          const { messageSending, showPanel } = this.state;
          const currentUserId = result.current_user;
          let currentUserData;
          let otherUserData;

          result.interactions.map((interaction, i) => {
            const {sender, recipient, interactionType} = interaction;

            // TODO Will need to rethink how we handle different interaction types
            if (interactionType === 'message') {
              const senderIsCurrentUser = currentUserId === sender.id;
              const recipientIsCurrentUser = currentUserId === recipient.id;

              if (senderIsCurrentUser && !currentUserData) {
                currentUserData = {
                  id: sender.id,
                  photo_url: sender.photo_url,
                  first_name: sender.first_name
                }
              }

              if (recipientIsCurrentUser && !currentUserData) {
                currentUserData = {
                  id: recipient.id,
                  photo_url: recipient.photo_url,
                  first_name: recipient.first_name
                }
              }

              if (!senderIsCurrentUser && !otherUserData) {
                otherUserData = {
                  id: sender.id,
                  photo_url: sender.photo_url,
                  first_name: sender.first_name
                }
              }

              if (!recipientIsCurrentUser && !otherUserData) {
                otherUserData = {
                  id: recipient.id,
                  photo_url: recipient.photo_url,
                  first_name: recipient.first_name
                }
              }
            }
          });

          if(!messageSending && !showPanel) {
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
          }
        },
        error: () => {
          this.setState({
            isLoading: false,
            messageError: 'Something went wrong with loading messages. Please reload this page.'
          })
        }
      });
    }
  },

  startPoller() {
    setInterval(this.fetchThread, 10000);
  },

  updateMessages() {
    const { threadId } = this.props;
    const { messageSending, showPanel, interactions } = this.state;
    const interactionCount = interactions.length;

    if(!messageSending && !showPanel) {
      $.ajax({
        url: loom_api.messagePoller + threadId + '/',
        success: (result) => {
          this.setState({
            interactions: result.interactions,
            messageError: false
          }, () => {
            if(interactionCount !== result.interactions.length){
              this.scrollBottom();
            }
          });
        },
        error: () => {
          this.setState({
            messageError: 'Something went wrong with loading messages. Please reload this page.'
          })
        }
      });
    }
  },

  sendMessage() {
    const { threadId } = this.props;
    const { message, attachment } = this.state;
    const payload = {
      thread: threadId,
      body: message
    };

    this.setState({ messageSending: true });

    $.ajax({
      url: loom_api.message,
      data: payload,
      type: 'PATCH',
      success: () => {
        const interactions = this.addMessage(payload);
        this.updateInteractions(interactions);
      },
      error: () => {
        this.setState({
          isLoading: false,
          messageError: 'Something went wrong with sending your message. Please try again.',
          messageSending: false
        })
      }
    });
  },

  addMessage(payload) {
    const { interactions, currentUserData } = this.state;

    payload.sender = currentUserData;
    payload.content = payload.body;
    payload.interactionType = 'message';

    interactions.push(payload);

    return interactions;
  },

  updateInteractions(interactions) {
    this.setState({
      interactions,
      isLoading: false,
      message: '',
      messageError: false,
      messageSending: false,
      attachmentName: false,
      attachment: false
    }, () => {
      this.scrollBottom();
    });
  },

  handleChange(event) {
    const { formElements } = this.state;
    const { value } = event.target;
    const fieldName = event.target.getAttribute('name');

    formElements[fieldName].update(value);
    formElements[fieldName].value = value;

    this.setState({ formElements, formError: false });
  },

  agreeTerms() {
    const { terms } = this.state;
    $.ajax({
      url: loom_api.termsAgree,
      method: 'POST',
      data: JSON.stringify({ terms_id: terms.id }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (result) {
        this.setState({
          isLoading: false,
          showPanel: false,
          terms: result
        });
      }.bind(this)
    });
  },

  saveTerms() {
    const { formElements, terms } = this.state;

    this.setState({ formErrorsList: [] }, () => {
      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({ formElements, apiError: false });
        terms.status = terms.status == 'agreed' ? terms.status : 'sent';
        if (valid) {
          this.setState({ formError: false, isLoading: true });
          $.ajax({
            url: loom_api.terms + terms.id + '/',
            method: 'PATCH',
            data: JSON.stringify(terms),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (result) {
              this.setState({
                isLoading: false,
                showPanel: false
              });
            }.bind(this),
            error: (xhr, status, error) => {
              this.setState({ apiError: 'Unknown Error: ' + xhr.responseText, isLoading: false });
            }
          });
        } else {
          this.setState({ formError: 'Please fill out all fields.' });
        }
      });
    });
  },

  updateNDA(e) {
    const { nda, job, terms } = this.state;
    this.setState({ ndaUpdating: true, showPanel: true });
    nda.status = $(e.currentTarget).data('status');
    $.ajax({
      url: loom_api.documentDetails(terms.project.id, job.id, nda.id),
      method: 'PATCH',
      data: JSON.stringify(nda),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (result) {
        this.setState({
          nda: result,
          ndaUpdating: false,
          showPanel: false
        });
      }.bind(this)
    });
  },

  updateJob(job) {
    this.setState({
      job
    })
  },

  togglePanel(show) {
    this.setState({
      showPanel: show
    });
  },

  scrollBottom() {
    const threadContainer = this.refs.thread;
		if(threadContainer){
			threadContainer.scrollTop = threadContainer.scrollHeight + threadContainer.offsetHeight;
		}
  },

  updateComposerContent(value) {
    this.setState({ message: value });
  },

  getProfileUrl(userId) {
    return '/profile/' + userId + '/';
  },

  onFileSelection(event) {
    event.preventDefault();
    let file = event.target.files[0];
    this.setState({
      fileToUpload: file,
      fileToUploadTitle: ''
    }, () => {
      this.openAttachmentModal();
    });
  },

  updateFileName(event) {
    const { target } = event;
    const fileToUploadTitle = target.value;

    this.setState({ fileToUploadTitle });
  },

  uploadFile() {
    const { fileToUpload, fileToUploadTitle } = this.state;
    const { threadId } = this.props;

    const payload = {
      thread: threadId,
      attachment: fileToUpload,
      tag: fileToUploadTitle
    };

    this.setState({
      fileError: false,
      fileSending: true
    });

    $.ajax({
      url: loom_api.message,
      data: objectToFormData(payload),
      type: 'PATCH',
      contentType: false,
      processData: false,
      success: (result) => {
        this.setState({
          fileSending: false,
          fileToUpload: null,
          fileToUploadTitle: ''
        }, () => {
          this.updateInteractions(result.interactions);
          this.closeAttachmentModal();
        });
      },
      error: (result) => {
        this.setState({
          fileError: result.responseText ? result.responseText : 'Something went wrong with uploading your attachment. Please try again.',
          file: false,
          fileSending: false,
        });
      }
    });

  },

  openAttachmentModal() {
    this.setState({ attachmentModalIsOpen: true });
  },

  closeAttachmentModal() {
    const { fileSending } = this.state;

    if(!fileSending) {
      this.setState({
        attachmentModalIsOpen: false,
        fileToUpload: null,
        fileError: false
      });
    }
  },

  confirmAttachmentDeletion(attachment) {
    // ajax
    console.warn('delete', attachment);
    this.openDeleteModal(attachment);
  },

  cancelFileDeletion() {
    this.closeDeleteModal();
  },

  deleteAttachment(id) {
    this.setState({
      isLoading: true,
      deleteError: null
    });

    $.ajax({
      url: loom_api.message,
      data: objectToFormData(id),
      type: 'DELETE',
      contentType: false,
      processData: false,
      success: (result) => {
        this.closeDeleteModal();
      },
      error: () => {
        this.setState({
          isLoading: false,
          deleteError: 'Something went wrong with deleting your attachment. Please try again.'
        })
      }
    });
    this.closeDeleteModal();
  },

  openDeleteModal(file) {
    this.setState({
      attachmentDeleteModalIsOpen: true,
      fileToDelete: file,
      fileToDeleteName: file.original_name,
    });
  },

  closeDeleteModal() {
    this.setState({
      attachmentDeleteModalIsOpen: false,
      fileToDelete: null,
      fileToDeleteName: null
    });
  },

  render() {
    const {
      message,
      messageSending,
      interactions,
      currentUser,
      isLoading,
      messageError,
      otherUserData,
      terms,
      job,
      showPanel,
      attachmentDeleteModalIsOpen,
      attachmentModalIsOpen,
      fileError,
      fileSending,
      fileToUpload,
      fileToUploadTitle,
      fileToDeleteName,
      hideMessageHelperOwner,
      hideMessageHelperTalent,
      isOwner
    } = this.state;

		if(isLoading) {
			return <Loader/>;
		}

    const { threadId } = this.props;
    const messages = interactions.map((interaction, i) => {
      const { content, sender, timestamp, attachment, interactionType } = interaction;
      if (interactionType === 'message') {
        const isCurrentUser = currentUser === sender.id;
        const profileUrl = this.getProfileUrl(sender.id);
        return <Message key={i} avatar={sender.photo_url} currentUser={isCurrentUser} text={content} senderName={sender.first_name} timestamp={timestamp} profileUrl={profileUrl} />
      }

      if(interactionType === 'attachment') {
        const isCurrentUser = currentUser === sender.id;
        const profileUrl = this.getProfileUrl(sender.id);
        return <Attachment key={i} avatar={sender.photo_url} currentUser={isCurrentUser} attachment={attachment} senderName={sender.first_name} timestamp={timestamp} profileUrl={profileUrl} updateInteractions={this.updateInteractions} confirmAttachmentDeletion={this.confirmAttachmentDeletion} />
      }
    });
    const error = messageError && <div className="alert alert-danger" role="alert">{messageError}</div>;
    const attachmentError = fileError && <div className="alert alert-danger" role="alert">{fileError}</div>;
    const otherUserProfileUrl = otherUserData && this.getProfileUrl(otherUserData.id);
    const otherUserProfileLink = otherUserData && <a href={otherUserProfileUrl}>{otherUserData.first_name}</a>;
    const otherUserName = otherUserData && <span>Message with <span className="text-brand">{otherUserProfileLink}</span></span>;

    const fileUploadModal = fileToUpload && (() => {
      const disabled = fileSending && { disabled: true };

      return (
        <Modal open={attachmentModalIsOpen} onClose={this.closeAttachmentModal} header="Upload a File">
          <div>
            <div className="form-group">
              <label className="control-label">file name:</label>
              <div className="messages-upload-modal-attachmentName"> {fileToUpload.name}</div>
            </div>
            <div className="form-group">
              <label htmlFor="fileToUploadTitle">Include title for this file? (optional)</label>
              <input
                className="form-control"
                type="text"
                name="fileToUploadTitle"
                id="fileToUploadTitle"
                value={fileToUploadTitle}
                onChange={this.updateFileName}
                {...disabled}
              />
              <div className="clearfix"></div>
            </div>
            <div className="messages-upload-modal-actions form-group">
              <button className="btn btn-brand btn-brand--clear" onClick={this.closeAttachmentModal} {...disabled}>
                Cancel
              </button>
              <button className="btn btn-brand" onClick={this.uploadFile} {...disabled}>
                <i className={ fileSending ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
                Upload
              </button>
            </div>
            {attachmentError}
          </div>
        </Modal>
      );
    })();

    const fileDeleteModal = (
      <Modal open={attachmentDeleteModalIsOpen} onClose={this.cancelFileDeletion} header="Delete a File">
        <p>Are you sure you want to delete <span className="messages-attachment-delete-filename">{fileToDeleteName}</span> from this discussion?</p>
        <div className="messages-upload-modal-actions">
          <button className="btn btn-brand btn-brand--clear" onClick={this.cancelFileDeletion}>Cancel</button>
          <button className="btn btn-brand" onClick={this.deleteAttachment}>Delete</button>
        </div>
      </Modal>
    );

    return (
      <div id="messages">
        <div className="messages-thread">
          <div className="messages-topBar messages-topBar--align-center">
            <a href="/profile/messages/inbox/" className="messages-back-to-list"><i className="fa fa-angle-left" aria-hidden="true"></i> back to messages</a>
            {otherUserName}
          </div>
          <div className="thread-mobile-message">For agreements and contracts, visit the desktop site.</div>
          <div className="thread-content-wrapper">
            { !hideMessageHelperOwner && isOwner && <MessageHelper isProjectOwner={true} onDismiss={this.dismissMessageHelper} /> }
            { !hideMessageHelperTalent && !isOwner && <MessageHelper isProjectOwner={false} onDismiss={this.dismissMessageHelper} /> }
            <div className="thread-content" ref="thread">
              {messages}
              {error}
            </div>
          </div>
          <MessageComposer messageSending={messageSending} threadId={threadId} fileUpload={true} value={message} updateComposerContent={this.updateComposerContent} sendMessage={this.sendMessage} onFileSelection={this.onFileSelection} fileToUpload={fileToUpload} />
        </div>
        <div className="messages-tracker">
          <div className="messages-topBar agreement-topBar">
            Agreement Tracker
          </div>
          { job && terms && <MessageAgreement
            convertFromMomentToStartDate={this.convertFromMomentToStartDate}
            convertFromMomentToEndDate={this.convertFromMomentToEndDate}
            {...this.state}
            handleChange={this.handleChange}
            agreeTerms={this.agreeTerms}
            saveTerms={this.saveTerms}
            updateNDA={this.updateNDA}
            updateJob={this.updateJob}
            showPanel={showPanel}
            togglePanel={this.togglePanel}
          /> }
        </div>

        {fileUploadModal}
        {/*{fileDeleteModal}*/}
      </div>
    );

  }
});

export default Messages;