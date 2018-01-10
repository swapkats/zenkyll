import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import SideMenu from './SideMenu';
import { Menu, Icon, Button, List, Layout, Dropdown, Card } from 'antd';
import './site.css';
import { fetchCollection } from '../actions/github';

const SubMenu = Menu.SubMenu;
const { Sider, Content, Header } = Layout;

class ListPage extends React.Component {
  componentWillMount() {
    let { site, collection } = this.props.match.params;
    collection = collection || 'posts';
    this.props.fetchCollection(collection, site);
  }

  componentWillReceiveProps(props) {
    const { site, collection } = props.match.params;
    const { loading, collections } = props;
    if (collection && !collections[collection] && !loading) {
      this.props.fetchCollection(collection, site);
    }
  }

  render() {
    const { route, collections, loading, match } = this.props;
    let { site, collection = 'posts', item } = match.params;
    const listItems = collections[collection] || [];
    return (
      <Card title={collection.toUpperCase()} className="post-list-card">
        <List
          className="post-list"
          itemLayout="horizontal"
          dataSource={listItems}
          loading={loading}
          renderItem={item => (
            <List.Item actions={[
              <a>{item.meta.published && collection !== 'drafts' ? 'unpublish' : 'publish'}</a>,
              <Link to={`/site/${site}/${collection}/${item.file.name}`}>edit</Link>
            ]}>
              <List.Item.Meta
                style={{flex: 1}}
                title={<Link to={`/site/${site}/${collection}/${item.file.name}`}>{item.meta.title}</Link>}
                description={moment(item.meta.date).format('LLLL')}
              />
            </List.Item>
          )}
        />
      </Card>
    );
  }
}

export default connect(state => ({
  loading: state.collections.loading,
  collections: state.collections,
}), { fetchCollection })(withRouter(ListPage));
