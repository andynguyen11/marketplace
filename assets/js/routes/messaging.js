import React from 'react';
import ReactDOM from 'react-dom';
import ContractBuilder from '../components/messaging/contractBuilder';
import ContracteeTracker from '../components/messaging/contractee';
import ContractorTracker from '../components/messaging/contractor';
import Checkout from '../components/payment/checkout';
import FormHelpers from '../utils/formHelpers';
import _ from 'lodash';

(function(){

  const contractDiv = document.getElementById('contract_container');

  const Messaging = React.createClass({

    getInitialState() {
      return {
        isLoading: true,
        showTerms: false,
        showNDA: false,
        showCheckout: false,
        order: null
      };
    },

    componentWillMount() {
      $.ajax({
        url: loom_api.messages + $('#contract_container').data('thread'),
        success: function (result) {
          this.setState({
            isOwner: result.is_owner,
            terms: result.terms,
            nda: result.nda,
            job: result.job,
            isLoading: false,
            formElements: this.formElements(result.terms)
          });
        }.bind(this)
      });
    },

    formElements(terms) {

      return {
        project: {
          name: 'project',
          label: 'Project Name',
          value: terms.project || '',
          validator: FormHelpers.checks.isRequired,
          update: (value) => {
            const { terms } = this.state;
            terms.project = value;
            this.setState({ terms:terms });
          }
        },
        contractee: {
          name: 'contractee',
          label: 'Company Name',
          value: terms.contractee || '',
          validator: FormHelpers.checks.isRequired,
          update: (value) => {
            const { terms } = this.state;
            terms.contractee = value;
            this.setState({ terms:terms });
          }
        },
        contractor: {
          name: 'contractor',
          label: 'Contractor Name',
          value: terms.contractor || '',
          validator: FormHelpers.checks.isRequired,
          update: (value) => {
            const { terms } = this.state;
            terms.contractor = value;
            this.setState({ terms:terms });
          }
        },
        start_date: {
          name: 'start_date',
          label: 'Start Date',
          value: terms.start_date || '',
          validator: FormHelpers.checks.isRequired,
          update: (value) => {
            const { terms } = this.state;
            terms.start_date = value;
            this.setState({ terms:terms });
          }
        },
        end_date: {
          name: 'end_date',
          label: 'End Date',
          value: terms.end_date || '',
          validator: FormHelpers.checks.isRequired,
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
          update: (value) => {
            const { terms } = this.state;
            terms.deliverables = value;
            this.setState({ terms:terms });
          }
        },
        milestones: {
          name: 'milestones',
          label: 'Project Milestones',
          value: terms.deliverables || '',
          update: (value) => {
            const { terms } = this.state;
            terms.milestones = value;
            this.setState({ terms:terms });
          }
        },
        compensation_type: {
          name: 'compensation_type',
          label: 'Compensation Type',
          value: terms.compensation_type || '',
          update: (value) => {
            const { terms } = this.state;
            terms.compensation_type = value;
            this.setState({ terms:terms });
          }
        },
        equity: {
          name: 'equity',
          label: 'Equity',
          value: terms.equity || ''
        },
        cash: {
          name: 'cash',
          label: 'Cash',
          value: terms.cash || ''
        },
        schedule: {
          name: 'schedule',
          label: 'How do you want to schedule payment?',
          value: terms.schedule || '',
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
          update: (value) => {
            const { terms } = this.state;
            terms.halfway = value;
            this.setState({ terms:terms });
          }
        }
      }
    },

    handleChange(event) {
      const { formElements } = this.state;
      const { value } = event.target;
      const fieldName = event.target.getAttribute('name');

      formElements[fieldName].update(value);
      formElements[fieldName].value = value;

      this.setState({ formElements, formError: false });
    },

    saveTerms() {
      const { formElements, terms } = this.state;

      FormHelpers.validateForm(formElements, (valid, formElements) => {
        this.setState({formElements});

        terms.status = 'sent';
        if (valid) {
          this.setState({ formError: false, isLoading: true });
          $.ajax({
            url: loom_api.terms + terms.id + '/',
            method: 'PATCH',
            data: JSON.stringify(terms),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (result) {

            }.bind(this)
          });
        } else {
          this.setState({ formError: 'Please fill out all fields.' });
        }
      });
    },

    sendNDA() {
      let nda = this.state.conversation.nda;
      nda.status = 'sent';
      this.updateNDA(nda);
    },

    signNDA() {
      let nda = this.state.conversation.nda;
      nda.status = 'signed';
      this.updateNDA(nda);
    },

    updateNDA(nda) {
      $.ajax({
        url: loom_api.document + nda.id + '/',
        method: 'PATCH',
        data: JSON.stringify(nda),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
          let conversation = this.state.conversation;
          conversation.nda = result;
          this.setState({
            conversation: conversation,
            isLoading: false
          });
        }.bind(this)
      });
    },

    toggleTermsPanel() {
      this.setState({
        showTerms: !this.state.showTerms,
        showNDA: this.state.showNDA && this.state.showTerms,
        showCheckout: this.state.showCheckout && this.state.showTerms
      });
    },

    toggleNDAPanel() {
      this.setState({
        showNDA: !this.state.showNDA,
        showTerms: this.state.showTerms && this.state.showNDA,
        showCheckout: this.state.showCheckout && this.state.showNDA
      });
    },

    toggleCheckoutPanel() {
      if (!this.state.order) {
        this.setState({ isLoading: true });
        $.ajax({
        url: loom_api.order,
        data: {job: this.state.job.id},
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            this.setState({
              order: result,
              isLoading: false,
              showCheckout: !this.state.showCheckout,
              showTerms: this.state.showTerms && this.state.showCheckout,
              showNDA: this.state.showNDA && this.state.showCheckout
            });
          }.bind(this)
        });
      }
      else {
        this.setState({
          showCheckout: !this.state.showCheckout,
          showTerms: this.state.showTerms && this.state.showCheckout,
          showNDA: this.state.showNDA && this.state.showCheckout
        });
      }
    },

    render() {
      const { nda, terms, formElements, formError, isLoading, showNDA, showTerms, showCheckout, order, isOwner } = this.state;

      return (
        <div>
          <div className="col-md-8">
            <div className={ showTerms ? "panel panel-default" : "hidden"}>
              <div className="panel-heading text-skinny">
                <h4 >Master Services Agreement <button onClick={this.toggleTermsPanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>

              </div>
                {
                  isLoading ||
                  <ContractBuilder
                    terms={terms}
                    formElements={formElements}
                    formError={formError}
                    handleChange={this.handleChange}
                    saveTerms={this.saveTerms}
                  />
                }

            </div>
            <div className={ showNDA ? "panel panel-default" : "hidden"}>
              <div className="panel-heading text-skinny">
                <h4>Non-Disclosure Agreement</h4>
              </div>
            </div>
            <div className={ showCheckout ? "panel panel-default" : "hidden"}>
              <div className="panel-heading text-skinny">
                <h4 >Sign and Send Contract <button onClick={this.toggleCheckoutPanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>

              </div>
                {
                  isLoading ||
                  <Checkout
                    order={order}
                    isLoading={isLoading}
                  />
                }

            </div>
          </div>
            {
              isOwner ?
              <ContracteeTracker
                isLoading={isLoading}
                terms={terms}
                nda={nda}
                sendNDA={this.sendNDA}
                toggleTermsPanel={this.toggleTermsPanel}
                toggleCheckoutPanel={this.toggleCheckoutPanel}
                showTerms={showTerms}
              /> :
              <ContractorTracker
              isLoading={isLoading}
              terms={terms}
              nda={nda}
              sendNDA={this.sendNDA}
              toggleTermsPanel={this.toggleTermsPanel}
              toggleCheckoutPanel={this.toggleCheckoutPanel}
              showTerms={showTerms}
            />

            }
          <div className="clearfix"></div>
        </div>
      );
    }

  });

  ReactDOM.render(<Messaging />, contractDiv);

    $('.message-bookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_bookmark,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-bookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_bookmark,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.message-unbookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unbookmark,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-unbookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unbookmark,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.message-archive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_archive,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-archive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_archive,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.message-unarchive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unarchive,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-unarchive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unarchive,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $("#message-form").on("submit", function(e) {
      $.ajax({
        url: loom_api.message_send,
        method: 'POST',
        data: $(e.currentTarget).serialize(),
        success: function() {
          $('#message-modal').modal('hide');
        }
      });
    return false;
  });

  $("#send-bid").on("click", function(e) {
      $.ajax({
        url: loom_api.job,
        method: 'POST',
        data: {
          message: $('#id_message').val(),
          equity: $('#id_equity').val(),
          cash: $('#id_cash').val(),
          hours: $('#id_hours').val(),
          project: $('#id_project').val(),
          developer: $('#developer').val()
        },
        success: function() {
          $('#bid-modal').modal('hide');
          $("input[type='text']").val('');
          $('textarea').val('');
        }
      });
    return false;
  });

})();