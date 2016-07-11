import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, IndexRedirect, Link, useRouterHistory } from 'react-router'

(function(){
	const aboutDiv = document.getElementById('company');

	const TopNav = React.createClass({
		render() {
			const { routes, currentRoute } = this.props;

			const navLinks = routes.map((route, i) => {
				const linkActive = route.pathname === currentRoute.pathname ? 'active' : '';

				return (
					<li key={i}>
						<Link className={linkActive} to={route.pathname}>{route.title}</Link>
					</li>
				)
			});

			return (
				<div className="account-nav">
					<div className="row">
						<div className="container">
							<ul>
								{navLinks}
							</ul>
						</div>
					</div>
				</div>
			);
		}
	});

	const LeftNav = React.createClass({
		render() {
			const { pathname, childRoutes } = this.props;

			const leftNavLinks = childRoutes.map((childRoute, i) => {
				const linkActive = pathname === childRoute.pathname ? 'active' : '';

				return (
					<li key={i}>
						<Link className={linkActive} to={childRoute.pathname}>{childRoute.title}</Link>
					</li>
				)
			});


			return (
				<ul className="left-nav">
					{leftNavLinks}
				</ul>
			);
		}
	});

	const AboutPage = React.createClass({
		render() {
			const { pathname } = this.props.location;
			const routes = [
				{
					title: 'About Loom',
					pathname: '/about',
					childRoutes: [
						{
							title: 'About',
							pathname: '/about'
						},
						{
							title: 'Careers',
							pathname: '/about/careers'
						}
					]
				},
				{
					title: 'About Coding Projects',
					pathname: '/coding'
				},
				{
					title: 'About Listing Projects',
					pathname: '/listing'
				}
			];

			let currentRoute;

			routes.map((route) => {
				if(route.pathname === pathname) {
					currentRoute = route;
				}

				if(route.childRoutes) {
					route.childRoutes.map((childRoute) => {
						if (childRoute.pathname === pathname) {
							currentRoute = route;
						}
					})
				}
			})

			const containerComponent = currentRoute.childRoutes ? (
				<div>
					<div className="col-md-2">
						<LeftNav pathname={pathname} childRoutes={currentRoute.childRoutes}/>
					</div>
					<div className="col-md-10">
							{this.props.children}
					</div>
				</div>
			) : (
				<div className="col-md-12">{this.props.children}</div>
			)

			return (
				<div id="about-us">

					<TopNav routes={routes} currentRoute={currentRoute}/>

					<div className="row about-content">
						<div className="container">
							{containerComponent}
						</div>
					</div>

				</div>
			)
		}
	});

	const AboutLoom = React.createClass({
		render() {
			return (
					<div>
						<h2 className="text-yellow">About Loom</h2>
						<p>This is where the About Us text would go.</p>
					</div>
			)
		}
	});

	const Listing = React.createClass({
		render() {
			return (
					<div>
						<h2 className="text-yellow">Listing</h2>
						<p>Lol looks, listings!</p>
					</div>
			)
		}
	});

	const Coding = React.createClass({
		render() {
			return (
					<div>
						<h2 className="text-yellow">Coding</h2>
						<p>look at this code: <code>const one = 1;</code></p>
					</div>
			)
		}
	});

	const AboutCareers = React.createClass({
		render() {
			return (
					<div>
						<h2 className="text-yellow">About Careers</h2>
						<p>Get a lob you lazy bum!</p>
					</div>
			)
		}
	});

	if(aboutDiv) {
		const browserHistory = useRouterHistory(createHashHistory)({ queryKey: false });

		// remember to update the list of routes in the AboutPage component to match this. I'd like to consolidate the router configuration at some point.
		ReactDOM.render((
			<Router history={browserHistory}>
					<Route path="/" component={AboutPage}>
						<IndexRedirect to="/about" />
						<Route path="/about">
							<Route path="careers" component={AboutCareers}/>
							<IndexRoute component={AboutLoom}/>
						</Route>
						<Route path="/coding" component={Coding}/>
						<Route path="/listing" component={Listing}/>
						<Route path="*" component={AboutLoom}/>
					</Route>
			</Router>
		), aboutDiv);
	}
})();