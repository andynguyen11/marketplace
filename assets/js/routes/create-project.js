import React from 'react';
import ReactDOM from 'react-dom';
import NewProject from './project/CreateProject';

(function(){
  const newProjectContainer = document.getElementById('newProject');

  if(newProjectContainer) {
    ReactDOM.render(NewProject, newProjectContainer);
  }
})();