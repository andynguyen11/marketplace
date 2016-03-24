define(
  ['react',
    'jsx!components/appointments',
    'jsx!components/service-summary',
    'jsx!components/frequency-picker',
    'jsx!components/payment-form',
    'jsx!components/payment-display',
    'jsx!components/spinner',
    'jsx!components/edit-customer-profile'],
  function(React, Appointments, ServiceSummary, FrequencyPicker, PaymentForm, PaymentDisplay, Spinner, Profile) {

    return React.createClass({
      getInitialState: function () {
        return {
          is_loading: true,
          profile: {
            user: '',
            card: ''
          },
          appointments: [],
          base_price: 0,
          discount_price: 0,
          charge: 0,
          service: 1, //TODO HM: This is hardcoded since we currently only support 1 service
          frequency: 'onetime',
          promo: '',
          active_tab: '#appointments'
        };
      },
      route: function() {

      },
      setCharge: function(amount) {
        this.setState({
          charge: amount
        })
      },
      setService: function(service) {
        this.setState({
          service: service
        });
      },
      setFrequency: function(frequency) {
        this.setState({
          frequency: frequency
        });
      },
      setPromo: function(promo) {
        if (promo.length >= 5) {
          this.setState({
            promo: promo
          });
          this.getPrice(promo);
        }
      },
      bookService: function() {
        this.setState({ is_loading: true });
        $.ajax({
          url: hm_api.job,
          method: 'POST',
          data: {service: this.state.service, promo: this.state.promo, charge: this.state.charge, recurring: this.state.frequency},
          success: function() {
            this.loadProfile();
            $('#book-modal').modal('hide');
          }.bind(this)
        });
      },
      componentDidMount: function () {
        this.loadProfile();
        $(window).on('hashchange', function() {
          this.setState({
            active_tab: window.location.hash
          })
        }.bind(this));
      },
      getPrice: function (promo) {
        $.ajax({
          url: hm_api.price,
          method: 'GET',
          data: {
            address: this.state.profile.service_address + ' ' + this.state.profile.service_address2,
            zipcode: this.state.profile.service_zipcode,
            promo: promo
          },
          success: function (result) {
            var discount = result.discount_price ? result.price - result.discount_price : 0;
            if (discount > 0 && this.state.charge) {
              var discount_price = this.state.charge - discount;
              this.setState({
                base_price: result.price,
                charge: this.state.charge ? discount_price : result.price,
                discount_price: result.discount_price
              });
            } else {
              this.setState({
                base_price: result.price,
                charge: this.state.charge ? this.state.charge : result.price,
                discount_price: result.discount_price
              });
            }
          }.bind(this)
        });
      },
      setProfile: function (profile) {
        this.setState({
          profile: profile
        });
      },
      loadProfile: function () {
        $.get(hm_api.customer + $('#customer-app').data('id') + '/', function (result) {
          this.setState({
            profile: result,
            appointments: result.appointments,
            is_loading: false,
            active_tab: window.location.hash ? window.location.hash : this.state.active_tab
          });
          this.getPrice()
        }.bind(this));
      },
      updateProfile: function () {
        $.ajax({
          url: hm_api.profile + $('#customer-app').data('id') + '/',
          method: 'PUT',
          data: JSON.stringify(this.state.profile),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function() {
            this.loadProfile();
          }.bind(this)
        });
      },
      render: function () {
        return (
          <div>
            <div className='text-center'>
              <h2><Spinner is_loading={this.state.is_loading} /></h2>
            </div>

            <div id="appointments" className={this.state.active_tab == '#appointments' ? '' : 'hidden'} >
              <Appointments profile={this.state.profile} appointments={this.state.appointments} set_service={this.setService} set_charge={this.setCharge} update_data={this.loadProfile} />
            </div>
            <div id="profile" className={this.state.active_tab == '#profile' ? '' : 'hidden'} >
              <Profile profile={this.state.profile} set_profile={this.setProfile} update_profile={this.updateProfile} reload_profile={this.loadProfile} />
            </div>
            <div className="modal fade" id="book-modal" >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-body">
                    <FrequencyPicker base_price={this.state.base_price} discount_price={this.state.discount_price} set_charge={this.setCharge} set_frequency={this.setFrequency} />
                    { this.state.profile.card ? <PaymentDisplay profile={this.state.profile} is_loading={this.state.is_loading} set_promo={this.setPromo} book_service={this.bookService} /> : false  }
                  </div>
                </div>
              </div>
            </div>

          </div>
        )
      }
    });

});