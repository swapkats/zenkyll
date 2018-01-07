import axios from 'axios';
import API from '../lib/github/API'

const setGithubToken = (token, history) => (dispatch) => {
  axios.post('api/v1/token', { provider: 'github', token })
    // .then(data => {
    //   console.log(data);
    // })
  dispatch(fetchRepos(token));
  dispatch(fetchUser(token));
}

const fetchUser = (token) => dispatch => {
  const api = new API({ token });
  api.user().then(data => {
    dispatch({
      type: 'UPDATE_USER',
      data,
    })
  }).catch(() => {
    dispatch({
      type: 'UNSET_TOKENS'
    })
  });;
}

const fetchRepos = (tokenParam) => (dispatch, getState) => {
  const state = getState();
  const { user: { tokens }} = state;

  const token = tokenParam || tokens[tokens.length-1].token;
  const api = new API({ token });

  dispatch(fetchUser(token));

  api.fetchRepos().then(data => {
    dispatch({
      type: 'UPDATE_REPOS',
      data,
    })
  }).catch(() => {
    dispatch({
      type: 'UNSET_TOKENS'
    })
  });
};


const fetchBranches = (branch) => (dispatch, getState) => {
  const state = getState();
  const { user: { login, tokens }} = state;

  const token = tokens[tokens.length-1].token;
  const api = new API({ token });

  api.fetchBranches(login, branch).then(data => {
    dispatch({
      type: 'UPDATE_BRANCHES',
      data,
    })
  }).catch(() => {
    dispatch({
      type: 'UNSET_TOKENS'
    })
  });
};

export { setGithubToken, fetchRepos, fetchBranches };
