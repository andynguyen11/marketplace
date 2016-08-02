import React from 'react';

let ContracteeTracker = React.createClass({

  getInitialState() {
    return {
      statusMap: {
        NDA: {
          new:' Send Non-Disclosure Agreement',
          sent: 'Awaiting Signature',
          signed: 'Signed!'
        },
        terms: {
          new: 'Create New',
          sent: 'Awaiting Approval',
          contract: 'Purchase and Send Contract',
          signed: 'Signed!'
        }
      }
    }
  },

  signNDA() {

  },

  confirmMSA() {

  },

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading text-skinny">
          <h4>Service Agreement Tracker</h4>
        </div>
        <div className="panel-body text-center">
          <h4>Non-Disclosure Agreement</h4>
          <button onClick={this.props.toggle_nda} className="btn btn-primary">{this.state.statusMap.NDA[this.props.nda.status]}</button>
          <p>
            This is a legally-binding agreement between you and the developer
            that they will not disclose any sensitive or proprietary information.
          </p>

          <h4>Master Service Agreement</h4>
          <button onClick={this.props.toggle_terms} className="btn btn-primary">{this.state.statusMap.terms[this.props.terms.status]}</button>
          <p>
            This is the legally-binding work contract agreement between you and the developer.
          </p>
        </div>
      </div>
    );
  }

});

export default ContracteeTracker;