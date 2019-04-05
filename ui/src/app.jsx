import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import store from './store';
import Navbar from './components/navbar';
import AppRouter from './router';
import { getLogin } from './services/auth';

import 'react-toastify/dist/ReactToastify.css';

import 'react-table/react-table.css';
import './components/utils/tables/styles/tableHeader.css';
import './components/utils/tables/styles/tableBody.css';
import './components/utils/tables/styles/tableNavigation.css';

class App extends Component {
  state = {
    loggedIn: false,
  }

  async componentWillMount() {
    try {
      const loggedIn = await getLogin();
      this.setState({ loggedIn });
      console.log(loggedIn);
    } catch (error) {}
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <Provider store={store}>
        <Navbar user={loggedIn} />
        <ToastContainer />
        <AppRouter loggedIn={loggedIn} />
      </Provider>
    );
  }
}

export default App;
