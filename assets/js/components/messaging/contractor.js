import React from 'react';
import _ from 'lodash';

const ContractorTracker = React.createClass({

  getInitialState() {
    return {
      step: 2
    }
  },

  componentWillMount() {
    const { terms, nda, job } = this.props;
    let { step } = this.state;
    if (terms.status == 'agreed') {
      step = 4;
    }
    else if (nda.status == 'signed' || terms.status == 'sent') {
      step = 3;
    }
    else if (job.hours) {
      step = 2;
    }
    this.setState({step: step});
  },

  render() {
    const { nda, job, terms, signing_url, togglePanel, panel } = this.props;
    const { step, statusMap } = this.state;

    const ndaStatus = () => {
      switch (nda.status) {
        case "sent":
          return (
            <div>
              <button onClick={togglePanel} data-panel='nda' className={panel == 'nda' ? 'hidden' : 'btn btn-brand'}>View and Sign NDA</button>
              <button className={panel == 'nda' ? 'btn btn-secondary' : 'hidden'}>In Progress</button>
            </div>
          );
        case "signed":
          return (
            <button className='btn'>Signed</button>
          );
        default:
          return (
            <button className='btn'>Not Sent</button>
          );
      }
    };

    const termsStatus = () => {
      switch (terms.status) {
        case "sent":
          return (
            <div>
              <button onClick={togglePanel} data-panel='terms' className='btn btn-brand'>
                Preview Contract
              </button>
            </div>
          );
        case "agreed":
          return (
            <button className='btn'><span className="text-capitalize">{terms.status}</span> on {terms.update_date}</button>
          );
        default:
          return (
            <button className='btn btn-secondary'>Not Sent</button>
          );
      }
   }

    return (
      <div id="agreement-tracker">
        <div className="step">
          <h5 className="step-number">1</h5>
          <h5 className="title">Project Bid <i className={job.hours ? 'fa fa-check-circle text-brand' : 'hidden'}></i></h5>
          <p className="small">
              Your bid should include accurate work hours and your required compensation.
          </p>
          <div>
          { terms.status == 'agreed' ? (
            <button className="btn">
              Bid Locked
            </button>
            ) : (
            <button onClick={togglePanel} data-panel='bid' className="btn btn-brand">
              { job.hours ? 'Adjust Bid' : 'Submit Bid' }
            </button>
          )}

          </div>

        </div>

        <div className={step < 2 ? 'inactive step' : 'step'}>
          <h5 className="step-number">2</h5>
          <h5 className="title">Non-disclosure Agreement  <i className={ nda.status == 'signed' ? 'fa fa-check-circle text-brand' : 'hidden' }></i></h5>
            <p className="small">
              An agreement that you will not share details of the project with outside parties.
              Signing will unlock the private tab of the project, and is required to move forward into
              the contract phase.
            </p>
            { nda && ndaStatus() }
        </div>

        <div className={step < 3 ? 'inactive step' : 'step'}>
          <h5 className="step-number">3</h5>
          <h5 className="title">Contract Terms <i className={ terms.status == 'agreed' ? 'fa fa-check-circle text-brand' : 'hidden' }></i></h5>
          <p className="small">
            You will receive a preview of the terms of any contract built by the project manager prior to signing.
          </p>
          { terms && termsStatus() }
        </div>

        <div className={step < 4 ? 'inactive step' : 'step'}>
          <h5 className="step-number">4</h5>
          <h5 className="title">Sign Contract</h5>
          <p className="small">
            When you and the project manager are aligned on hours and payment,
            you can start work with a simple digital signature.
          </p>
          <div>
          { signing_url ?
            <a href={ signing_url } className="btn btn-brand">Sign Contract</a>
            :
            <button className='btn btn-secondary' >Waiting for Contract Delivery</button>
          }
          </div>
        </div>
      </div>
    );
  }

});

export default ContractorTracker;