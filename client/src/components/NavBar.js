import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { handleLogout } from '../actions/auth';
import { Menu, Icon } from 'antd';
const MenuItemGroup = Menu.ItemGroup;

class NavBar extends Component {
  state = {
    current: 'home',
  }

  handleClick = (e) => {
    const { history, handleLogout } = this.props;

    this.setState({
      current: e.key,
    });

    switch(e.key) {
      case 'logout':
        handleLogout(history);
      default:
        return;
    }
  }

  render() {
    if (!this.props.user.id) { return null; }
    return (
      <Menu
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
      >
        <Menu.Item key="home">
          <Link to="/">
            <Icon type="home" />Home
          </Link>
        </Menu.Item>
        <Menu.Item key="logout" style={{float: 'right'}}>
          <Icon type="logout" />Logout
        </Menu.Item>
      </Menu>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default withRouter(connect(mapStateToProps, { handleLogout })(NavBar));
