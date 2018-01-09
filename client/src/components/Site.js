import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import NavBar from './NavBar';
import { fetchRepos } from '../actions/github';

class Repos extends Component {
  componentWillMount() {
  }

  componentWillReceiveProps(props) {

  }

  render() {
    const { } = this.props;
    return (
      <div>
        <NavBar />
      </div>
    );
  }
}

export default connect(state => ({
}), { fetchRepos })(withRouter(Repos));
