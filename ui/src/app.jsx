import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import store from './store';

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
*/

import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
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
      <Provider store={store}>
        <Navbar user={undefined} />
        <ToastContainer />
        <Switch>
          <Route path="/new" exact component={NewKeggNetworkVisPage} />
          <Route path="/vis" exact component={KeggNetworkVisPage} />
          <Route path="/home" exact component={HomePage} />
          <Redirect from="/" to="/home" />
          <Redirect to="/home" />
        </Switch>
      </Provider>
    );
  }
}

export default App;
