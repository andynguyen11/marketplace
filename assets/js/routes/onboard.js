import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, IndexRedirect, Link, useRouterHistory } from 'react-router';

import DeveloperOnboard from './onboarding/developer';
import EntrepreneurOnboard from './onboarding/entrepreneur';
import PrelaunchOnboard from './onboarding/prelaunch';

(function(){
  $(document).ready(_ => {
    const onboardDiv = document.getElementById('onboard-form');

	  // LinkedIn redirect hack
	  // TODO Figure out work around for LinkedIn redirect appending #! to url which breaks router
    if (window.location.pathname === '/signup/developer/') {
      ReactDOM.render(<DeveloperOnboard />, onboardDiv);
    }
    else if (window.location.pathname === '/signup/entrepreneur/') {
      ReactDOM.render(<EntrepreneurOnboard />, onboardDiv);
    }
    else if (window.location.pathname === '/signup/prelaunch/') {
      ReactDOM.render(<PrelaunchOnboard />, onboardDiv);
    }
  });
})();
