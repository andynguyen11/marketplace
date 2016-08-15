import React from 'react';
import ReactDOM from 'react-dom';
import ProjectCarousel from '../components/ProjectCarousel';

(function(){
  $(document).ready(_ => {
    ReactDOM.render(<ProjectCarousel projects={window.featuredProjects}/>, document.getElementById('featured-project-carousel'));
    ReactDOM.render(<ProjectCarousel projects={window.newProjects}/>, document.getElementById('new-project-carousel'));
  });
})();
