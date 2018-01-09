import axios from 'axios';
import API from '../lib/github/API';

const fetchUser = token => (dispatch) => {
  const api = new API({ token });
  api.user().then((data) => {
    dispatch({
      type: 'UPDATE_USER',
      data,
    });
  }).catch(() => {
    // dispatch({
    //   type: 'UNSET_TOKENS',
    // });
  });
};

const fetchRepos = tokenParam => (dispatch, getState) => {
  const state = getState();
  let { user: { token } } = state;

  token = tokenParam || (!!token && token.token);

  if(!token) { return; }
  const api = new API({ token });

  dispatch(fetchUser(token));
  api.fetchRepos('/user/repos?type=all&sort=updated').then((data) => {
    dispatch({
      type: 'UPDATE_REPOS',
      data,
    });
  }).catch(() => {
    // dispatch({
    //   type: 'UNSET_TOKENS',
    // });
  });
};


const fetchBranches = (token, branch) => (dispatch, getState) => {
  const state = getState();
  const { user: { login } } = state;
  const api = new API({ token });

  api.fetchBranches(login, branch).then((data) => {
    dispatch({
      type: 'UPDATE_BRANCHES',
      data,
    });
  }).catch(() => {
    // dispatch({
    //   type: 'UNSET_TOKENS',
    // });
  });
};

const setGithubToken = (token, scope) => (dispatch) => {
  axios.post('api/v1/token', { provider: 'github', token, scope });
  // .then(data => {
  //   console.log(data);
  // })
  dispatch(fetchRepos(token));
  dispatch(fetchUser(token));
};

const fetchPosts = (repo) => (dispatch, getState) => {
  const state = getState();
  const { user: { token: { token } } } = state;

  // token = tokenParam || (!!token && token.token);
  //
  // if(!token) { return; }
  const api = new API({ token, repo: 'swapkats/'+repo });
  api.listFiles('_posts')
    .then(data => {
      console.log(data);
    })
};

export { setGithubToken, fetchUser, fetchRepos, fetchBranches, fetchPosts };
