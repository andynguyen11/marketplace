import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import CreateProject from '../components/project/CreateProject';

function renderRoute({route, id}){
	const rootElement = document.getElementById(id);
	if(rootElement) {
		const browserHistory = useRouterHistory(createHashHistory)({ queryKey: false });
		ReactDOM.render((
			<Router history={browserHistory}>
                { route }
			</Router>
		), rootElement)
	}
}

$(document).ready(_ => renderRoute({
    id: 'project-root',
    route: (<Route path="/" component={ CreateProject }/ >),
}))
