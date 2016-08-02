import React from 'react';
import ReactDOM from 'react-dom';
import ContractBuilder from '../components/messaging/contractBuilder';
import ContractorTracker from '../components/messaging/contractorTracker';
import _ from 'lodash';

(function(){

  $('.message-bookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_bookmark,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-bookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_bookmark,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.message-unbookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unbookmark,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-unbookmark').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unbookmark,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.message-archive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_archive,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-archive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_archive,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.message-unarchive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unarchive,
      method: 'POST',
      data: { pks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $('.thread-unarchive').on('click', function(e) {
    $.ajax({
      url: loom_api.message_unarchive,
      method: 'POST',
      data: { tpks: $(e.currentTarget).data('value') },
      complete: function() {
        if ($(e.currentTarget).data('url')) {
          window.location.href = $(e.currentTarget).data('url');
        } else {
          window.location.reload();
        }
      }
    });
    return false;
  });

  $("#message-form").on("submit", function(e) {
      $.ajax({
        url: loom_api.message_send,
        method: 'POST',
        data: $(e.currentTarget).serialize(),
        success: function() {
          $('#message-modal').modal('hide');
        }
      });
    return false;
  });

  $("#send-bid").on("click", function(e) {
      $.ajax({
        url: loom_api.job,
        method: 'POST',
        data: {
          message: $('#id_message').val(),
          equity: $('#id_equity').val(),
          cash: $('#id_cash').val(),
          hours: $('#id_hours').val(),
          project: $('#id_project').val(),
          developer: $('#developer').val()
        },
        success: function() {
          $('#bid-modal').modal('hide');
          $("input[type='text']").val('');
          $('textarea').val('');
        }
      });
    return false;
  });

  const contractDiv = document.getElementById('contract_container');

  let Messaging = React.createClass({

    getInitialState() {
      return {
        isLoading: true,
        showTerms: false,
        showNDA: false,
        conversation: {
          terms: {},
          nda: {}
        }
      };
    },

    componentWillMount() {
      $.ajax({
        url: loom_api.messages + $('#contract_container').data('thread'),
        success: function (result) {
          this.setState({
            conversation: result,
            isLoading: false
          });
        }.bind(this)
      });
    },

    componentDidMount() {

    },

    toggleTermsPanel() {
      this.setState({
        showTerms: !this.state.showTerms,
        showNDA: this.state.showNDA && this.state.showTerms
      });
    },

    toggleNDAPanel() {
      this.setState({
        showNDA: !this.state.showNDA,
        showTerms: this.state.showTerms && this.state.showNDA
      });
    },

    render() {
      const agreementTracker = function () {
        return (
          <ContractorTracker />
        )
      };

      return (
        <div>
          <div className="col-md-8">
            <div className={ this.state.showTerms ? "panel panel-default" : "hidden"}>
              <div className="panel-heading text-skinny">
                <h4>Master Services Agreement</h4>
                {
                  this.state.isLoading ||
                  <ContractBuilder terms={this.state.conversation.terms} />
                }

              </div>
            </div>
            <div className={ this.state.showNDA ? "panel panel-default" : "hidden"}>
              <div className="panel-heading text-skinny">
                <h4>Non-Disclosure Agreement</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            {
              this.state.isLoading ||
              <ContractorTracker
                terms={this.state.conversation.terms}
                nda={this.state.conversation.nda}
                toggle_nda={this.toggleNDAPanel}
                toggle_terms={this.toggleTermsPanel}
              />
            }
          </div>
        </div>
      );
    }

  });

  ReactDOM.render(<Messaging />, contractDiv);

})();