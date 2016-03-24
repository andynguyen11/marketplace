define(['react', 'mapbox', 'jsx!components/review', 'jsx!components/payment-form'], function(React, L, Review, PaymentForm) {

  return React.createClass({
    getInitialState: function () {
      return {
        current_appointment: 0
      }
    },
    handleCurrentService: function(e) {
      this.props.set_service($(e.currentTarget).data('service'));
      this.props.set_charge($(e.currentTarget).data('price'));
    },
    showAppointmentDetails: function(e) {
      var new_appointment = $(e.currentTarget).data('appointment');
      if (this.state.current_appointment == new_appointment) {
        new_appointment = -1
      }
      this.setState({
        current_appointment: new_appointment
      })
    },
    render: function () {
      var quick_book = true;
      var appointments = this.props.appointments.map(function(appointment, i) {
        var reviewed = false;
        var completed = false;
        var confirmed = true;
        if (!appointment.date_completed) {
          quick_book = false;
        }
        if (!this.props.profile.card) {
          status_color = 'text-danger';
          status_class = 'fa fa-exclamation-circle text-danger';
          status = 'Unconfirmed';
          status_message = 'Please confirm your booking with payment information.';
          confirmed = false;
        } else {
          if (!appointment.date_assigned) {
            status_color = '';
            status_class = 'fa fa-circle-o';
            status = 'New';
            status_message = 'We are selecting a compatible lawn care professional.'
          } else {
            if (appointment.date_completed  && !appointment.date_reviewed) {
              status_color = 'text-primary';
              status_class = 'fa fa-circle text-primary';
              status = 'Completed';
              status_message = 'Your service has been completed by ' + appointment.provider_name + '. Please describe your overall experience in order to help us keep a high quality of service.';
              completed = true;
            }  else if (appointment.date_reviewed) {
              status_color = 'text-success';
              status_class = 'fa fa-check-circle text-success';
              status = 'Completed';
              status_message = 'Thank you for your feedback.';
              reviewed = true;
            } else {
              status_color = 'text-orange';
              status_class = 'fa fa-clock-o text-orange';
              status = 'Assigned';
              status_message = appointment.provider_name + ' is scheduled to service your home shortly.';
            }
          }
        }

        return(
          <table className='table appointment-table' key={i}>
            <tbody>
            <tr className={i == this.state.current_appointment ? 'active appointment' : 'appointment'} data-appointment={i} onClick={this.showAppointmentDetails} >
              <td className='edge text-center'>
                <i className={status_class}></i>
              </td>
              <td>
                <h4>{appointment.service_name} at {this.props.profile.service_address} {this.props.profile.service_address2}</h4>
                <span className={status_color + ' upper'}><strong>{status}</strong></span> <span className="text-muted">{status_message}</span>
              </td>
              <td className='edge'>
                <h3><i className={i == this.state.current_appointment ? 'fa fa-chevron-down' : 'fa fa-chevron-right'} ></i></h3>
              </td>
            </tr>
            <tr className={i == this.state.current_appointment ? 'appointment-details' : 'appointment-details hidden'}>
              <td colSpan="3">
                <div className='col-md-12'>
                  { completed ? <Review job={appointment} update_data={this.props.update_data} /> : false}
                </div>
                <div className={ completed || !this.props.profile.card ? 'hidden' : '' } >
                  <div className='col-md-6'>
                    <img className='appointment-map' src={'https://api.mapbox.com/v4/mapbox.streets/pin-s-building('+this.props.profile.service_long+','+this.props.profile.service_lat+')/'+this.props.profile.service_long+','+this.props.profile.service_lat+',13/300x300@2x.png?access_token=pk.eyJ1IjoiaW5ub3ZlcnRlZCIsImEiOiJhZmU3NTUzMjA2MTVhYWMwMjY5ZDNjYTU1YWY4YTc2MyJ9.ybhRWckkJ3v2IudwBFV5Cw'} />
                  </div>
                  <div className='col-md-6'>

                      <div className={completed ? '' : 'hidden'} >
                        <h4>Service Completed</h4>
                        <p>{appointment.date_completed}</p>
                      </div>

                      <div className={reviewed ? 'hidden' : ''} >
                        <h4>Estimated Service Date</h4>
                        <p>{appointment.date_targeted ? appointment.date_targeted : 'Within 3 Days'}</p>
                      </div>


                      <h4>Price*</h4>
                      <p>${appointment.charge}</p>



                      <h4>Service Address</h4>
                      <p>{this.props.profile.service_address} {this.props.profile.service_address2} <br />
                      {this.props.profile.service_city}, {this.props.profile.service_state} {this.props.profile.service_zipcode}</p>


                    <p className="text-muted small">
                      *Your credit card will NOT be charged until service is complete.  Price includes Sales Tax, as applicable.  An overgrown lawn surcharge of up to $20 may apply if the length of grass exceeds 6".  Excessively overgrown, oversized. or complex lawns may require a custom price quote.
                    </p>
                  </div>
                </div>
                <div>
                  { this.props.profile.card ? false : <PaymentForm job={appointment} profile={this.props.profile} update_data={this.props.update_data} />}
                </div>
                </td>
            </tr>
            </tbody>
          </table>
        )
      }.bind(this));

      return(
        <div>

          <div id="customer-appointments">
            <table id="quick-book" className={ this.props.profile.card  && quick_book ? 'table appointment-table' : 'hidden' }>
              <tbody>
              <tr>
                <td>
                  <h3>Need your lawn mowed?</h3>
                  <span className="muted">Book a mowing service at {this.props.profile.service_address} {this.props.profile.service_address2}</span>
                </td>
                <td className='edge'>
                  <button className="btn btn-success" data-toggle='modal' data-target="#book-modal">Book Now</button>
                </td>
              </tr>
              </tbody>
            </table>
              {appointments}
          </div>
        </div>
      )
    }
  });

});