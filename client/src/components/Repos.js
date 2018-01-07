import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import NavBar from './NavBar';
import { List } from 'antd';
import { fetchRepos } from '../actions/github';

class Repos extends Component {
  componentWillMount() {
    if (!this.props.token) {
      this.props.history.push('/');
      return;
    }
    this.props.fetchRepos();
  }

  componentWillReceiveProps(props) {
    if (!props.token) {
      this.props.history.push('/');
      return;
    }
  }

  render() {
    const { repos } = this.props;
    return (
      <div>
        <NavBar />
        <List
          bordered
          dataSource={repos}
          renderItem={item => (<List.Item>{item.name}</List.Item>)}
        />
      </div>
    );
  }
}

export default connect(state => ({
  repos: state.repos,
  token: state.user.tokens && state.user.tokens[0]
}), { fetchRepos })(withRouter(Repos));
