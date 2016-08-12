import React from 'react'

let Loader = React.createClass({
  render() {
      return (
        <div id='loader'>
          <div className='hex-loader text-center'></div>
          <h3 className='brand-bold text-center'>Raising ideas...</h3>
        </div>
      );
  }
});

export default Loader;
