let AddressAutocomplete = React.createClass({

  getInitialState () {
    return {
      componentForm: {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      }
    }
  },

	componentDidMount() {
    var autocomplete_input = document.getElementById('autocomplete');
    this.pacSelectFirst(autocomplete_input);

	},

  fillInAddress() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();
    for (var component in this.state.componentForm) {
      document.getElementById(component).value = '';
      document.getElementById(component).disabled = false;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    var get_params = '?';
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];

      if (this.state.componentForm[addressType]) {
        var val = place.address_components[i][this.state.componentForm[addressType]];
        var amp = i ? '&' : '';
        get_params += amp + addressType + '=' + val;
      }
    }
    window.location.href = '/signup/' + get_params;
  },

  geolocate() {
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
  },

  pacSelectFirst(input) {
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

        GoogleMapsLoader.load(function(google) {
          // Create the autocomplete object, restricting the search
          // to geographical location types.
          var autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')), { types: ['geocode'] });
          google.maps.event.addListener(autocomplete, 'place_changed', function() {
            this.fillInAddress();
          }.bind(this));
        });



    },

	render() {
		return (
      <div id="locationField" className="form-group">
       <input className="form-control" onfocus={this.geolocate} id="autocomplete" autocomplete="off" placeholder="Enter your address" type="text" />
       <input className="field" name="street_number" id="street_number" type="hidden" />
       <input className="field" name="route" id="route" type="hidden" />
       <input className="field" name="locality" id="locality" type="hidden" />
       <input className="field" name="state" id="administrative_area_level_1" type="hidden" />
       <input className="field" name="postal_code" id="postal_code" type="hidden" />
       <input className="field" name="country" id="country" type="hidden" />
      </div>
		);
	}
});

module.exports = Map;