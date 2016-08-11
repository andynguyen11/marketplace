import React from 'react';
import ReactDOM from 'react-dom';
import CreateProject from './project/CreateProject';

(function(){
  $(document).ready(_ => {
    const onboardDiv = document.getElementById('project-root');
    ReactDOM.render(<CreateProject />, onboardDiv);

  });
})();