import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import { Menu, Icon, Button, List, Layout, Dropdown, Card } from 'antd';
import './site.css';
import { fetchPosts } from '../actions/github';

const SubMenu = Menu.SubMenu;
const { Sider, Content, Header } = Layout;

class Repos extends React.Component {
  state = {
    collapsed: false,
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  componentDidMount() {
    this.props.fetchPosts(this.props.match.params.site);
  }

  componentWillReceiveProps(props) {

  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  onTopMenuClick = (item) => {
    if (item.key == 'create-new') {
      this.props.history.push('/');
      return;
    }
    this.props.history.push('/site/' + item.key);
  }

  menu = (
    <Menu onClick={this.onTopMenuClick}>
      {this.props.sites.map(site => (
        <Menu.Item key={site.repo}>{site.repo}</Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="create-new">Create New Site</Menu.Item>
    </Menu>
  );

  render() {
    const { route, posts } = this.props;
    console.log(posts)
    const { collapsed } = this.state;
    return (
      <Layout style={{height: '100%'}}>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          className="sider"
        >
          <Dropdown overlay={this.menu} trigger={['click', 'hover']}>
            <div className={collapsed ? "dropdown-button hidden" : "dropdown-button"}>
              <div className="dropdown-text">
                {this.props.match.params.site}
              </div>
              <Icon type="down" />
            </div>
          </Dropdown>
          <Menu
            defaultSelectedKeys={['2']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            className="top-menu"
            inlineCollapsed={collapsed}
          >
              <Menu.Item key="1">
                <Icon type="clock-circle-o" />
                <span>History</span>
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="copy" />
                <span>Posts</span>
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="edit" />
                <span>Drafts</span>
              </Menu.Item>
              <Menu.Item key="4">
                <Icon type="upload" />
                <span>Uploads</span>
              </Menu.Item>
              <Menu.Item key="5">
                <Icon type="setting" />
                <span>Settings</span>
              </Menu.Item>
          </Menu>
          <Menu
            selectedKeys={[]}
            mode="inline"
            className="collapse-menu"
            onClick={this.toggle}
            inlineCollapsed={collapsed}
          >
            <Menu.Item key="1" >
              <Icon type={collapsed ? "menu-unfold" : "menu-fold"} />
              <span>{collapsed ? "Expand" : "Collapse"} Menu</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content>
            <Card className="post-list-card">
              <List
                className="post-list"
                // Add Loading
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={item => (
                  <List.Item actions={[<a>{item.meta.published ? 'unpublish' : 'publish'}</a>, <a>edit</a>]}>
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
  sites: state.user.sites,
  posts: state.collections.posts,
}), { fetchPosts })(withRouter(Repos));
