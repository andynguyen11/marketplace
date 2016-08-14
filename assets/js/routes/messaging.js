import React from 'react';
import ReactDOM from 'react-dom';
import Bid from '../components/bid';
import ContractBuilder from '../components/messaging/contractBuilder';
import ContracteeTracker from '../components/messaging/contractee';
import ContractorTracker from '../components/messaging/contractor';
import Checkout from '../components/payment/checkout';
import NDAPanel from '../components/nda';
import FormHelpers from '../utils/formHelpers';
import _ from 'lodash';
import {sprintf} from 'sprintf-js';

(function(){

  const contractDiv = document.getElementById('contract_container');

  const Messaging = React.createClass({

    getInitialState() {
      return {
        isLoading: true,
        showTerms: false,
        showNDA: false,
        showCheckout: false,
        showBid: false,
        order: null,
        terms: {
          status: 'new'
        },
        nda: {
          status: 'new'
        },
        job: {
          compensationType: '',
          cash: '',
          equity: '',
          hours: ''

        },
        bid_sent: false
      };
    },

    componentWillMount() {
      $.ajax({
        url: loom_api.messages + $('#contract_container').data('thread'),
        success: function (result) {
          this.setState({
            current_user: result.current_user,
            isOwner: result.is_owner,
            terms: result.terms ? result.terms : this.state.terms,
            nda: result.nda ? result.nda : this.state.nda,
            job: result.job ? result.job : this.state.job,
            bid_sent: result.job ? true : false,
            project: result.project,
            signing_url: result.signing_url,
            isLoading: false,
            formElements: result.terms ? this.formElements(result.terms) : null
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

    updateNDA(e) {
      const { nda, job } = this.state;
      const idList = {
        projectID: job.project,
        jobID: job.id,
        documentID: nda.id
      };
      nda.status = $(e.currentTarget).data('status');
      $.ajax({
        url: sprintf(loom_api.documentDetails, idList),
        method: 'PATCH',
        data: JSON.stringify(nda),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
          this.setState({
            nda: result,
            isLoading: false,
            showNDA: false
          });
        }.bind(this)
      });
    },

    updateJob(job) {
      this.setState({
        job
      })
    },

    // TODO Refactor toggle panel to tabs
    toggleTermsPanel() {
      this.setState({
        showTerms: !this.state.showTerms,
        showNDA: this.state.showNDA && this.state.showTerms,
        showCheckout: this.state.showCheckout && this.state.showTerms,
        showBid: this.state.showBid && this.state.showTerms
      });
    },

    toggleNDAPanel() {
      this.setState({
        showNDA: !this.state.showNDA,
        showTerms: this.state.showTerms && this.state.showNDA,
        showBid: this.state.showBid && this.state.showNDA
      });
    },

    toggleBidPanel() {
      this.setState({
        showBid: !this.state.showBid,
        showTerms: this.state.showTerms && this.state.showBid,
        showNDA: this.state.showNDA && this.state.showBid
      });
    },

    toggleCheckoutPanel() {
      // TODO There is probably a better way to lazy create this order
      // we just don't want it created until they hit the last step
      if (!this.state.order) {
        this.setState({ checkoutLoading: true });
        $.ajax({
        url: loom_api.order,
        data: {job: this.state.job.id},
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            this.setState({
              order: result,
              checkoutLoading: false,
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
      // TODO ummm this is a big ass list
      const { nda, current_user, bid_sent, terms, project, signing_url, formElements, formError, isLoading, showNDA, showTerms, showBid, showCheckout, order, job, isOwner, checkoutLoading } = this.state;

      const serviceAgreement = isOwner && (isLoading ||
        <div className={ showTerms ? "col-md-8 agreement-panel" : "hidden"}>
          <div className={ showTerms ? "panel panel-default" : "hidden"}>
            <div className="panel-heading text-skinny">
              <h4 >Master Services Agreement <button onClick={this.toggleTermsPanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>
            </div>
            <a onClick={this.toggleTermsPanel}><i className="fa fa-arrow-left"></i> Back to Conversation</a>
            <ContractBuilder
              terms={terms}
              formElements={formElements}
              formError={formError}
              handleChange={this.handleChange}
              saveTerms={this.saveTerms}
            />

          </div>
        </div>
      );

      const NDA = isOwner || (isLoading ||
          <div>
            <NDAPanel showNDA={showNDA} toggleNDAPanel={this.toggleNDAPanel} updateNDA={this.updateNDA} />
          </div>
      );

      const signAndSend = isOwner && (isLoading ||
        <div className={ showNDA ? "col-md-8 agreement-panel" : "hidden"}>
        <div className={ showCheckout ? "panel panel-default" : "hidden"}>
          <div className="panel-heading text-skinny">
            <h4>Sign and Send Contract <button onClick={this.toggleCheckoutPanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>
          </div>
              <a onClick={this.toggleCheckoutPanel}><i className="fa fa-arrow-left"></i> Back to Conversation</a>
              <Checkout
                order={order}
                isLoading={isLoading}
              />

        </div>
        </div>
      );

      const editBid = isOwner || (isLoading ||
          <div className={ showBid ? "col-md-8 agreement-panel" : "hidden"}>
          <div className={ showBid ? "panel panel-default" : "hidden"}>
            <div className="panel-heading text-skinny">
              <h4>Bid</h4>
            </div>
            <a onClick={this.toggleBidPanel}><i className="fa fa-arrow-left"></i> Back to Conversation</a>
            <Bid
              current_user={current_user}
              job={job}
              project={project}
              updateJob={this.updateJob}
              bid_sent={bid_sent}
            />
          </div>
          </div>
      );

      return (
        <div>

            {editBid}
            {NDA}
            {serviceAgreement}
            {signAndSend}

            { isLoading || (
              isOwner ?
              <ContracteeTracker
                isLoading={isLoading}
                terms={terms}
                nda={nda}
                signing_url={signing_url}
                updateNDA={this.updateNDA}
                toggleTermsPanel={this.toggleTermsPanel}
                toggleCheckoutPanel={this.toggleCheckoutPanel}
                showTerms={showTerms}
              /> :
              <ContractorTracker
              isLoading={isLoading}
              terms={terms}
              nda={nda}
              job={job}
              bid_sent={bid_sent}
              signing_url={signing_url}
              toggleBidPanel={this.toggleBidPanel}
              toggleTermsPanel={this.toggleTermsPanel}
              toggleNDAPanel={this.toggleNDAPanel}
              showTerms={showTerms}
              />
            )
            }
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

})();