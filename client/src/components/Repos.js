import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { List } from 'antd';
import { fetchRepos } from '../actions/github';

class Repos extends Component {
  componentWillMount() {
    this.props.fetchRepos();
  }

  render() {
    const { repos } = this.props;
    return (
      <List
        bordered
        dataSource={repos}
        renderItem={item => (<List.Item>{item.name}</List.Item>)}
      />
    );
  }
}

export default connect(state => ({
  repos: state.repos
}), { fetchRepos })(withRouter(Repos));
