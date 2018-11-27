import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <Link className="nav-link" to="/home">Home</Link>
      <Link className="nav-link" to="/graphvis">New</Link>
    </nav>
  );
}

export default Navbar;
