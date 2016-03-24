requirejs.config({
  baseUrl: '/static/js',
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    stripe: 'https://js.stripe.com/v2/?sensor=false',
    formValidation: 'library/formValidation.popular.min',
    bootstrapValidationExt: 'library/validation.bootstrap.min',
    bootstrap: 'library/bootstrap',
    ga: '//www.google-analytics.com/analytics',
    gmaps: '//maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places'
  },
  shim: {
    formValidation:  ['jquery', 'bootstrap'],
    bootstrap: ['jquery'],
    bootstrapValidationExt: ['formValidation'],
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

require(['jquery', 'gmaps', 'ga', 'formValidation', 'bootstrapValidationExt'], function($, google) {
  function checkPrice() {
    if ($('#zipcode').val() == '' || $('#street_address').val() == '') {
      $('.service').text('Please enter your full address to see your price.');
      $('.fa-spin').addClass('hidden');
    } else {
      $('.fa-spin').removeClass('hidden');
      $.ajax({
        url: '/price/',
        method: 'POST',
        data: {
          promo_code: $('#promo').val().toUpperCase(),
          address: $('#street_address').val() + ' ' + $('#address2').val(),
          zipcode: $('#zipcode').val(),
          service: 'Mowing'
        },
        success: function (data) {
          if (data.price) {
            if (data.price > 0) {
              $('.service').text('Pick your price');
              $('.one-price').text(data.price);
              $('.one-price').data('price', data.price);
              $('.biweekly-price').text(data.price - 6);
              $('.biweekly-price').data('price', data.price - 6);
              $('.monthly-price').text(data.price - 3);
              $('.monthly-price').data('price', data.price - 3);
              $('.price-picker').removeClass('hidden');
              $('#price').val($('.price-picker li.active .price').data('price'));
              $('#internal_notes').val($('.price-picker li.active .price').data('notes'));
            }
            else {
              $('.price-picker').addClass('hidden');
              $('.service').text('Looks like you have a commercial or fairly large lawn.  Please contact us so we can help you out!  service@lawncall.com');
            }

          } else {
            $('.price-picker').addClass('hidden');
            $('.service').text('Your zipcode is currently not within our service area. Feel free to signup, and we will notify you once we expand service areas.');
          }
          $('.fa-spin').addClass('hidden');
        }
      });
    }
  }

  function backForm() {
    $('#address').toggleClass('hidden');
    $('#registration').toggleClass('hidden');
    if ($('#registration').hasClass('hidden')) {
      $('#signup_form').formValidation('enableFieldValidators', 'address', true, 'notEmpty')
        .formValidation('enableFieldValidators', 'city', true, 'notEmpty')
        .formValidation('enableFieldValidators', 'state', true, 'notEmpty')
        .formValidation('enableFieldValidators', 'zipcode', true, 'notEmpty')
        .formValidation('enableFieldValidators', 'email', false, 'notEmpty')
        .formValidation('enableFieldValidators', 'email', false, 'emailAddress')
        .formValidation('enableFieldValidators', 'password', false, 'notEmpty');
    }
  }

  function switchForms() {
    $('#address').toggleClass('hidden');
    $('#registration').toggleClass('hidden');
    if ($('#address').hasClass('hidden')) {
      $('#signup_form').formValidation('enableFieldValidators', 'address', false, 'notEmpty')
        .formValidation('enableFieldValidators', 'city', false, 'notEmpty')
        .formValidation('enableFieldValidators', 'state', false, 'notEmpty')
        .formValidation('enableFieldValidators', 'zipcode', false, 'notEmpty')
        .formValidation('enableFieldValidators', 'email', true, 'notEmpty')
        .formValidation('enableFieldValidators', 'email', true, 'emailAddress')
        .formValidation('enableFieldValidators', 'password', true, 'notEmpty');
    }
    $('#signup_form input[type=submit]').prop('disabled', false).removeClass('disabled');
    // analytics
    ga('set', 'page', location.pathname + 'step2');
    window.ga('send', 'pageview');
  }

  $(document).ready(function () {
    checkPrice();
    $('.price-picker li.price-box').on('click', function () {
      $('.price-picker li.price-box').removeClass('active');
      $('.price-picker .fa').addClass('hidden');
      $(this).addClass('active');
      $('.fa', this).removeClass('hidden');
      $('#price').val($('.price', this).data('price'));
      $('#recurring').val($(this).data('recurring'));
      $('#internal_notes').val($('.price', this).data('notes'));
    });
    $('#back-form').on('click', function (e) {
      e.preventDefault();
      backForm();
    });
    $('#promo-button').on('click', function () {
      $('#promo').val('FREE5');
      checkPrice();
    });
    $('a.faq').on('click', function () {
      $(this).find('i').toggleClass('fa-plus-square').toggleClass('fa-minus-square-o');
    });
    $(document).on("keyup", '#promo', function (e) {
      if ($(this).val().length >= 5) {
        checkPrice();
      }
    });

    $('#signup_form').on('keypress', function(e) {
      if(e.which == 13) {
        e.preventDefault();
        if ($('#address').hasClass('hidden')) {
          $('#signup_form').submit()
        } else {
          if ($('#zipcode').val() != '' || $('#street_address').val() != '') {
            checkPrice();
            switchForms();
          }
        }
      }
    });

    $('#signup_form').formValidation({
      framework: 'bootstrap',
      onSuccess: function (e) {
        e.preventDefault();
        if ($('#address').hasClass('hidden')) {
          e.target.submit()
        } else {
          checkPrice();
          switchForms();
        }
      },
      icon: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
      },
      err: {
        container: 'tooltip'
      },
      fields: {
        address: {
          validators: {
            notEmpty: {
              message: 'An address is required'
            }
          }
        },
        city: {
          validators: {
            notEmpty: {
              message: 'A city is required'
            }
          }
        },
        state: {
          validators: {
            notEmpty: {
              message: 'A state is required'
            }
          }
        },
        zipcode: {
          validators: {
            notEmpty: {
              message: 'A zipcode is required'
            }
          }
        },
        email: {
          validators: {
            notEmpty: {
              enabled: false,
              message: 'An email address is required'
            },
            emailAddress: {
              enabled: false,
              message: 'Not a valid email address'
            }
          }
        },
        password: {
          validators: {
            notEmpty: {
              enabled: false,
              message: 'Set your password'
            }
          }
        },
        confirm_password: {
          validators: {
            identical: {
              field: 'password',
              message: 'Passwords do not match'
            }
          }
        }
      }
    });
  });
  $(document).on("keypress", 'form', function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
      if ($('#route').val()) {
        return true;
      }
      e.preventDefault();
      google.maps.event.trigger(autocomplete, 'place_changed');
      return false;
    }
  });
  // analytics
  (function ($document) {
    $document.on('mousedown', '.faq.collapsed', function () {
      fire('faq', $(this).text());
    });
    $document.on('mousedown', '.price-box', function () {
      fire('prices', $(this).find('h3').text());
    });
    function fire(action, label) {
      window.ga('send', 'event', 'clicked', action, $.trim(label));
    }
  })($(document));

});