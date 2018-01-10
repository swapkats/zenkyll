import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { Menu, Icon, Button, List, Layout, Dropdown, Card } from 'antd';
import './site.css';

class Edit extends React.Component {
  componentDidMount() {
    const { site, collection = 'posts', item } = this.props.match.params;

  }
  render() {
    const { match } = this.props;
    // console.log(loading);
    return (
      <h1>
        Edit
      </h1>
    );
  }
}

export default connect(state => ({
}), {  })(withRouter(Edit));
