import React from 'react';
import axios from 'axios';
import { setFlash } from '../actions/flash';
import { setHeaders } from '../actions/headers';

const login = user => ({ type: 'LOGIN', user });

const logout = (history) => {
  history.push('/login');
  return { type: 'LOGOUT' };
};

export const registerUser = (email, password, passwordConfirmation, history) => (dispatch) => {
  axios.post('/api/auth', { email, password, password_confirmation: passwordConfirmation })
    .then((res) => {
      const { data: { data: user }, headers } = res;
      dispatch(login(user));
      dispatch(setHeaders(headers));
      history.push('/');
    })
    .catch((res) => {
      const messages =
          res.response.data.errors.full_messages.map(message =>
            <div>{message}</div>);
      const { headers } = res;
      dispatch(setHeaders(headers));
      dispatch(setFlash(messages, 'red'));
    });
};

export const handleLogout = history => (dispatch) => {
  axios.delete('/api/auth/sign_out')
    .then((res) => {
      const { headers } = res;
      dispatch(setHeaders(headers));
      dispatch(logout());
      dispatch(setFlash('Logged out successfully!', 'green'));
      history.push('/login');
    })
    .catch((res) => {
      const messages =
          res.response && res.response.data.errors.map(message =>
            <div>{message}</div>);
      const { headers } = res;
      dispatch(setHeaders(headers));
      dispatch(setFlash(messages, 'red'));
    });
};

export const handleLogin = (email, password, history) => (dispatch) => {
  axios.post('/api/auth/sign_in', { email, password })
    .then((res) => {
      const { data: { data: user }, headers } = res;
      dispatch(setHeaders(headers));
      dispatch(login(user));
      history.push('/');
    })
    .catch((res) => {
      const messages =
          res.response.data.errors.map(message =>
            <div>{message}</div>);
      const { headers } = res;
      dispatch(setHeaders(headers));
      dispatch(setFlash(messages, 'red'));
    });
};

export const validateToken = (callBack = () => {}, history) => (dispatch) => {
  dispatch({ type: 'VALIDATE_TOKEN' });
  const headers = axios.defaults.headers.common;
  axios.get('/api/auth/validate_token', headers)
    .then((res) => {
      const user = res.data.data;
      user.token = res.data.token;
      dispatch(setHeaders(res.headers));
      dispatch(login(user));
      callBack();
    })
    .catch(() => {
      dispatch(logout(history));
      callBack();
    });
};
