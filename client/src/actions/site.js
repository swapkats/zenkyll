import React from 'react';
import axios from 'axios';

export const createSite = (name, repo, branch, scope, history) => (dispatch) => {
  axios.post('/api/v1/site', { name, repo, branch, scope })
    .then((res) => {
      history.push(`/site/${repo}`)
    })
    .catch((res) => {

    });
};
