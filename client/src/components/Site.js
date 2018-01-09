import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Menu, Icon, Button, Layout } from 'antd';
const SubMenu = Menu.SubMenu;
const { Sider, Content } = Layout;

class Repos extends Component {
  state = {
    collapsed: false,
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  componentWillMount() {
  }

  componentWillReceiveProps(props) {

  }

  render() {
    const { route } = this.props;
    return (
      <Layout style={{height: '100%'}}>
        <Sider>
          <Menu
            defaultSelectedKeys={['2']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            style={{ height: '100%'}}
            inlineCollapsed={this.state.collapsed}
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
          </Menu>
        </Sider>
        <Layout>
          <Content>
            
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default connect(state => ({
}), {  })(withRouter(Repos));
