import React, { Component } from 'react';
import { connect } from 'react-redux';
import { handleLogin } from '../actions/auth';
import { Link, withRouter } from 'react-router-dom';
import { Card, Form, Icon, Input, Button } from 'antd';
const FormItem = Form.Item;

class Login extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        this.props.handleLogin(values.email, values.password, this.props.history);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{display: 'flex', 'justifyContent': 'center', 'alignItems': 'center', background: '#fafafa', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
        <Card title="Login" style={{ width: 300 }}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem>
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please input your email!' }],
              })(
                <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
              )}

            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={{width: '100%'}}>Submit</Button>
            </FormItem>
              Or <Link to="/register">register now!</Link>
          </Form>
        </Card>
      </div>
    );
  }
}

export default connect(()=>({}), { handleLogin })(Form.create()(withRouter(Login)));
