import React, { Component } from 'react';
import { connect } from 'react-redux';
import { registerUser } from '../actions/auth';
import { setFlash } from '../actions/flash';
import { Link, withRouter } from 'react-router-dom';
import { Card, Form, Icon, Input, Button } from 'antd';
const FormItem = Form.Item;

class Register extends Component {
  handleSubmit = event => {
    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      const { email, password, passwordConfirmation } = values;
      if (!err) {
        // console.log('Received values of form: ', values);
        if (password === passwordConfirmation) {
          this.props.registerUser(email, password, passwordConfirmation, this.props.history);
        } else this.props.setFlash('Passwords do not match!, please try again', 'red');
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{display: 'flex', 'justifyContent': 'center', 'alignItems': 'center', background: '#fafafa', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
        <Card title="Register" style={{ width: 300 }}>
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
              {getFieldDecorator('passwordConfirmation', {
                rules: [{ required: true, message: 'Please confirm your password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password Confirmation" />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={{width: '100%'}}>Submit</Button>
            </FormItem>
            Already registered? <Link to="/login">Login</Link>
          </Form>
        </Card>
      </div>
    );
  }
}

export default connect(()=>({}), { registerUser, setFlash })(Form.create()(withRouter(Register)));
