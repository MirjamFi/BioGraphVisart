import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import store from './store';
import route from './utils/routing';
import Navbar from './components/navbar';
import HomePage from './components/pages/homePage';
import NewKeggNetworkVisPage from './components/pages/newKeggNetworkVisPage';
import Vis from './components/vis/vis.component';
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
          <Route path={route('/new')} exact component={NewKeggNetworkVisPage} />
          <Route path={route('/vis')} exact component={Vis} />
          <Route path={route('/home')} exact component={HomePage} />
          <Redirect from={route('/')} to={route('/home')} />
          <Redirect to={route('/home')} />
        </Switch>
      </Provider>
    );
  }
}

export default App;
