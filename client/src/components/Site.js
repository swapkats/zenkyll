import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import SideMenu from './SideMenu';
import { Menu, Icon, Button, List, Layout, Dropdown, Card } from 'antd';
import './site.css';
import { fetchCollection } from '../actions/github';

const SubMenu = Menu.SubMenu;
const { Sider, Content, Header } = Layout;

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  componentWillMount() {
    let { site, collection } = this.props.match.params;
    collection = collection || 'posts';
    this.props.fetchCollection(collection, site);
  }

  componentWillReceiveProps(props) {
    const { site, collection } = props.match.params;
    const { loading, collections } = props;
    console.log(collection && !collections[collection] && !loading)
    if (collection && !collections[collection] && !loading) {
      this.props.fetchCollection(collection, site);
    }
  }

  render() {
    const { route, collections, loading, match } = this.props;
    const { collapsed } = this.state;
    let { collection = 'posts' } = match.params;
    const listItems = collections[collection] || [];
    // console.log(loading);
    return (
      <Layout style={{height: '100%'}}>
        <SideMenu />
        <Layout>
          <Content>
            <Card title={collection.toUpperCase()} className="post-list-card">
              <List
                className="post-list"
                itemLayout="horizontal"
                dataSource={listItems}
                loading={loading}
                renderItem={item => (
                  <List.Item actions={[<a>{item.meta.published && collection !== 'drafts' ? 'unpublish' : 'publish'}</a>, <a>edit</a>]}>
                    <List.Item.Meta
                      style={{flex: 1}}
                      title={<a href={item.file.name}>{item.meta.title}</a>}
                      description={moment(item.meta.date).format('LLLL')}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default connect(state => ({
  loading: state.collections.loading,
  collections: state.collections,
}), { fetchCollection })(withRouter(Site));
