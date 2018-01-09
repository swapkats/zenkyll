const user = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN':
      return action.user;
    case 'LOGOUT':
      return {};
    // case 'UNSET_TOKENS':
    //   return {
    //     ...state,
    //     tokens: false,
    //   }
    case 'UPDATE_USER':
      return {
        ...state,
        ...action.data,
        email: state.email,
      };
    default:
      return state;
  }
};

export default user;
