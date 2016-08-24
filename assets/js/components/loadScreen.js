import React from 'react'

let Loader = React.createClass({
  render() {
      return (
        <div id='loader'>
          <div className='loader-content'>
            <div className="spinner">
              <div className="dot1"></div>
              <div className="dot2"></div>
            </div>
            <h1 className='brand-bold text-center text-brand'>Raising ideas...</h1>
          </div>
          <div className='modal-overlay'></div>

        </div>
      );
  }
});

export default Loader;
