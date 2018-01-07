import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import url from 'url';
import { setGithubToken, fetchBranches } from '../actions/github';
import { Card, Form, Icon, Input, Button, Radio, AutoComplete, Spin } from 'antd';
import Auth from '../lib/github/AuthenticationPage';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class Connect extends Component {
  state = { scope: 'public_repo', hasAccess: false };

  componentWillMount() {
    const parsed = url.parse(window.location.href, true);
    const code = parsed.query && parsed.query.code;
    if (code) {
      this.setState({ hasAccess: true });
      this.props.setGithubToken(code, this.props.history);
    }
    // if (!this.props.sites.length) {
    //   this.props.history.push('/connect');
    // }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        this.props.handleConnect(values.email, values.password, this.props.history);
      }
    });
  }

  render() {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{display: 'flex', 'justifyContent': 'center', 'alignItems': 'center', background: '#fafafa', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
        <Card title="Connect a new repository" style={{ width: 300 }}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem>
              {getFieldDecorator('repoType', {
                initialValue: this.state.scope,
                rules: [{ required: true, message: 'Please select a repo type' }],
              })(
                <RadioGroup onChange={e => this.setState({ scope: e.target.value })}>
                  <Radio style={radioStyle} value={'public_repo'}>Public Repository</Radio>
                  <Radio style={radioStyle} value={'repo'}>Private/Organization Repository</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {!this.state.hasAccess &&
              <Auth
                scope={this.state.scope}
                clientId="2a162c4057c7c5b9e020"
                base_url="https://github.com/login/oauth/authorize"
              />}
            {this.state.hasAccess && !this.props.repos.length && <Spin />}
            {this.state.hasAccess && !!this.props.repos.length &&
              <div>
                <FormItem>
                  {getFieldDecorator('repo', {
                    rules: [{ required: true, message: 'Please select a repo' }],
                  })(
                    <AutoComplete
                      onChange={val => this.props.fetchBranches(val)}
                      dataSource={this.props.repos}
                      placeholder="Repository Name"
                      filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('branch', {
                    rules: [{ required: true, message: 'Please select a branch' }],
                  })(
                    <AutoComplete
                      dataSource={this.props.branches}
                      placeholder="Branch Name"
                      filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: 'Please input Name' }],
                  })(
                    <Input placeholder="Name of the site (eg. Portfolio)" />
                  )}
                </FormItem>
                <Button type="primary" htmlType="submit" style={{width: '100%'}}>Connect</Button>
              </div>}
            {/*  */}
          </Form>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    repos: state.repos.map(repo => repo.name),
    branches: state.branches.map(repo => repo.name)
  };
}
export default connect(mapStateToProps, { handleConnect: () => {}, setGithubToken, fetchBranches })(Form.create()(withRouter(Connect)));
