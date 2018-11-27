import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Navbar from './navbar';
import InvalidRoute from './invalidRoute';
import Home from './home';
import GraphVis from './graphVis';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="row header">
          <h1>SuGraVi</h1>
        </div>
        <Navbar />
        <div>
          <Switch>
            <Route path="/invalid" exact component={InvalidRoute} />
            <Route path="/home" exact component={Home} />
            <Route path="/graphvis" exact component={GraphVis} />
            <Redirect from="/" to="/home" />
            <Redirect to="/invalid" />
          </Switch>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
