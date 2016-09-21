import React from 'react';

const ContracteeTracker = React.createClass({

  render() {
    const { nda, job, ndaSending, terms, signing_url, togglePanel, updateNDA, panel } = this.props;

    const ndaStatus = () => {
      switch (nda.status) {
        case "sent":
          return (
              <button className="btn" disabled>NDA Sent</button>
          );
        case "signed":
          return (
            <button className="btn" disabled>NDA Signed</button>
          );
        default:
          return (
            <button
              onClick={updateNDA}
              className='btn btn-brand btn-collapse'
              data-status='sent'
            >
              <i className={ ndaSending ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
              Send NDA
            </button>
          );
      }
    };

    const termsStatus = () => {
      switch (terms.status) {
        case "agreed":
          return (
            <button className="btn btn-collapse" disabled><span className="text-capitalize">{terms.status}</span> on {terms.update_date}</button>
          );
        case "sent":
          return (
            <div>
              <button disabled className={panel == 'builder' ? 'btn btn-secondary' : 'hidden'}>In Progress</button>
              <button onClick={togglePanel} data-panel='builder' className={panel == 'builder' ? 'hidden' : 'btn btn-brand'}>Edit Contract</button>
            </div>
          );
        default:
          return (
            <div>
              <button disabled className={panel == 'builder' ? 'btn btn-secondary' : 'hidden'}>In Progress</button>
              { job.hours && nda.status === 'signed' ? (
                <button onClick={togglePanel} data-panel='builder' className={panel == 'builder' ? 'hidden' : 'btn btn-brand'}>Create New</button>
              ) : (
                <button disabled className='btn btn-brand'>Create New</button>
              )}
            </div>
          );
      }
    };

    const contractStatus = () => {
      const { status } = terms;

      if(status !== 'agreed') {
        return <button className="btn btn-brand" disabled>Sign & Send</button>;
      } else {
        if(signing_url) {
          return <a href={signing_url} className="btn btn-brand">View Contract</a>;
        }else{
          return <button onClick={togglePanel} data-panel='checkout' className="btn btn-brand">Sign & Send</button>;
        }
      }
    };

    return (
      <div id="agreement-tracker">
        <div className="step">
          <h5 className="step-number">1</h5>
          <h5 className="title">Non-Disclosure Agreement <i className={ nda.status != 'new' ? 'fa fa-check-circle text-brand' : ''}></i></h5>
          <p className="small">
            Sending this agreement will unlock the project's private info tab and prevents your
            developer from sharing proprietary information about your idea with outside parties.
          </p>
          { ndaStatus() }
        </div>

        <div className='step'>
          <h5 className="step-number">2</h5>
          <h5 className="title">Create Your Work Contract <i className={ terms.status != 'new' ? 'fa fa-check-circle text-brand' : ''}></i></h5>
          <p className="small">
            Use our contract builder to quickly build your contract, and preview the contract terms with your developer.
          </p>
          { termsStatus() }
        </div>

        <div className="step">
          <h5 className="step-number">3</h5>
          <h5 className="title">Sign &amp; Send Work Contract <i className={ terms.status === 'signed' ? 'fa fa-check-circle text-brand' : ''}></i></h5>
          <p className="small">
            Loom collects a service fee only when you sign and send your contract to this developer to engage them on your project.
          </p>
          { contractStatus() }
        </div>
      </div>
    );
  }

});

export default ContracteeTracker;