import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { setGithubToken } from '../actions/github';
import Auth from '../lib/github/AuthenticationPage';
import url from 'url';

class Home extends Component {
  componentWillMount() {
    const parsed = url.parse(window.location.href, true);
    const code = parsed.query && parsed.query.code;
    if (code) {
      this.props.setGithubToken(code, this.props.history);
    }
  }


  render() {
    return (
      <div>
        <h1>Your jekyll blogs</h1>
      </div>
      // <Auth
      //   clientId="2a162c4057c7c5b9e020"
      //   base_url="https://github.com/login/oauth/authorize"
      // />
    );
  }
}

export default connect((state) => ({
  sites: state.sites,
  token: state.user.tokens && state.user.tokens[0],
}), { setGithubToken })(withRouter(Home));
