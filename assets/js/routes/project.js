import React from 'react';
import ReactDOM from 'react-dom';
import Bid from '../components/bid';

$(document).ready(function() {

  const ModalContent = React.createClass({
    getInitialState() {
      return {
        project: {
          title: 'This Project',
          id: 1
        },
        user: {
          id: 2
        },
        job: {
          compensationType: '',
          cash: '',
          equity: '',
          hours: '',
          message: ''
        },
        modalOpen: true
      }
    },

    closeModal() {
      $('#bid-modal').modal('hide')
    },

    updateJob(job) {
      this.setState({job});
    },

    render(){
      const { project, job, user, modalOpen } = this.state;

      return (
          <Bid
            project={project}
            bid_sent={false}
            job={job}
            current_user={user}
            updateJob={this.updateJob}
            closeModal={this.closeModal}
          />
      )
    }
  });
  const modalDiv = document.getElementById('bid-body');
  ReactDOM.render(<ModalContent />, modalDiv);
})