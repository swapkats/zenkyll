const collections = (state = { loading: false, activeItem: {} }, action) => {
  switch (action.type) {
    case 'COLLECTIONS_LOADING_START':
      return {
        ...state,
        loading: true,
      };
    case 'UPDATE_COLLECTIONS_ITEM':
      return {
        ...state,
        activeItem: action.data,
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
