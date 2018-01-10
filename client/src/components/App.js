import React, { Component } from 'react';
import NoMatch from './NoMatch';
import Login from './Login';
import Register from './Register';
import Flash from './Flash';
import Home from './Home';
import Connect from './Connect';
import Site from './Site';
import ProtectedRoute from './ProtectedRoute';
import AuthRoute from './AuthRoute';
import FetchUser from './FetchUser';
import { Switch, Route } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <div style={{height: '100%'}}>
        <Flash />
        <FetchUser>
          <Switch>
            <ProtectedRoute exact path='/' component={Connect} />
            <AuthRoute exact path='/login' component={Login} />
            <AuthRoute exact path='/register' component={Register} />
            <ProtectedRoute exact path='/site/:site' component={Site} />
            <ProtectedRoute exact path='/site/:site/:collection' component={Site} />
            <Route component={NoMatch} />
          </Switch>
        </FetchUser>
      </div>
    );
  }
}

export default App;
