import React from 'react';
import ReactDOM from 'react-dom';
import {createHashHistory} from 'history';
import {Router, Route, Redirect, IndexRedirect, Link, useRouterHistory} from 'react-router';
import CompanySettings from './settings/company';
import AccountSettings from './settings/account';
import {objectToFormData} from './project/utils';


(function () {
  const settingsDiv = document.getElementById('settings');

  const TopNav = React.createClass({
    render() {
      const {routes, currentRoute} = this.props;

			const navLinks = routes.map((route, i) => {
				const linkActive = currentRoute && route.pathname === currentRoute.pathname ? 'active' : '';

        return (
          <li key={i}>
            <Link className={linkActive} to={route.pathname}><h3 className="brand">{route.title}</h3></Link>
          </li>
        )
      });

      return (
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <ul className="settings-nav">
              {navLinks}
            </ul>
            <p>
              We're doing our best to keep these settings updated as we learn and grow. If you need any support related
              to your account, email <a href="emailto:support@joinloom.com">support@joinloom.com</a> and we'll do our
              best to get it handled for you.
            </p>
          </div>
        </div>
      );
    }
  });


  const SettingsPage = React.createClass({

    saveAccount(profile) {
      $.ajax({
        url: loom_api.profile + profile.id + '/',
        method: 'PATCH',
        data: objectToFormData(profile),
        contentType: false,
        processData: false,
        success: function (result) {
          window.location = '/profile/dashboard/';
        }.bind(this)
      });
    },
    render() {
      const {pathname} = this.props.location;
      const routes = [
        {
          title: 'Account Settings',
          pathname: '/account'
        },
        {
          title: 'Company Settings',
          pathname: '/company'
        }
      ];

      let currentRoute;

      routes.map((route) => {
        if (route.pathname === pathname) {
          currentRoute = route;
        }
      });

      return (
        <div id="settings">
          <TopNav routes={routes} currentRoute={currentRoute}/>
          {this.props.children && React.cloneElement(this.props.children, {
            saveAccount: this.saveAccount
          })}
        </div>
      )
    }
  });


  if (settingsDiv) {
    const browserHistory = useRouterHistory(createHashHistory)({queryKey: false});

    ReactDOM.render((
      <Router history={browserHistory}>
        <Route path="/" component={SettingsPage}>
          <IndexRedirect to="/account"/>
          <Redirect from="/profile" to="/account"/>
          <Route path="/account" component={AccountSettings}/>
          <Route path="/company" component={CompanySettings}/>
        </Route>
      </Router>
    ), settingsDiv);
  }
})();