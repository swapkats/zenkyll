const user = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN':
      return action.user;
    case 'LOGOUT':
      return {};
    case 'UPDATE_USER':
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
};

export default user;
