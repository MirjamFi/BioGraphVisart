import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

/*
import search from './utils/search';
import logout from './utils/logout';
*/

import './styles/navbar.css';

class Navbar extends Component {

  renderIfNo(user) {
    if (user) {
      return null;
    }
    return (
      <React.Fragment>
     	 	<NavLink
     	    className="nav-item nav-link"
          to="/new" 
     	 	>
     	    New
				</NavLink>
     	 	<NavLink
     	    className="nav-item nav-link"
          to="/visualizations" 
     	 	>
     	    Your Visualizations
				</NavLink>

      </React.Fragment>
    );
  }

  renderIf(user) {
    if (!user) {
      return null;
    }
    return null
  }

  render() {
    const { user } = this.props;
    return (
      <nav className="navbar navbar-default navbar-expand-lg navbar-light">
        <NavLink 
          className="nav-item nav-link"
          to="/"
        >
          <button 
            className="navbar-brand btn btn-link"
          >
          {"  "}BioGraphVisArt
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
