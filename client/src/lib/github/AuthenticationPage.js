import PropTypes from 'prop-types';
import React from 'react';
import Authenticator from './netlify-auth';
import { Icon, Button } from 'antd';

export default class AuthenticationPage extends React.Component {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    inProgress: PropTypes.bool,
  };

  state = {};

  handleLogin = (e) => {
    e.preventDefault();
    const cfg = {
      base_url: this.props.base_url + '?client_id=' + this.props.clientId,
      site_id: this.props.siteId
    };
    const auth = new Authenticator(cfg);

    auth.authenticate({ provider: 'github', scope: 'repo' });
    // , (err, data) => {
    //   if (err) {
    //     this.setState({ loginError: err.toString() });
    //     return;
    //   }
    //   this.props.onLogin(data);
    // });
  };

  render() {
    const { loginError } = this.state;
    const { inProgress } = this.props;

    return (
      <section className="nc-githubAuthenticationPage-root">
        {loginError && <p>{loginError}</p>}
        <Button
          type="primary"
          disabled={inProgress}
          onClick={this.handleLogin}
        >
          <Icon type="github" /> {inProgress ? "Logging in..." : "Login with GitHub"}
        </Button>
      </section>
    );
  }
}
