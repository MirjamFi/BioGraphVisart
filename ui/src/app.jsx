import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import Navbar from './navbar';
import HomePage from './pages/homePage';
import NewKeggNetworkVisPage from './pages/newKeggNetworkVisPage';
import KeggNetworkVisPage from './pages/keggNetworkVisPage';
/*
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import ConfirmationMail from './utils/confirmationMail';
import ConfirmationLink from './utils/confirmationLink';
import RegisterLoginPage from './pages/registerLoginPage';
import ScoresPage from './pages/scoresPage';
import NetworksPage from './pages/networksPage';
import RunsPage from './pages/runsPage';
import SubgraphsPage from './pages/subgraphsPage';
*/

class App extends Component {
  state = {}
  /*
  componentDidMount() {
    try {
      const user = localStorage.getItem('accessToken');
      console.log(user);
      this.setState({ user });
    } catch (error) {}
  }
  */ 
  render() {
    return (
      <React.Fragment>
        <Navbar user={this.state.user} />
        <ToastContainer />
        <Switch>
          <Route path="/new" exact component={NewKeggNetworkVisPage} />
          <Route path="/vis/new" exact component={KeggNetworkVisPage} />
          <Route path="/home" exact component={HomePage} />
          <Redirect from="/" to="/home" />
          <Redirect to="/home" />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;
