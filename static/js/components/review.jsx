
define(['react', 'jquery', 'jsx!components/spinner', 'rating'], function(React, $, Spinner) {

  return React.createClass({
    getInitialState: function () {
      return {
        is_loading: false
      }
    },
    componentDidMount: function () {
      $('.job-rating').rating();
      $('.job-rating').on('rating.change', function(event, value, caption) {
        $('.job-rating').val(value);
      });
    },
    addReview: function (e) {
      e.preventDefault();
      this.setState({is_loading: true});
      var $form = $(e.currentTarget).parent();
      $.ajax({
        url: hm_api.review,
        method: 'POST',
        data: {rating: $form.find('.job-rating').val(), notes: $form.find('.job-notes').val(), job: $(e.currentTarget).data('id')},
        success: function () {
          this.props.update_data();
        }.bind(this)
      });
    },
    render: function () {
      return (
        <div className="bottom-spacer">
          <div className="text-muted">
            <form className="job-rater">
              <input className="job-rating" type="number" min="0" max="5" step="1" data-size="md" />
              <div className="form-group">
                <textarea className="job-notes form-control" placeholder="Start your review..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary" data-id={this.props.job.id} onClick={this.addReview}>
                <Spinner is_loading={this.state.is_loading} /> Leave Review
              </button>
            </form>
          </div>
          <p className="hidden bg-success">
            Thank you for your feedback.
          </p>
        </div>
      )
    }
  });

});