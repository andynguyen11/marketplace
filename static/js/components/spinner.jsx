
define(['react'], function(React) {

  return React.createClass({
    render: function () {
      return (
        <span className='spinner'>
          <i className={ this.props.is_loading ? 'fa load fa-circle-o-notch fa-spin' : 'hidden'} ></i>
        </span>
      )
    }
  });

});