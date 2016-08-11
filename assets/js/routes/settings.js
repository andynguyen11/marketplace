import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, IndexRedirect, Link, useRouterHistory } from 'react-router';
import ProfileSettings from './settings/profile';
import CompanySettings from './settings/company';

(function(){
	const settingsDiv = document.getElementById('settings');

	const TopNav = React.createClass({
		render() {
			const { routes, currentRoute } = this.props;

			const navLinks = routes.map((route, i) => {
				const linkActive = route.pathname === currentRoute.pathname ? 'active' : '';

				return (
                    <li key={i}>
                       <Link className={linkActive} to={route.pathname}><h2 className="brand">{route.title}</h2></Link>
                    </li>
				)
			});

			return (
                <div className="row">
                  <div className="container">
                    <div className="col-md-12">
                      <ul className="settings-nav">
                        {navLinks}
                      </ul>
                      <p>
                        We're doing our best to keep these settings updated as we learn and grow. If you need any support related
                        to your account, email <a href="emailto:support@joinloom.com">support@joinloom.com</a> and we'll do our best to get it handled for you.
                      </p>
                    </div>
                  </div>
                </div>
			);
		}
	});


	const SettingsPage = React.createClass({
		render() {
			const { pathname } = this.props.location;
			const routes = [
				{
					title: 'Profile Settings',
					pathname: '/profile'
				},
				{
					title: 'Company Settings',
					pathname: '/company'
				}
			];

			let currentRoute;

			routes.map((route) => {
				if(route.pathname === pathname) {
					currentRoute = route;
				}
			});

			return (
				<div id="settings">
					<TopNav routes={routes} currentRoute={currentRoute}/>
          { this.props.children }
				</div>
			)
		}
	});


	if(settingsDiv) {
		const browserHistory = useRouterHistory(createHashHistory)({ queryKey: false });

		ReactDOM.render((
			<Router history={browserHistory}>
					<Route path="/" component={SettingsPage}>
						<IndexRedirect to="/profile" />
						<Route path="/profile" component={ProfileSettings}/>
						<Route path="/company" component={CompanySettings}/>
					</Route>
			</Router>
		), settingsDiv);
	}
})();