import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import store from './store';
import Navbar from './components/navbar';
import AppRouter from './router';

import 'react-toastify/dist/ReactToastify.css';

import 'react-table/react-table.css';
import './components/utils/tables/styles/tableHeader.css';
import './components/utils/tables/styles/tableBody.css';
import './components/utils/tables/styles/tableNavigation.css';

const App = () => {
  return (
    <Provider store={store}>
      <Navbar user={undefined} />
      <ToastContainer />
      <AppRouter />
    </Provider>
  );
}

export default App;
