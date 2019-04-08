import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import routes from '../routes';
import { AUTH_PATH } from '../config';

import './styles/navbar.css';

class Navbar extends Component {
  renderIfNo(user) {
    if (user) {
      return null;
    }
    return (
      <React.Fragment>
        <a
          href={`https://${window.location.hostname}${AUTH_PATH}/login`}
          className="btn btn-primary m-2"
          role="button"
        >
          Login
        </a>
        <a
          href={`https://${window.location.hostname}${AUTH_PATH}/register`}
          className="btn btn-primary m-2"
          role="button"
        >
          Register
        </a>
      </React.Fragment>
    );
  }

  renderIf(user) {
    if (!user) {
      return null;
    }
    return (
      <React.Fragment>
     	 	<NavLink
     	    className="nav-item nav-link"
          to={routes.viewer} 
     	 	>
     	    Viewer
				</NavLink>
     	 	<NavLink
     	    className="nav-item nav-link"
          to={routes.visTable} 
     	 	>
     	    Your Visualizations
				</NavLink>
        <a 
          href={`https://${window.location.hostname}${AUTH_PATH}/logout`}
          className="btn btn-warning m-4"
          role="button"
        >
          Log out 
        </a>
      </React.Fragment>
    );
  }

  render() {
    const { user } = this.props;
    return (
      <nav className="navbar navbar-default navbar-expand-lg navbar-light">
        <NavLink 
          className="nav-item nav-link"
          to={routes.home}
        >
          <button 
            className="navbar-brand btn btn-link"
          >
          {"  "}BioGraphExplorer
          </button>
        </NavLink>
        <div className="collapse navbar-collapse" id="navbarNav">
          {this.renderIfNo(user)}
          {this.renderIf(user)}
			  </div>
		  </nav>
    );
  }
};

export default Navbar;
