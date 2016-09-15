import React from 'react';
import ReactDOM from 'react-dom';
import CreateProject from './project/CreateProject';
import { NewProject } from './project/CreateProject';

(function(){
  const newProjectContainer = document.getElementById('newProject');

  if(newProjectContainer && window.location.search.search('oldflow') < 0) {
    ReactDOM.render(NewProject, newProjectContainer);
  }

  const onboardDiv = document.getElementById('project-root');

  if(onboardDiv && window.location.search.search('oldflow') >= 0) {
    ReactDOM.render(<CreateProject />, onboardDiv);
  }
})();