import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import routes from './routes';

import HomePage from './components/pages/homePage';
import Viewer from './components/vis/vis.component';
import VisTablePage from './components/pages/visTablePage';

const AppRouter = ({ loggedIn }) => {
  if (loggedIn) {
    return (
      <Switch>
        <Route path={routes.viewer} component={Viewer} />
        <Route path={routes.visTable} exact component={VisTablePage} />
        <Route path={routes.home} exact component={HomePage} />
        <Redirect to={routes.home} />
      </Switch>
    );
  }
  return (
    <Switch>
      <Route path={routes.home} exact component={HomePage} />
      <Redirect to={routes.home} />
    </Switch>
  );
}

export default AppRouter;
