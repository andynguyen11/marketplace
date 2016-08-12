import React from 'react'

let Loader = React.createClass({
  render() {
      return (
        <div id='loader'>
          <div className='loader-content'>
            <h2 className='text-center'><i className='fa fa-circle-o-notch fa-spin fa-fw'></i></h2>
            <h1 className='brand-bold text-center text-brand'>Raising ideas...</h1>
          </div>
          <div className='modal-overlay'></div>

        </div>
      );
  }
});

export default Loader;
