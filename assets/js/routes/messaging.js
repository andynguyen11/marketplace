import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Messages from './messaging/messages';

(function(){

  const messageDiv = document.getElementById('messages-wrapper');

  if(messageDiv) {
    const threadId = parseInt(messageDiv.dataset.thread);

    ReactDOM.render(<Messages threadId={threadId}/>, messageDiv);
  }

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

})();