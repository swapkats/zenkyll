import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { Menu, Icon, Button, Spin, Layout, Dropdown, Card } from 'antd';
import { fetchCollectionItem } from '../actions/github';
import './edit.css';
const { Content } = Layout;

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { form: {}};
  }

  componentDidMount() {
    const { site, collection, item } = this.props.match.params;
    this.props.fetchCollectionItem(site, collection, item);
  }

  onFormChange = (key, val) => {
    const { form } = this.state;
    form[key] = val;
    this.setState({ form });
  }

  static defaultProps = {
    loading: true,
  };

  render() {
    const { match, loading, meta = {} } = this.props;
    const { form } = this.state;
    if (loading && !!meta) { return <Spin style={{position: 'fixed', top: '50%', left: '50%'}} />; }
    return (
      <Layout>
        <Content>
          <input type="text" defaultValue={meta.title} value={form.title} onChange={e => this.onFormChange('title', e.target.value)} className="input-title"/>
        </Content>
      </Layout>
    );
  }
}

export default connect(state => ({
  loading: state.collections.loading,
  meta: state.collections.activeItem.meta,
}), { fetchCollectionItem })(withRouter(Edit));
