import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, IndexRedirect, Link, useRouterHistory } from 'react-router'

let DeveloperOnboard = require('../components/onboarding/developer');
let EntrepreneurOnboard = require('../components/onboarding/entrepreneur');

(function(){
	const onboardDiv = document.getElementById('onboard-form');

	const OnboardForm = React.createClass({
		render() {
			const { pathname } = this.props.location;
			const routes = [
				{
					title: 'Developer Sign Up',
					pathname: '/developer'
				},
				{
					title: 'Entrepreur Sign Up',
					pathname: '/entrepreneur'
				}
			];

			let currentRoute;

			routes.map((route) => {
				if(route.pathname === pathname) {
					currentRoute = route;
				}
			});

			return (
				<div id="about-us">

					<div className="row about-content">
						<div className="container">
							<div className="col-md-12">{this.props.children}</div>
						</div>
					</div>

				</div>
			)
		}
	});

	if(onboardDiv) {
		const browserHistory = useRouterHistory(createHashHistory)({ queryKey: false });

		// remember to update the list of routes in the AboutPage component to match this. I'd like to consolidate the router configuration at some point.
		ReactDOM.render((
			<Router history={browserHistory}>
					<Route path="/" component={OnboardForm}>
						<Route path="/developer" component={DeveloperOnboard}/>
						<Route path="/entrepreneur" component={EntrepreneurOnboard}/>
					</Route>
			</Router>
		), onboardDiv);
	}
})();