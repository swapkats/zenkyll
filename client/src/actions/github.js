import axios from 'axios';
import API from '../lib/github/API'

const setGithubToken = (token, history) => (dispatch) => {
  dispatch(fetchUser(token));
  axios.post('api/v1/token', { provider: 'github', token })
  .then(data => {
    console.log(data);
  })
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

const fetchRepos = () => (dispatch, getState) => {
  const state = getState();
  const { user: { tokens }} = state;

  const token = tokens[0].token;
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

export { setGithubToken, fetchRepos };
