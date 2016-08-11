import React from 'react';
import _ from 'lodash';

const ContractorTracker = React.createClass({

  getInitialState() {
    return {
      statusMap: {
        NDA: {
          new:'Not Sent',
          sent: 'Sign Non-disclosure Agreement',
          signed: 'Signed!'
        },
        terms: {
          new: 'Not Sent',
          sent: 'Preview Contract',
          contract: 'Sign Contract',
          signed: 'Signed!'
        }
      },
      step: 1
    }
  },

  componentWillMount() {
    this.updateStep();
  },

  updateStep() {
    let step = this.state.step;
    if (!this.props.isLoading) {
      if (this.props.terms.status == 'sent') {
        step = 4;
      }
      else if (this.props.nda.status == 'signed') {
        step = 3;
      }
      else if (this.props.bid_sent) {
        step = 2;
      }
      console.log(step)
    }
    this.setState({step: step});
  },

  render() {
    const { nda, job, bid_sent, terms, showTerms, signing_url, toggleTermsPanel, toggleBidPanel, toggleNDAPanel, showNDA, isLoading } = this.props;

    return (
      <div id="agreement-tracker" className="col-md-4">
        <h4>Want to work with this developer?</h4>
        <h4>Follow the steps below:</h4>
        <div className="panel panel-default">
          <div className="panel-heading text-skinny">
            <h4>Agreement Tracker</h4>
          </div>
          { isLoading &&
            <div>
            <h4 className="text-center">
              <i className="fa fa-circle-o-notch fa-spin fa-fw"></i>
              Loading...
            </h4>
            </div>
          }
          { isLoading ||
            <div>
              <div className="step">
                <h5>Step 1</h5>
                <h4 className="title">Project Bid</h4>
                <div>
                  <p>
                    Your bid should include accurate work hours and your required compensation -
                    in cash, equity or a mix of both.
                  </p>
                  <div className={this.state.step > 1 ? '' : 'hidden'}>
                    <h4 className="highlight">Bid Sent&nbsp;
                      <i className="fa fa-check-circle"></i>
                    </h4>
                  </div>
                  <button
                    onClick={toggleBidPanel}
                    className="btn btn-brand"
                  >{ bid_sent ? 'Edit Bid' : 'Submit Bid' }</button>
                </div>

              </div>

              <div className={this.state.step < 2 ? 'inactive step' : 'step'}>
                <h5>Step 2</h5>
                <h4 className="title">Non-disclosure Agreement</h4>
                <div className={this.state.step != 2 ? 'hidden' : ''} >
                  <p>
                    An agreement that you will not share details of the project with outside parties.
                    Signing will unlock the private tab of the project, and is required to move forward into
                    the contract phase.
                  </p>
                  <button onClick={toggleNDAPanel} className={showNDA ? 'hidden' : 'btn btn-brand'}>View and Sign NDA</button>
                  <button disabled className={showNDA ? 'btn btn-secondary' : 'hidden'}>In Progress</button>
                </div>
                <div className={this.state.step > 2 ? '' : 'hidden'}>
                  <h4 className="highlight">Signed&nbsp;
                    <i className="fa fa-check-circle"></i>
                  </h4>
                </div>
              </div>

              <div className={this.state.step < 3 ? 'inactive step' : 'step'}>
                <h5>Step 3</h5>
                <h4 className="title">Contract Preview</h4>
                <p>
                  You can preview the terms of any contract built by the project manager prior to signing.
                </p>
                <div className={this.state.step >= 3 ? '' : 'hidden'} >
                  <button onClick={toggleTermsPanel} disabled={terms.status == 'new' ? 'true' : ''} className={terms.status == 'new' ? 'btn btn-secondary' : 'btn btn-brand'}>{this.state.statusMap.terms[terms.status]}</button>
                </div>
              </div>

              <div className={this.state.step < 4 ? 'inactive step' : 'step'}>
                <h5>Step 4</h5>
                <h4 className="title">Sign Contract</h4>
                <p>
                  When you and the project manager are aligned on hours and payment,
                  you can start work with a simple digital signature.
                </p>
                <div className={this.state.step == 4 ? '' : 'hidden'} >
                  <a href={ signing_url } className="btn btn-brand">Sign Contract</a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>



    );
  }

});

export default ContractorTracker;