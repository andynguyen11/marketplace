define(
  ['../../../bower_components/react/react',
    'jsx!components/provider/jobs',
    'jsx!components/spinner'],
  function(React, Jobs, Spinner) {

    return React.createClass({
      getInitialState: function () {
        return {
          is_loading: true,
          profile: {},
          jobs: [],
          base_price: 0,
          active_tab: '#jobs'
        };
      },
      completeJob: function (e) {
          $(e.currentTarget).prop('disabled', true);
          $.ajax({
              url: '/job/complete/',
              method: 'POST',
              data: {job_id: e.currentTarget.dataset.job},
              success: function () {
                this.loadJobs();
                $('.modal').modal('hide');
              }.bind(this)
            });
      },
      loadJobs: function () {
        $.get(hm_api.provider_job, function (result) {
          this.setState({
            jobs: result,
            is_loading: false
          });
        }.bind(this));
      },
      componentDidMount: function () {
        this.loadJobs();
      },
      render: function () {
        return (
          <div>
            <div className='text-center'>
              <h2><Spinner is_loading={this.state.is_loading} /></h2>
            </div>

            <div id="jobs" className={this.state.active_tab == '#jobs' ? '' : 'hidden'} >
              <Jobs jobs={this.state.jobs} />
              <div className="modal fade col-md-12" id="job-complete-confirmation" >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-body">
                    <h3>Are you sure you want to mark this job as complete?  This action cannot be undone.</h3>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-default pull-left" data-dismiss="modal" aria-label="Close">Cancel</button>
                    <button id="confirm-complete" onClick={this.completeJob} className="btn btn-primary pull-right">Complete Job</button>
                    <div className="clearfix"></div>
                  </div>
                </div>
              </div>
            </div>
            </div>

          </div>
        )
      }
    });

});