import React, { Component } from 'react';
import NoMatch from './NoMatch';
import Login from './Login';
import Register from './Register';
import Flash from './Flash';
import Home from './Home';
import Connect from './Connect';
import Repos from './Repos';
import ProtectedRoute from './ProtectedRoute';
import AuthRoute from './AuthRoute';
import FetchUser from './FetchUser';
import { Switch, Route } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <div>
        <Flash />
        <FetchUser>
          <Switch>
            <ProtectedRoute exact path='/' component={Connect} />
            <ProtectedRoute exact path='/repos' component={Repos} />
            <AuthRoute exact path='/login' component={Login} />
            <AuthRoute exact path='/register' component={Register} />
            <Route component={NoMatch} />
          </Switch>
        </FetchUser>
      </div>
    );
  }
}

export default App;
