import axios from 'axios';
import API from '../lib/github/API';
const reportError = err => {
  console.log(err)
  return;
};

const fetchUser = token => (dispatch) => {
  const api = new API({ token });
  api.user().then((data) => {
    dispatch({
      type: 'UPDATE_USER',
      data,
    });
  }).catch(reportError);
};

const fetchRepos = tokenParam => (dispatch, getState) => {
  const state = getState();
  let { user: { token } } = state;

  token = tokenParam || (!!token && token.token);

  if (!token) { return; }
  const api = new API({ token });

  dispatch(fetchUser(token));
  api.fetchRepos('/user/repos?type=all&sort=updated').then((data) => {
    dispatch({
      type: 'UPDATE_REPOS',
      data,
    });
  }).catch(reportError);
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
  }).catch(reportError);
};

const setGithubToken = (token, scope) => (dispatch) => {
  axios.post('api/v1/token', { provider: 'github', token, scope });
  // .then(data => {
  //   console.log(data);
  // })
  dispatch(fetchRepos(token));
  dispatch(fetchUser(token));
};

const fetchCollection = (collection, repo) => (dispatch, getState) => {
  const state = getState();
  const { user: { token: { token } } } = state;

  dispatch({
    type: 'COLLECTIONS_LOADING_START',
  });

  // token = tokenParam || (!!token && token.token);
  //
  // if(!token) { return; }
  const api = new API({ token, repo: `swapkats/${repo}` });
  api.getEntriesByFolder(`_${collection}`)
    .then((data) => {
      dispatch({
        type: 'UPDATE_COLLECTIONS_POSTS',
        key: collection,
        data,
      });
      dispatch({
        type: 'COLLECTIONS_LOADING_STOP',
      });
    }).catch(reportError);
};

const fetchCollectionItem = (repo, collection, item) => (dispatch, getState) => {
  const state = getState();
  const { user: { token: { token } } } = state;

  dispatch({
    type: 'COLLECTIONS_LOADING_START',
  });

  // token = tokenParam || (!!token && token.token);
  //
  // if(!token) { return; }
  const api = new API({ token, repo: `swapkats/${repo}` });
  api.getEntriesByFile(`_${collection}/${item}`)
    .then((data) => {
      dispatch({
        type: 'UPDATE_COLLECTIONS_ITEM',
        key: collection,
        data,
      });
      dispatch({
        type: 'COLLECTIONS_LOADING_STOP',
      });
    }).catch(reportError);
};

export { setGithubToken, fetchUser, fetchRepos, fetchBranches, fetchCollection, fetchCollectionItem };
