requirejs.config({
  baseUrl: '/static/js',
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    bootstrap: 'library/bootstrap',
    gmaps: '//maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places'
  },
  shim: {
    bootstrap: ['jquery'],
    csrf: ['jquery'],
    gmaps: { exports: 'google' }
  },
  jsx: {
    fileExtension: '.jsx'
  },
  deps: ['jquery', 'csrf', 'library/tawk'],
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

require(['jquery', 'gmaps', 'bootstrap'], function($, google) {
  var placeSearch, autocomplete;
  var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
  };

  function initialize() {

    var pac_input = document.getElementById('autocomplete');

    (function pacSelectFirst(input) {
        // store the original event binding function
        var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

        function addEventListenerWrapper(type, listener) {
          // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
          // and then trigger the original listener.
          if (type == "keydown") {
            var orig_listener = listener;
            listener = function(event) {
              if (event.which == 13 && !$('#postal_code').val()) {
                event.preventDefault();
              }
              var suggestion_selected = $(".pac-item-selected").length > 0;
              if (event.which == 13 && !suggestion_selected) {
                if ($('#postal_code').val()) {
                  return true;
                }
                event.preventDefault();
                var simulated_downarrow = $.Event("keydown", {
                  keyCode: 40,
                  which: 40
                });
                orig_listener.apply(input, [simulated_downarrow]);
              }

                orig_listener.apply(input, [event]);
            };
          }

          _addEventListener.apply(input, [type, listener]);
        }

        input.addEventListener = addEventListenerWrapper;
        input.attachEvent = addEventListenerWrapper;

         // Create the autocomplete object, restricting the search
        // to geographical location types.
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
            { types: ['geocode'] });
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          fillInAddress();
        });

    })(pac_input);
  }

  function fillInAddress() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();
    for (var component in componentForm) {
      document.getElementById(component).value = '';
      document.getElementById(component).disabled = false;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    var get_params = '?';
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];

      if (componentForm[addressType]) {
        var val = place.address_components[i][componentForm[addressType]];
        var amp = i ? '&' : '';
        get_params += amp + addressType + '=' + val;
      }
    }
    window.location.href = '/signup/' + get_params;
  }

  // Bias the autocomplete object to the user's geographical location,
  // as supplied by the browser's 'navigator.geolocation' object.
  function geolocate() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = new google.maps.LatLng(
            position.coords.latitude, position.coords.longitude);
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autocomplete.setBounds(circle.getBounds());
      });
    }
  }

  $(document).ready(function() {
    initialize();
    var wrap = $('#wrap');
    $('#autocomplete').on('focus', function(){
      geolocate();
    });
    if ($(document).scrollTop() > 290) {
      wrap.addClass("fix-search");
    }
    $(window).on('scroll', function(e) {
      if ($(document).scrollTop() > 290) {
        wrap.addClass("fix-search");
      } else {
        wrap.removeClass("fix-search");
      }
    });
  });
});