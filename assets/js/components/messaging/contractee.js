import React from 'react';

const ContracteeTracker = React.createClass({

  getInitialState() {
    return {
      statusMap: {
        NDA: {
          new:' Send Non-Disclosure Agreement',
          sent: 'Sent! Awaiting Signature',
          signed: 'Signed!'
        }
      },
      step: 1
    }
  },

  componentWillMount() {
    let { step } = this.state;
    const { terms, nda } = this.props;
    if (terms.status == 'agreed') {
      step = 4;
    }
    else if (terms.status == 'sent') {
      step = 3;
    }
    else if (nda.status == 'sent') {
      step = 2;
    }
    this.setState({step: step});
  },

  render() {
    const { nda, ndaSending, terms, signing_url, togglePanel, updateNDA, panel } = this.props;
    const { step, statusMap } = this.state;

    const ndaStatus = () => {
      switch (nda.status) {
        case "sent":
          return (
              <button className="btn">Non-Disclosure Sent</button>
          );
        case "signed":
          return (
            <button className="btn">Signed</button>
          );
        default:
          return (
            <button
              onClick={updateNDA}
              className='btn btn-brand'
              data-status='sent'
            >
              <i className={ ndaSending ? "fa fa-circle-o-notch fa-spin fa-fw" : "hidden" }></i>
              Send Non-Disclosure Agreement
            </button>
          );
      }
    }

    const termsStatus = () => {
      switch (terms.status) {
        case "agreed":
          return (
            <button className="btn"><span className="text-capitalize">{terms.status}</span> on {terms.update_date}</button>
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
              <button onClick={togglePanel} data-panel='builder' className={panel == 'builder' ? 'hidden' : 'btn btn-brand'}>Build &amp; Send Preview</button>
            </div>
          );
      }
   }

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
          <h5 className="title">Build Your Work Contract <i className={ terms.status != 'new' ? 'fa fa-check-circle text-brand' : ''}></i></h5>
          <p className="small">
            Use our contract builder to quickly build your contract, and preview the contract terms with your developer.
          </p>
          { termsStatus() }
        </div>

        <div className={step < 3 ? 'inactive step' : 'step'}>
          <h5 className="step-number">3</h5>
          <h5 className="title">Sign &amp; Send Work Contract</h5>
          <p className="small">
            Loom collects a service fee only when you sign and send your contract to this developer to engage them on your project.
          </p>
          <div className={step == 4 ? '' : 'hidden'} >
            <div className={signing_url ? 'hidden': ''}>
              <button onClick={togglePanel} data-panel='checkout' className="btn btn-brand">Finish Up</button>
            </div>
            <div className={signing_url ? '' : 'hidden'}>
              <a href={signing_url} className="btn btn-brand">Sign Contract</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

export default ContracteeTracker;