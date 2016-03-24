define(['react', 'mapbox'], function(React, L) {

  return React.createClass({
    getInitialState: function () {
      return {
        current_job: 0
      }
    },
    handleCurrentService: function(e) {
      this.props.set_service($(e.currentTarget).data('service'));
      this.props.set_charge($(e.currentTarget).data('price'));
    },
    showAppointmentDetails: function(e) {
      var new_job = $(e.currentTarget).data('job');
      if (this.state.current_job == new_job) {
        new_job = -1
      }
      this.setState({
        current_job: new_job
      })
    },
    showCompleteJobModal: function (e) {
        $('#job-complete-confirmation').modal('show');
        $('#confirm-complete').attr('data-job', e.currentTarget.dataset.job);
    },
    render: function () {
      var jobs = this.props.jobs.map(function(job, i) {
        var completed = false;
        if (job.date_completed) {
          status_color = '';
          status_class = 'fa fa-check-circle text-success';
          status = 'Completed';
          completed = true;
        }  else if (job.scheduled) {
          status_color = 'text-orange';
          status_class = 'fa fa-star text-orange';
          status = 'Scheduled On';
        } else {
          status_color = 'text-primary';
          status_class = 'fa fa-circle text-primary';
          status = 'Service By';
        }

        return(
          <table className='table appointment-table' key={i}>
            <tbody>
            <tr className={i == this.state.current_job ? 'active appointment' : 'appointment'} data-job={i} onClick={this.showAppointmentDetails} >
              <td className='edge text-center'>
                <i className={status_class}></i>
              </td>
              <td>
                <h4><span className={status_color + ' upper'}><strong>{status}</strong></span> {job.date_completed ? job.date_completed : job.date_targeted}</h4>
                <span className="text-muted">{job.service_name} at {job.customer.service_address} {job.customer.service_address2}</span>

              </td>
              <td className='edge'>
                <h3><i className={i == this.state.current_job ? 'fa fa-chevron-down' : 'fa fa-chevron-right'} ></i></h3>
              </td>
            </tr>
            <tr className={i == this.state.current_job ? 'job-details' : 'job-details hidden'}>
              <td colSpan="3">
                <div>
                  <div className='col-md-6'>
                    <img className='appointment-map' src={'https://api.mapbox.com/v4/mapbox.streets/pin-s-building('+job.customer.service_long+','+job.customer.service_lat+')/'+job.customer.service_long+','+job.customer.service_lat+',13/300x300@2x.png?access_token=pk.eyJ1IjoiaW5ub3ZlcnRlZCIsImEiOiJhZmU3NTUzMjA2MTVhYWMwMjY5ZDNjYTU1YWY4YTc2MyJ9.ybhRWckkJ3v2IudwBFV5Cw'} />
                  </div>
                  <div className='col-md-6'>
                      <button onClick={ this.showCompleteJobModal } data-job={ job.id } className={ job.date_completed ? 'hidden' : 'btn btn-success btn-complete upper'} >Mark Job as Completed</button>

                      <h4>Service Address</h4>
                      <p><a href={'http://maps.google.com/maps?q=loc:'+job.customer.service_lat+','+job.customer.service_long} >{job.customer.service_address} {job.customer.service_address2} <br />
                      {job.customer.service_city}, {job.customer.service_state} {job.customer.service_zipcode}</a></p>

                      <h4>Customer Notes</h4>
                      <p className='text-danger'>{job.notes ? job.notes : 'N/A'}</p>

                      <h4>Payment Status</h4>
                      <p className={job.date_completed && !job.date_charged ? '' : 'hidden'}>PAYMENT PENDING</p>
                      <p className={job.date_completed && job.date_charged ? '' : 'hidden'}>{job.date_charged ? 'PAID' : 'PENDING COMPLETION'}</p>

                      <h4>Total Income</h4>
                      <p>${job.total_income}</p>

                      <h4>Sales Tax</h4>
                      <p>${job.sales_tax}</p>

                      <h4>Net Income</h4>
                      <p>${job.net_income}</p>

                  </div>
                </div>
                </td>
            </tr>
            </tbody>
          </table>
        )
      }.bind(this));

      return(
        <div>

          <div id="customer-jobs">
              {jobs}
          </div>
        </div>
      )
    }
  });

});