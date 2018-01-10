import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import SideMenu from './SideMenu';
import './site.css';
import { fetchCollection } from '../actions/github';
import ListPage from './ListPage';
import Edit from './Edit';

const { Content } = Layout;

class Site extends React.Component {
  render() {
    const { route, match } = this.props;
    const { item } = match.params;
    return (
      <Layout style={{height: '100%', backgroundColor: '#fcfcfc'}}>
        <SideMenu initiallyCollapsed={!!item} />
        <Layout style={{height: '100%'}}>
          <Content style={{height: '100%'}}>
            <Switch>
              <Route exact path='/site/:site' component={ListPage} />
              <Route exact path='/site/:site/:collection' component={ListPage} />
              <Route exact path='/site/:site/:collection/:item' component={Edit} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default connect(state => ({
}), { fetchCollection })(withRouter(Site));
