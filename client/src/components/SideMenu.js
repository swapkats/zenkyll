import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import { Menu, Icon, Button, List, Layout, Dropdown, Card } from 'antd';
import './site.css';

const SubMenu = Menu.SubMenu;
const { Sider, Content, Header } = Layout;

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: props.initiallyCollapsed };
  }

  static defaultProps = {
    initiallyCollapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  componentWillReceiveProps(props) {
    const previouslyCollapsed = this.props.initiallyCollapsed;
    if (props.initiallyCollapsed != previouslyCollapsed) {
      this.setState({ collapsed: props.initiallyCollapsed });
    }
  }

  onTopMenuClick = (item) => {
    if (item.key == 'create-new') {
      this.props.history.push('/');
      return;
    }
    this.props.history.push('/site/' + item.key);
  }

  onSideMenuClick = item => {
    if (item.key) {
      const { site } = this.props.match.params;
      this.props.history.push(`/site/${site}/${item.key}`);
    }
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
    const { route, posts, loading, match } = this.props;
    const { collection = 'posts' } = match.params;
    const { collapsed } = this.state;
    return (
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
          defaultSelectedKeys={[collection]}
          mode="inline"
          className="top-menu"
          inlineCollapsed={collapsed}
          onClick={this.onSideMenuClick}
        >
            <Menu.Item key="history">
              <Icon type="clock-circle-o" />
              <span>History</span>
            </Menu.Item>
            <Menu.Item key="posts">
              <Icon type="copy" />
              <span>Posts</span>
            </Menu.Item>
            <Menu.Item key="drafts">
              <Icon type="edit" />
              <span>Drafts</span>
            </Menu.Item>
            <Menu.Item key="uploads">
              <Icon type="upload" />
              <span>Uploads</span>
            </Menu.Item>
            <Menu.Item key="settings">
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
    );
  }
}

export default connect(state => ({
  sites: state.user.sites,
}), { })(withRouter(SideMenu));
