import React from 'react';
import ReactDOM from 'react-dom';
import Bid from '../components/bid';

$(document).ready(function() {
    $("#message-form").on("submit", function(e) {
      e.preventDefault();
      $("#message-form input[type=submit]").attr('disabled','disabled');
      $.ajax({
        url: loom_api.message,
        method: 'POST',
        data: $(e.currentTarget).serialize(),
        success: function() {
          $('#message-modal').modal('hide');
        }
      });
    return false;
  });

  const ModalContent = React.createClass({
    getInitialState() {
      return {
        project: {
          title: $('#project').data('name'),
          id: $('#project').data('id')
        },
        user: {
          id: $('#project').data('user')
        },
        job: {
          id: '',
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
            job={job}
            current_user={user.id}
            updateJob={this.updateJob}
            closeModal={this.closeModal}
            isModal={true}
          />
      )
    }
  });
  const modalDiv = document.getElementById('bid-body');
  if(modalDiv) {
    ReactDOM.render(<ModalContent />, modalDiv);
  }
});