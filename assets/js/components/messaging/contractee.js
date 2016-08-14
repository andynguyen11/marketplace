import React from 'react';

const ContracteeTracker = React.createClass({

  getInitialState() {
    return {
      statusMap: {
        NDA: {
          new:' Send Non-Disclosure Agreement',
          sent: 'Awaiting Signature',
          signed: 'Signed!'
        },
        terms: {
          new: 'Enter Contract Terms',
          sent: 'Edit Contract Terms',
          contract: 'Purchase and Send Contract',
          signed: 'Signed!'
        }
      },
      step: 1
    }
  },

  componentWillMount() {
    let step = this.state.step;
    if (this.props.terms.status == 'signed') {
      step = 4;
    }
    else if (this.props.terms.status == 'sent') {
      step = 3;
    }
    else if (this.props.nda.status == 'signed') {
      step = 2;
    }
    this.setState({step: step});
  },

  render() {
    const { nda, terms, signing_url, showTerms, toggleTermsPanel, toggleCheckoutPanel, updateNDA , isLoading } = this.props;

    return (
      <div id="agreement-tracker" className="col-md-4">
        <h4>Want to work with this developer?</h4>
        <h4>Follow the steps below:</h4>
        <div className="panel panel-default">
          <div className="panel-heading text-skinny">
            <h4>Agreement Tracker</h4>
          </div>
          { isLoading &&
            <p>Loading...</p>
          }
          { isLoading ||
            <div>
              <div className="step">
                <h5>Step 1</h5>
                <h4 className="title">Non-Disclosure Agreement</h4>
                <div className={this.state.step > 1 ? 'hidden' : ''}>
                  <p>
                    This is a legally-binding agreement between you and the developer
                    that they will not disclose any sensitive or proprietary information.
                  </p>
                  <button
                    onClick={updateNDA}
                    className={nda.status == 'new' ? 'btn btn-brand' : 'btn btn-secondary'}
                    disabled={nda.status == 'new' ? '' : 'true'}
                    data-status='sent'
                  >{this.state.statusMap.NDA[nda.status]}</button>
                </div>
                <div className={this.state.step != 1 ? '' : 'hidden'}>
                  <h4 className="highlight">Signed
                    <i className="fa fa-check-circle"></i>
                  </h4>
                </div>
              </div>

              <div className='step'>
                <h5>Step 2</h5>
                <h4 className="title">Build Contract</h4>
                  <p>
                    This is the legally-binding work contract agreement between you and the developer.
                  </p>
                  <button onClick={toggleTermsPanel} className={showTerms ? 'hidden' : 'btn btn-brand'}>{this.state.statusMap.terms[terms.status]}</button>
                  <button disabled className={showTerms ? 'btn btn-secondary' : 'hidden'}>In Progress</button>
                <div className={this.state.step == 3 ? '' : 'hidden'} >
                  <h4 className="highlight">Created on {terms.create_date}
                    <i className="fa fa-check-circle"></i>
                  </h4>
                  <a onClick={toggleTermsPanel}>
                    <i className="fa fa-edit"></i>
                  &nbsp;
                   {this.state.statusMap.terms[terms.status]}
                  </a>
                </div>
              </div>

              <div className={this.state.step < 3 ? 'inactive step' : 'step'}>
                <h5>Step 3</h5>
                <h4 className="title">Sign and Send Contract</h4>
                <p>
                  Loom collects a service fee only when you sign and send your contract to the developer.
                </p>
                <div className={this.state.step == 3 ? '' : 'hidden'} >
                  <div className={signing_url ? 'hidden': ''}>
                    <button onClick={toggleCheckoutPanel} className="btn btn-brand">Finish Up</button>
                  </div>
                  <div className={signing_url ? '' : 'hidden'}>
                    <a href={signing_url} className="btn btn-brand">Sign Contract</a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>



    );
  }

});

export default ContracteeTracker;