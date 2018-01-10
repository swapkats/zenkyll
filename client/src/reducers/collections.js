const collections = (state = { loading: false }, action) => {
  switch (action.type) {
    case 'COLLECTIONS_LOADING_START':
      return {
        ...state,
        loading: true,
      };
    case 'COLLECTIONS_LOADING_STOP':
      return {
        ...state,
        loading: false,
      };
    case 'UPDATE_COLLECTIONS_POSTS':
      return {
        ...state,
        [`${action.key}`]: action.data,
      };
    default:
      return state;
  }
};

export default collections;
