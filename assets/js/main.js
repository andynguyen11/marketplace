(function(){
    // import vendor npm packages
    const $ = require('jquery');
    const React = require('react');
    const ReactDOM = require('react-dom');
    const _ = require('lodash');
    const moment = require('moment');

    // make jQuery global for third-party libs
    window.jQuery = window.$ = $;

    require('bootstrap');
    require('bootstrap-datepicker');
    require('bootstrap-select');

    // import non-npm vendor files
    require('./vendor/select2-adaptor');
    require('./vendor/formValidation.popular.min');
    require('./vendor/validation.bootstrap.min');
    require('./vendor/zendesk');

    // import app files
    window.loom_api = require('./api');
    const cookieUtils = require('./utils/csrf');

    // SETUP AJAX WITH CSRF
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            const csrftoken = cookieUtils.getCookie('csrftoken');

            if (!cookieUtils.csrfSafeMethod(settings.type) && cookieUtils.sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
})();
