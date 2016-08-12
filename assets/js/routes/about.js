import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, IndexRedirect, Link, useRouterHistory } from 'react-router';

(function(){
	const aboutDiv = document.getElementById('about');

	const TopNav = React.createClass({
		render() {
			const { routes, currentRoute } = this.props;

			const navLinks = routes.map((route, i) => {
				const linkActive = route.pathname === currentRoute.pathname ? 'active' : '';

				return (
					<li key={i}>
            { route.href ?
            <a href={route.href} target='_blank'>{route.title}</a>
            :
            <Link className={linkActive} to={route.pathname} >{route.title}</Link>
            }

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
          { childRoute.href ?
            <a href={childRoute.href} target='_blank'>{childRoute.title}</a>
            :
            <Link className={linkActive} to={childRoute.pathname} >{childRoute.title}</Link>
          }
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
					pathname: '/company',
					childRoutes: [
						{
							title: 'About',
							pathname: '/company',
              href: ''
						},
						{
							title: 'Careers',
							pathname: '/company/careers',
              href: ''
						},
            {
              title: 'Press',
              pathname: '',
              href: 'http://loom.totemapp.com/'
            },
            {
              title: 'Support',
              pathname: '',
              href: 'http://support.joinloom.com/'
            },
            {
              title: 'Terms of Service',
              pathname: '/company/terms-of-service',
              href: ''
            },
            {
              title: 'Privacy Policy',
              pathname: '/company/privacy',
              href: ''
            },
            {
              title: 'DMCA Policy',
              pathname: '/company/dmca',
              href: ''
            },
            {
              title: 'Contact',
              pathname: '/company/contact',
              href: ''
            }
					]
				},
				{
					title: 'Freelancing on Loom',
					pathname: '',
          href: 'https://joinloom.zendesk.com/hc/en-us/categories/203556327-Help-with-Freelancing-on-Loom'
				},
				{
					title: 'Hiring on Loom',
					pathname: '',
          href: 'https://joinloom.zendesk.com/hc/en-us/categories/203556347-Help-with-Hiring-on-Loom'
				},
        {
					title: 'Loom Support Center',
					pathname: '',
          href: 'https://joinloom.zendesk.com/hc/en-us'
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
			});

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

  const Terms = React.createClass({
    render() {
      return (
        <div>

          </div>
      )
    }
  });

  const Privacy = React.createClass({
    render() {
      return (
            <div>


          </div>
      )
    }
  });

  const DMCA = React.createClass({
    render () {
      return (
       <div>

        </div>
      )
    }
  });

	const AboutLoom = React.createClass({
		render() {
			return (
					<div>

					</div>
			)
		}
	});

	const Contact = React.createClass({
		render() {
			return (
					<div>

					</div>
			)
		}
	});

	const AboutCareers = React.createClass({
		render() {
			return (
					<div>

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
              <Route path="privacy" component={Privacy}/>
              <Route path="terms-of-service" component={Terms}/>
              <Route path="dmca" component={DMCA}/>
              <Route path="contact" component={Contact}/>
							<IndexRoute component={AboutLoom}/>
						</Route>
						<Route path="*" component={AboutLoom}/>
					</Route>
			</Router>
		), aboutDiv);
	}
})();