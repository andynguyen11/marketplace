requirejs.config({
  baseUrl: '/static/js',
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    jsx: 'library/jsx',
    JSXTransformer: 'library/JSXTransformer',
    react: '../bower_components/react/react-with-addons',
    stripe: 'https://js.stripe.com/v2/?sensor=false',
    text: 'library/text',
    formValidation: 'library/formValidation.popular.min',
    bootstrapValidationExt: 'library/validation.bootstrap.min',
    mapbox: 'https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js?sensor=false',
    rating: 'library/star-rating.min',
    bootstrap: 'library/bootstrap',
    ga: '//www.google-analytics.com/analytics',
    gmaps: '//maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places'
  },
  shim: {
    formValidation:  ['jquery', 'bootstrap'],
    rating: ['jquery'],
    bootstrap: ['jquery'],
    bootstrapValidationExt: ['formValidation'],
    csrf: ['jquery'],
    gmaps: { exports: 'google' },
    mapbox: { exports: 'L' }
  },
  jsx: {
    fileExtension: '.jsx'
  },
  deps: ['jquery', 'csrf', 'api', 'library/tawk'],
  callback: function () {
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    $(document).ready(function(){
      $('.contact').on('click', function(e){
        e.preventDefault();
        $_Tawk.toggle();
      });
    });
  }
});

require(['react', 'jsx!components/customer-portal'], function (React, Portal) {
  Portal = React.createElement(Portal);

	React.render(
    Portal,
    document.getElementById('customer-app')
  );
});