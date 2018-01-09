const collections = (state = { posts: [] }, action) => {
  switch (action.type) {
    case 'UPDATE_COLLECTIONS_POSTS':
      return {
        ...state,
        posts: action.data,
      };
    default:
      return state;
  }
};

export default collections;
