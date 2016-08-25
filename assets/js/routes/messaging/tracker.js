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
      panel: ''
    };
  },

  // componentWillMount() {
  //   const { current_user, isOwner, terms, nda, job, signing_url, isLoading, formElements } = this.props;
  //
  //   this.setState({
  //     current_user,
  //     isOwner,
  //     terms,
  //     nda,
  //     job,
  //     signing_url,
  //     isLoading,
  //     formElements
  //   })
  // },

  // handleChange(event) {
  //   const { formElements } = this.state;
  //   const { value } = event.target;
  //   const fieldName = event.target.getAttribute('name');
  //
  //   formElements[fieldName].update(value);
  //   formElements[fieldName].value = value;
  //
  //   this.setState({ formElements, formError: false });
  // },

  togglePanel(event=0) {
    this.props.togglePanel(!this.props.showPanel);

    this.setState({
      panel: event ? $(event.currentTarget).data('panel') : ''
    });
  },

  render() {
    // TODO ummm this is a big ass list
    const { panel } = this.state;
    const {
      nda,
      current_user,
      terms,
      signing_url,
      formElements,
      formError,
      formErrorsList,
      isLoading,
      order,
      job,
      isOwner,
      handleChange,
      agreeTerms,
      saveTerms,
      convertFromMomentToStartDate,
      convertFromMomentToEndDate,
      updateNDA,
      ndaUpdating,
      updateJob,
      showPanel
    } = this.props;

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
            handleChange={handleChange}
            saveTerms={saveTerms}
            convertFromMomentToStartDate={convertFromMomentToStartDate}
            convertFromMomentToEndDate={convertFromMomentToEndDate}
          />
        </div>
      );

    const termsPanel = isOwner || (
        <div className="panel panel-default">
          <div className="messages-topBar messages-topBar--dark">
            <h4>Contract Preview <button onClick={this.togglePanel} type="button" className="close pull-right" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>
          </div>
          <Terms formElements={formElements} agreeTerms={agreeTerms} />
        </div>
      );

    const NDAPanel = isOwner || <NDA togglePanel={this.togglePanel} updateNDA={updateNDA} ndaUpdating={ndaUpdating} />;

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
          updateJob={updateJob}
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
              updateNDA={updateNDA}
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