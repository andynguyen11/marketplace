import React from 'react';
import Bid from '../../components/bid';
import ContractBuilder from '../../components/messaging/contractBuilder';
import ContracteeTracker from '../../components/messaging/contractee';
import ContractorTracker from '../../components/messaging/contractor';
import Checkout from '../../components/payment/checkout';
import NDA from '../../components/nda';
import Terms from '../../components/messaging/terms';
import FormHelpers from '../../utils/formHelpers';
import Loader from '../../components/loadScreen';

const MessageAgreement = React.createClass({

  getInitialState() {
    return {
      isLoading: true,
      ndaUpdating: false,
      showPanel: false,
      panel: '',
      order: null,
      terms: {
        status: 'new',
        schedule: '50% upfront and 50% upon completion'
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
      formError: false,
      formErrorsList: []
    };
  },

  componentWillMount() {
    const { current_user, isOwner, terms, nda, job, signing_url, isLoading, formElements } = this.props;

    this.setState({
      current_user,
      isOwner,
      terms,
      nda,
      job,
      signing_url,
      isLoading,
      formElements
    })
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
    console.log(e)
    const { nda, job, terms } = this.state;
    this.setState({ ndaUpdating: true });
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

  togglePanel(event=0) {
    this.setState({
      showPanel: !this.state.showPanel,
      panel: event ? $(event.currentTarget).data('panel') : ''
    });
  },

  render() {
    // TODO ummm this is a big ass list
    const { panel, nda, current_user, terms, signing_url, formElements, formError, formErrorsList, isLoading, showPanel, order, job, isOwner, ndaUpdating } = this.state;

    const builderPanel = isOwner && (
        <div className="panel panel-default">
          <div className="messages-topBar messages-topBar--dark">
            <h4 >Contract Terms <button onClick={this.togglePanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>
          </div>
          <ContractBuilder
            terms={terms}
            formElements={formElements}
            formError={formError}
            formErrorsList={formErrorsList}
            handleChange={this.handleChange}
            saveTerms={this.saveTerms}
            convertFromMomentToStartDate={this.props.convertFromMomentToStartDate}
            convertFromMomentToEndDate={this.props.convertFromMomentToEndDate}
          />
        </div>
      );

    const termsPanel = isOwner || (
        <div className="panel panel-default">
          <div className="messages-topBar messages-topBar--dark">
            <h4>Contract Preview <button onClick={this.togglePanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>
          </div>
          <Terms formElements={formElements} agreeTerms={this.agreeTerms} />
        </div>
      );

    const NDAPanel = isOwner || <NDA togglePanel={this.togglePanel} updateNDA={this.updateNDA} ndaUpdating={ndaUpdating} />;

    const checkoutPanel = isOwner && (
        <div className="panel panel-default">
          <div className="messages-topBar messages-topBar--dark">
            <h4>Sign and Send Contract <button onClick={this.togglePanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>
          </div>
          <Checkout
            isLoading={isLoading}
            job={job}
            terms={terms}
            panel={panel}
            togglePanel={this.togglePanel}
          />

        </div>
      );

    const bidPanel = isOwner || (
      <div className="panel panel-default">
        <div className="messages-topBar messages-topBar--dark">
          <h4>Bid
            <button onClick={this.togglePanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          </h4>
        </div>
        <Bid
          current_user={current_user}
          job={job}
          project={terms.project}
          updateJob={this.updateJob}
          isModal={false}
          saveCallback={this.togglePanel}
        />
      </div>
      );

    return (
      <div className="messages-tracker-content">

        { showPanel && <div className="agreement-panel">
          { panel == 'bid' && bidPanel }
          { panel == 'nda' && NDAPanel }
          { panel == 'builder' && builderPanel }
          { panel == 'terms' && termsPanel }
          { panel == 'checkout' && checkoutPanel }
        </div> }

        { isLoading || (
          isOwner ?
            <ContracteeTracker
              terms={terms}
              nda={nda}
              signing_url={signing_url}
              panel={panel}
              job={job}
              updateNDA={this.updateNDA}
              ndaUpdating={ndaUpdating}
              togglePanel={this.togglePanel}
            /> :
            <ContractorTracker
              terms={terms}
              nda={nda}
              job={job}
              panel={panel}
              signing_url={signing_url}
              togglePanel={this.togglePanel}
            />
          )
        }
      </div>
    );
  }

});

export default MessageAgreement;