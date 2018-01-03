import React from 'react';
import axios from 'axios';
import { setFlash } from '../actions/flash';
import { setHeaders } from '../actions/headers';
import API from '../lib/github/API'
import cookie from '../lib/cookie';


const setGithubToken = (token, history) => (dispatch) => {
  cookie.set('GIT_TOKEN', token);
  dispatch(fetchUser());
  history.push('/repos');
}

const fetchUser = () => dispatch => {
  const token = cookie.get('GIT_TOKEN');
  const api = new API({ token });
  api.user().then(data => {
    dispatch({
      type: 'UPDATE_USER',
      data,
    })
  });
}

const fetchRepos = () => (dispatch, getState) => {
  const token = cookie.get('GIT_TOKEN');
  const api = new API({ token });

  dispatch(fetchUser());

  api.fetchRepos().then(data => {
    dispatch({
      type: 'UPDATE_REPOS',
      data,
    })
  });
};

export { setGithubToken, fetchRepos };
